#include "ios_network_settings.h"
#import <Foundation/Foundation.h>
#include <spdlog/spdlog.h>
#include <stdexcept>

namespace {
constexpr int server_slots = 5;
NSString* const initialized_key = @"fanmade.network.initialized";
NSArray<NSString*>* server_fields() {
    return @[@"enabled", @"name", @"base_url", @"username", @"password", @"http_proxy"];
}
NSString* key_for(int slot, NSString* field) {
    return [NSString stringWithFormat:@"fanmade.server.%d.%@", slot, field];
}
NSString* ns_string(const std::string& value) {
    return [[NSString alloc] initWithBytes:value.data() length:value.size() encoding:NSUTF8StringEncoding];
}

// The same reader is exercised against an isolated defaults suite in tests.
class SettingsStore {
    NSUserDefaults* defaults;
    NSString* domain;
public:
    SettingsStore(NSUserDefaults* value, NSString* domain_name, NSString* directory)
        : defaults(value), domain(domain_name) {
        NSMutableDictionary* initial = [NSMutableDictionary dictionary];
        for (int page = 0; page <= server_slots; ++page) {
            NSString* file = page == 0 ? @"Root.plist" : [NSString stringWithFormat:@"Server%d.plist", page];
            NSDictionary* schema = [NSDictionary dictionaryWithContentsOfFile:[directory stringByAppendingPathComponent:file]];
            if (!schema) throw std::runtime_error("iOS Settings.bundle is missing or invalid");
            for (NSDictionary* spec in schema[@"PreferenceSpecifiers"]) {
                if (spec[@"Key"] && spec[@"DefaultValue"])
                    initial[spec[@"Key"]] = spec[@"DefaultValue"];
            }
        }
        // Settings.app defaults are not automatically registered for the app.
        [defaults registerDefaults:initial];
    }
    bool initialized() const {
        NSDictionary* saved = [defaults persistentDomainForName:domain];
        if ([saved[initialized_key] boolValue]) return true;
        // A user may configure Settings.app before the first game launch.
        for (int slot = 1; slot <= server_slots; ++slot)
            for (NSString* field in server_fields())
                if (saved[key_for(slot, field)]) return true;
        return false;
    }
    void initialize(const std::vector<fanmade::ServerConfig>& legacy) {
        if (initialized()) return;
        if (legacy.size() > server_slots)
            spdlog::warn("iOS Settings supports {} online servers; {} additional TOML entries were not imported",
                         server_slots, legacy.size() - server_slots);
        for (size_t i = 0; i < legacy.size() && i < server_slots; ++i) {
            const auto& server = legacy[i];
            int slot = static_cast<int>(i) + 1;
            [defaults setBool:YES forKey:key_for(slot, @"enabled")];
            auto save = [&](NSString* field, const std::string& text) {
                NSString* value = ns_string(text);
                [defaults setObject:value ?: @"" forKey:key_for(slot, field)];
                [value release];
            };
            save(@"name", server.name); save(@"base_url", server.base_url);
            save(@"username", server.username); save(@"password", server.password);
            save(@"http_proxy", server.http_proxy);
        }
        [defaults setBool:YES forKey:initialized_key];
    }
    std::vector<fanmade::ServerConfig> servers() const {
        std::vector<fanmade::ServerConfig> result;
        for (int slot = 1; slot <= server_slots; ++slot) {
            if (![defaults boolForKey:key_for(slot, @"enabled")]) continue;
            auto read = [&](NSString* field) -> std::string {
                id value = [defaults objectForKey:key_for(slot, field)];
                if (![value isKindOfClass:[NSString class]]) return {};
                NSData* utf8 = [value dataUsingEncoding:NSUTF8StringEncoding];
                if (!utf8.length) return {};
                return {static_cast<const char*>(utf8.bytes), utf8.length};
            };
            result.push_back({read(@"name"), read(@"base_url"), read(@"username"),
                              read(@"password"), read(@"http_proxy")});
        }
        return result;
    }
};
SettingsStore app_settings() {
    NSBundle* bundle = [NSBundle mainBundle];
    return SettingsStore([NSUserDefaults standardUserDefaults], bundle.bundleIdentifier,
                         [bundle.resourcePath stringByAppendingPathComponent:@"Settings.bundle"]);
}
}

bool ios_network_settings_need_migration() {
    @autoreleasepool { return !app_settings().initialized(); }
}
void ios_initialize_network_settings(const std::vector<fanmade::ServerConfig>& legacy) {
    @autoreleasepool { app_settings().initialize(legacy); }
}
std::vector<fanmade::ServerConfig> ios_network_servers() {
    @autoreleasepool { return app_settings().servers(); }
}
