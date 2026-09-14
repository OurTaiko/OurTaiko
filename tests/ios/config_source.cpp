#include "../../src/libs/config.h"
#include <fstream>
#include <iostream>
#include <stdexcept>
#ifdef PLATFORM_IOS
#include "../../src/platform/ios_network_settings.h"
static bool needs_migration = false;
static std::vector<fanmade::ServerConfig> imported;
bool ios_network_settings_need_migration() { return needs_migration; }
void ios_initialize_network_settings(const std::vector<fanmade::ServerConfig>& legacy) {
    imported=legacy; needs_migration=false;
}
std::vector<fanmade::ServerConfig> ios_network_servers() {
    return {{"System Settings", "https://system.invalid", "system-user", "system-password", ""}};
}
#endif
void check(bool value,const char* message) { if(!value) throw std::runtime_error(message); }
int main(int argc,char** argv) {
    if(argc!=2) return 2;
    fs::current_path(argv[1]);
    try {
        {std::ofstream f("config.toml"); f<<R"([general]
audio_offset = 42
[[network.servers]]
name = 'TOML'
base_url = 'https://toml.invalid'
username = 'toml-user'
password = 'toml-password'
http_proxy = 'http://127.0.0.1:3128'
)";}
        auto config=get_config();
        check(config.general.audio_offset==42,"non-network settings stay in TOML");
#ifdef PLATFORM_IOS
        check(config.network.servers.size()==1 && config.network.servers[0].username=="system-user","iOS exclusively reads system settings");
        check(imported.empty(),"initialized iOS never imports TOML");
        needs_migration=true;
        config=get_config();
        check(imported.size()==1 && imported[0].username=="toml-user","first migration receives existing TOML configuration");
#else
        check(config.network.servers.size()==1 && config.network.servers[0].username=="toml-user","other platforms read TOML");
#endif
        save_config(config);
        auto saved=toml::parse_file("config.toml");
#ifdef PLATFORM_IOS
        check(!saved.contains("network"),"iOS does not copy system passwords back into TOML");
#else
        check(saved["network"]["servers"][0]["password"].value_or(std::string{})=="toml-password","other platforms preserve network configuration when saving");
#endif
        check(saved["general"]["audio_offset"].value_or(0)==42,"ordinary save retains game settings");
        std::cout<<"PASS: configuration platform routing and save isolation\n";
    } catch(const std::exception& error) {std::cerr<<"FAIL: "<<error.what()<<"\n";return 1;}
}
