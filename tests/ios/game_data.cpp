#include "../../src/platform/game_data_install.h"
#include <iostream>
using namespace game_data;
void check(bool value, const char* message) { if (!value) throw std::runtime_error(message); }
std::string read(const fs::path& path) {
    std::ifstream input(path);
    return {std::istreambuf_iterator<char>(input), std::istreambuf_iterator<char>()};
}
int main(int argc, char** argv) {
    if (argc != 2) return 2;
    const fs::path root(argv[1]), source = root / "bundle", target = root / "documents";
    fs::create_directories(source / "shader/es");
    fs::create_directories(source / "Skins/test");
    std::ofstream(source / ".shader-version") << "v1";
    std::ofstream(source / "shader/es/test") << "shader-v1";
    std::ofstream(source / "Skins/test/asset") << "skin";
    std::ofstream(source / "config.toml") << "default";
    install(source, target);
    check(read(target / "Skins/test/asset") == "skin", "Initial copy");
    std::ofstream(target / "config.toml") << "custom";
    fs::remove(target / "Skins/test/asset");
    // Only the version token remains: repeat launch cannot traverse resources.
    const auto updated = root / "updated-bundle";
    fs::rename(source, updated);
    fs::create_directory(source);
    fs::copy_file(updated / ".shader-version", source / ".shader-version");
    install(source, target);
    check(!fs::exists(target / "Skins/test/asset"), "No repeated resource scan");
    std::ofstream(updated / "shader/es/test") << "shader-v2";
    std::ofstream(updated / ".shader-version") << "v2";
    install(updated, target);
    check(read(target / "shader/es/test") == "shader-v2", "Refresh executable shaders on update");
    check(!fs::exists(target / "Skins/test/asset"), "Update does not scan skins");
    check(read(target / "config.toml") == "custom", "Preserve configuration");
    fs::remove(target / ".game-data-installed");
    fs::create_directory(target / "Skins/test/asset");
    try { install(updated, target); throw std::logic_error("Expected copy failure"); }
    catch (const std::runtime_error&) {}
    check(!fs::exists(target / ".game-data-installed"), "Failure leaves setup incomplete");
    fs::remove(target / "Skins/test/asset");
    install(updated, target);
    check(read(target / "Skins/test/asset") == "skin", "Retry fills missing resource");
    check(read(target / "config.toml") == "custom", "Migration preserves user files");
    std::cout << "PASS: iOS install once, zero repeated traversal, shader update, migration, failure/retry\n";
}
