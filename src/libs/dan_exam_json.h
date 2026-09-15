#pragma once

#include "dan_exam.h"
#include <stdexcept>
#include <rapidjson/document.h>

inline Exam parse_dan_exam(const rapidjson::Value& e) {
    if (!e.IsObject() || !e.HasMember("type") || !e["type"].IsString() ||
        !e.HasMember("range") || !e["range"].IsString() ||
        !e.HasMember("value") || !e["value"].IsArray() || e["value"].Empty())
        throw std::invalid_argument("Invalid dan exam");
    Exam exam;
    exam.type  = e["type"].GetString();
    exam.range = e["range"].GetString();
    if (e["value"][0].IsArray()) {
        // per-song borders: [[red, gold], [red, gold], [red, gold]] (gold optional)
        for (auto& pair : e["value"].GetArray()) {
            if (!pair.IsArray() || pair.Empty() || !pair[0].IsInt())
                throw std::invalid_argument("Invalid per-song dan border");
            const int red  = pair[0].GetInt();
            const int gold = pair.Size() >= 2 && pair[1].IsInt() ? pair[1].GetInt() : Exam::GOLD_FULL;
            exam.song_red.push_back(red);
            exam.song_gold.push_back(gold);
        }
        if (!exam.song_red.empty()) { exam.red = exam.song_red[0]; exam.gold = exam.song_gold[0]; }
    } else if (e["value"][0].IsInt()) {
        exam.red  = e["value"][0].GetInt();
        exam.gold = e["value"].Size() >= 2 && e["value"][1].IsInt() ? e["value"][1].GetInt() : Exam::GOLD_FULL;
    }
    if (exam.song_red.empty() && !e["value"][0].IsInt())
        throw std::invalid_argument("Invalid dan border");
    // A gold on the wrong side of red is invalid. Resolve it like an omitted
    // border: perfect where defined, otherwise no separate gold tier.
    auto sane = [&](int red, int gold) {
        if (gold == Exam::GOLD_FULL) return gold;
        const bool bad = exam.range == "less" ? gold > red : gold < red;
        return bad ? Exam::GOLD_FULL : gold;
    };
    for (size_t i = 0; i < exam.song_gold.size(); i++) exam.song_gold[i] = sane(exam.song_red[i], exam.song_gold[i]);
    exam.gold = sane(exam.red, exam.gold);
    // Nested pairs always select per-song judging. Older charts may reuse one
    // flat pair for every song with gothrough=false; keep that format working.
    exam.gothrough = !exam.per_song();
    if (!exam.per_song() && e.HasMember("gothrough") && e["gothrough"].IsBool())
        exam.gothrough = e["gothrough"].GetBool();
    return exam;
}
