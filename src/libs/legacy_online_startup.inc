// Archived legacy integration, retained for reference. Not included by the game.
// Config fields referenced below have been removed from the active game.
    const bool net_ok = network.probe_online();
    if (net_ok && global_data.config->network.access_code.empty()) {
        std::string access_code = network.register_user(scores_manager.player_1_data.username);
        if (!access_code.empty()) {
            global_data.config->network.access_code = access_code;
            save_config(*global_data.config);
        }
    }

    if (net_ok && !global_data.config->network.access_code.empty() &&
        network.check_import_requested(global_data.config->network.access_code)) {
        spdlog::info("hiroba requested a score import, exporting scores.db");
        scores_manager.export_to_hiroba(global_data.config->network.access_code, scores_manager.player_1);
        network.clear_import_flag(global_data.config->network.access_code);
    }

    if (net_ok && !global_data.config->network.access_code.empty()) {
        ray::Color chara_color_1, chara_color_2, chara_color_3;
        if (network.fetch_chara_colors(global_data.config->network.access_code, chara_color_1, chara_color_2, chara_color_3)) {
            scores_manager.player_1_data.chara_color_1 = chara_color_1;
            scores_manager.player_1_data.chara_color_2 = chara_color_2;
            scores_manager.player_1_data.chara_color_3 = chara_color_3;
            scores_manager.save_player_data(scores_manager.player_1_data);
        }

        std::string server_username;
        if (network.fetch_username(global_data.config->network.access_code, server_username) &&
            !server_username.empty() && server_username != scores_manager.player_1_data.username) {
            scores_manager.player_1_data.username = server_username;
            scores_manager.save_player_data(scores_manager.player_1_data);
        }

        std::string server_title;
        if (network.fetch_title(global_data.config->network.access_code, server_title) &&
            !server_title.empty() && server_title != scores_manager.player_1_data.title) {
            scores_manager.player_1_data.title = server_title;
            scores_manager.save_player_data(scores_manager.player_1_data);
        }

        int server_title_bg;
        if (network.fetch_title_bg(global_data.config->network.access_code, server_title_bg) &&
            server_title_bg != scores_manager.player_1_data.title_bg) {
            scores_manager.player_1_data.title_bg = server_title_bg;
            scores_manager.save_player_data(scores_manager.player_1_data);
        }

        int head_index, body_index, cos_index;
        bool is_costume;
        if (network.fetch_costume(global_data.config->network.access_code, head_index, body_index, cos_index, is_costume) &&
            (head_index != scores_manager.player_1_data.chara_head_index ||
             body_index != scores_manager.player_1_data.chara_body_index ||
             cos_index != scores_manager.player_1_data.chara_cos_index ||
             is_costume != scores_manager.player_1_data.chara_is_costume)) {
            scores_manager.player_1_data.chara_head_index = head_index;
            scores_manager.player_1_data.chara_body_index = body_index;
            scores_manager.player_1_data.chara_cos_index = cos_index;
            scores_manager.player_1_data.chara_is_costume = is_costume;
            scores_manager.save_player_data(scores_manager.player_1_data);
        }

        if (global_data.config->network.sync_scores) {
            scores_manager.sync_from_server(global_data.config->network.access_code);
        }
    }

// Former SongSelectScreen remote song-jump helper.
void SongSelectScreen::poll_song_jump(double current_ms) {
    static constexpr double SONG_JUMP_POLL_INTERVAL_MS = 3000.0;
    const std::string& access_code = global_data.config->network.access_code;

    if (!access_code.empty() && state == SongSelectState::BROWSING &&
        current_ms - last_song_jump_poll_ms >= SONG_JUMP_POLL_INTERVAL_MS) {
        last_song_jump_poll_ms = current_ms;
        network.poll_song_jump(access_code);
    }

    if (auto hash = network.take_song_jump_result()) {
        navigator.jump_to_song(*hash);
    }
}
