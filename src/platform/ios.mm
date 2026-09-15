#include "ios.h"
#include "game_data_install.h"
#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#include <spdlog/spdlog.h>
#include <chrono>
#include <filesystem>
#include <mutex>
#include <stdexcept>

namespace {
std::mutex clock_mutex;
bool suspended = false;
double paused_at = 0;
double paused_duration = 0;

double monotonic_ms() {
    return std::chrono::duration<double, std::milli>(
        std::chrono::steady_clock::now().time_since_epoch()).count();
}
}

double ios_game_time_ms() {
    std::lock_guard<std::mutex> lock(clock_mutex);
    return (suspended ? paused_at : monotonic_ms()) - paused_duration;
}

void ios_set_suspended(bool value) {
    std::lock_guard<std::mutex> lock(clock_mutex);
    if (value == suspended) return;
    if (value) paused_at = monotonic_ms();
    else paused_duration += monotonic_ms() - paused_at;
    suspended = value;
}

bool ios_is_suspended() {
    std::lock_guard<std::mutex> lock(clock_mutex);
    return suspended;
}

void ios_request_audio_buffer() {
    @autoreleasepool {
        NSError* error = nil;
        if (![[AVAudioSession sharedInstance] setPreferredIOBufferDuration:0.005 error:&error]) {
            spdlog::warn("iOS latency: buffer preference rejected: {}", error.localizedDescription.UTF8String);
        }
    }
}


void ios_prepare_filesystem() {
    namespace fs = std::filesystem;
    @autoreleasepool {
        NSURL* documents = [[[NSFileManager defaultManager]
            URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] firstObject];
        if (!documents) throw std::runtime_error("Cannot locate iOS Documents directory");
        fs::path destination(documents.fileSystemRepresentation);
        fs::path resources([NSBundle mainBundle].resourcePath.fileSystemRepresentation);
        resources /= "GameData";
        game_data::install(resources, destination);
        fs::current_path(destination);
    }
}
