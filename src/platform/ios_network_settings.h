#pragma once
#include "../libs/fanmade.h"

// Only the initial upgrade imports TOML. Subsequent iOS reads use Settings.app.
bool ios_network_settings_need_migration();
void ios_initialize_network_settings(const std::vector<fanmade::ServerConfig>& legacy);
std::vector<fanmade::ServerConfig> ios_network_servers();
