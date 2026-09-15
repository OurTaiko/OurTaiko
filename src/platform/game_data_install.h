#pragma once

#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <string>

namespace game_data {
namespace fs = std::filesystem;

inline void write_marker(const fs::path& path, const std::string& value) {
    auto temporary = path;
    temporary += ".tmp";
    std::ofstream output(temporary, std::ios::trunc);
    output << value;
    output.close();
    if (!output) throw std::runtime_error("Cannot save game data completion marker");
    fs::rename(temporary, path);
}

inline void copy_tree(const fs::path& source, const fs::path& destination, bool overwrite) {
    fs::create_directories(destination);
    for (const auto& entry : fs::recursive_directory_iterator(source)) {
        auto target = destination / entry.path().lexically_relative(source);
        if (entry.is_directory()) {
            fs::create_directories(target);
        } else if (entry.is_regular_file()) {
            if (fs::exists(target) && !fs::is_regular_file(target))
                throw std::runtime_error("Expected a game data file: " + target.string());
            if (!overwrite && fs::exists(target)) continue;
            // A failed copy cannot leave a partial final file that retry skips.
            auto temporary = destination / ".game-data-copy.tmp";
            try {
                fs::copy_file(entry.path(), temporary, fs::copy_options::overwrite_existing);
                if (overwrite || !fs::exists(target)) fs::rename(temporary, target);
                else fs::remove(temporary);
            } catch (...) {
                std::error_code ignored;
                fs::remove(temporary, ignored);
                throw;
            }
        }
    }
}

inline void install(const fs::path& resources, const fs::path& destination) {
    fs::create_directories(destination);
    const auto marker = destination / ".game-data-installed";
    const auto shader_marker = destination / ".game-shaders-source";
    // The build hashes shaders once; runtime reads only the small version token.
    // Even resource-only app updates refresh shaders without scanning skins.
    std::ifstream shader_version(resources / ".shader-version");
    std::string bundle;
    if (!std::getline(shader_version, bundle) || bundle.empty())
        throw std::runtime_error("Missing bundled shader version");
    std::ifstream saved_shader_source(shader_marker);
    std::string previous_bundle;
    std::getline(saved_shader_source, previous_bundle);
    if (!fs::is_regular_file(marker)) {
        copy_tree(resources, destination, false);
        copy_tree(resources / "shader", destination / "shader", true);
        fs::create_directories(destination / "Songs");
        write_marker(shader_marker, bundle);
        write_marker(marker, "installed\n");
    } else if (previous_bundle != bundle) {
        copy_tree(resources / "shader", destination / "shader", true);
        write_marker(shader_marker, bundle);
    }
}
} // namespace game_data
