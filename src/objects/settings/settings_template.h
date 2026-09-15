#pragma once

#include <rapidjson/document.h>
#include <string_view>

// Installed skins keep their own templates across game updates.
inline void remove_legacy_network_settings(rapidjson::Document& tmpl) {
    for (auto category = tmpl.MemberBegin(); category != tmpl.MemberEnd();) {
        auto& value = category->value;
        if (!value.IsObject() || !value.HasMember("options") ||
            !value["options"].IsObject() || value["options"].ObjectEmpty()) {
            ++category;
            continue;
        }
        auto& options = value["options"];
        for (auto option = options.MemberBegin(); option != options.MemberEnd();) {
            const auto& opt = option->value;
            const std::string_view path = opt.IsObject() && opt.HasMember("path") && opt["path"].IsString()
                ? std::string_view(opt["path"].GetString(), opt["path"].GetStringLength()) : std::string_view{};
            if (path == "network/access_code" || path == "network/online_play" || path == "network/sync_scores")
                option = options.EraseMember(option);
            else
                ++option;
        }
        // Keep originally empty categories, such as the Exit action.
        if (options.ObjectEmpty()) category = tmpl.EraseMember(category);
        else ++category;
    }
}
