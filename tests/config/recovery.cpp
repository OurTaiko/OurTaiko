#include "../../src/libs/config.h"
#include <fstream>
#include <iostream>
#ifdef OURTAIKO_PLATFORM_IOS
#include "../../src/platform/ios_network_settings.h"
bool ios_network_settings_need_migration() { return false; }
void ios_initialize_network_settings(const std::vector<fanmade::ServerConfig>&) {}
std::vector<fanmade::ServerConfig> ios_network_servers() { return {}; }
#endif

void check(bool condition, const char* message) {
    if (!condition) throw std::runtime_error(message);
}
void write(const fs::path& path, const std::string& text) { std::ofstream(path) << text; }
std::string read(const fs::path& path) {
    std::ifstream input(path);
    return {std::istreambuf_iterator<char>(input), std::istreambuf_iterator<char>()};
}
void check_defaults(const Config& config) {
#if defined(PLATFORM_ANDROID) || defined(OURTAIKO_PLATFORM_IOS)
    check(config.general.touch_input && config.video.vsync, "Mobile defaults enable touch and vsync");
#else
    check(!config.general.touch_input, "Desktop defaults keep touch disabled");
#endif
    check(config.general.audio_offset == 0, "Discard all partial settings");
    check(config.paths.tja_path == std::vector<fs::path>{"Songs"}, "Default song path");
    check(config.keys_1p.left_don == std::vector<int>{'F'}, "Default keyboard mapping");
    check(config.gamepad_1p.left_don == std::vector<int>{16}, "Default gamepad mapping");
    check(config.general.player_2_id == 2 && config.audio.buffer_size == 128, "Complete defaults");
}
int main(int argc, char** argv) {
    if (argc != 2) return 2;
    fs::current_path(argv[1]);
    check_defaults(get_config());
    check(fs::exists("config.toml") && !fs::exists("config.toml.bak"), "Missing settings saved without backup");
    check_defaults(get_config());
    const std::string invalids[] = {
        "[general]\naudio_offset = 99\ntouch_input = [",
        "[general]\naudio_offset = 99\ntouch_input = 'yes'",
        "[general]\naudio_offset = 99\n[keys]\nexit_key = 'not a key'",
        "[general]\naudio_offset = 99\n[keys_1p]\nleft_don = [123]",
        "[general]\naudio_offset = 99\n[gamepad_2p]\nleft_don = ['bad']",
        "[general]\naudio_offset = 99\n[paths]\ntja_path = [false]",
        "[general]\naudio_offset = 99\n[network]\nservers = [42]",
        "general = false"
    };
    fs::path backup = "config.toml";
    for (const auto& invalid : invalids) {
        const auto old_backup = backup;
        backup += ".bak";
        const auto old = read(old_backup);
        write("config.toml", invalid);
        check_defaults(get_config());
        check(read(backup) == invalid, "Backup retains exact broken contents");
        if (old_backup != "config.toml") check(read(old_backup) == old, "Earlier backups preserved");
        check_defaults(get_config());
        check(!fs::exists(backup.string() + ".bak"), "Recovered settings parse on restart");
    }
    write("config.toml", "[general]\ntouch_input = false\naudio_offset = 42\n[gamepad]\nleft_don = [7]\n");
    auto custom = get_config();
    check(!custom.general.touch_input && custom.general.audio_offset == 42, "Valid explicit settings respected");
    check(custom.gamepad_1p.left_don == std::vector<int>{7}, "Legacy gamepad preserved");
    const auto ordinary = read("config.toml");
    write("dev-config.toml", "broken = [");
    check_defaults(get_config());
    check(read("config.toml") == ordinary, "Recovery writes the selected dev config only");
    check(read("dev-config.toml.bak") == "broken = [", "Dev config backed up");
    check_defaults(get_config());
    std::cout << "PASS: defaults, recovery, exact backups, repeat load, types, invalid keys, dev config, legacy gamepad\n";
}
