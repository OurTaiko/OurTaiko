#pragma once

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

struct Exam {
    std::string type;   // "gauge","combo","judgebad","judgegood","judgeperfect","hit","score"
    int red = 0;
    int gold = 0;
    std::string range;  // "less" or "more"
    bool gothrough = true;
    // Per-song borders (dan.json value = [[red, gold], ...], one pair per song): the
    // cabinet's per-song conditions carry a different threshold for each of the three
    // songs. Empty for the usual course-wide pair; red/gold above then hold song 1's.
    std::vector<int> song_red;
    std::vector<int> song_gold;
    // An omitted gold border means "perfect": 0 for a less exam, 100 % gauge, every note
    // for good / hit / combo. Stored as GOLD_FULL and resolved where the note count is known.
    static constexpr int GOLD_FULL = -1;
    bool perfect_gold = false; // Resolved perfect border may equal the red border.
    bool per_song() const { return !song_red.empty(); }
    // The exam as it applies to song i: red/gold swapped for that song's pair.
    Exam for_song(int i) const {
        Exam ex = *this;
        if (per_song() && i >= 0 && i < (int)song_red.size()) {
            ex.red  = song_red[i];
            ex.gold = i < (int)song_gold.size() ? song_gold[i] : song_red[i];
        }
        // the view of one song is a plain pair again (captions print a single number)
        ex.song_red.clear();
        ex.song_gold.clear();
        return ex;
    }
};

inline std::string dan_bar_state(const Exam& exam, int value,
                                 bool live = false,
                                 bool near_end = false,
                                 bool just_before_end = false) {
    const bool down = (exam.range == "less");
    // CheckMax
    if (exam.gold > 0 && (exam.gold != exam.red || exam.perfect_gold) && ((down && value < exam.gold) || (!down && value >= exam.gold))) {
        if (!live || !down) return "max";
        if (just_before_end) return "max_soon2";
        if (near_end)        return "max_soon";
        // fall through to the flat palette -- no `max` during play
    }
    int gauge = (exam.red > 0)
        ? (int)std::floor(100.0 * (double)value / (double)exam.red) : 100;
    if (gauge > 100) gauge = 100;
    if (down) { gauge = 100 - gauge; if (gauge < 0) gauge = 0; }
    if (gauge <= 0) return "empty";
    if (!down) {
        if (gauge <= 49) return "up_50";
        if (gauge <= 99) return "up_80";
        return "up_100";
    }
    const int good = (exam.red > 0 && exam.gold > 0)
        ? 100 - (int)std::floor(100.0 * (double)exam.gold / (double)exam.red) : 100;
    if (gauge < 30)    return "down_80";
    if (gauge <= good) return "up_80";
    return "down_100";
}

inline Exam resolve_dan_exam(const Exam& exam, int song_idx, int total_notes,
                             const std::vector<int>& song_note_counts) {
    Exam ex = song_idx >= 0 ? exam.for_song(song_idx) : exam;
    if (ex.gold != Exam::GOLD_FULL) return ex;
    ex.perfect_gold = true;
    if (ex.range == "less") {
        ex.gold = 1;                                   // gold = none at all (value < 1)
    } else if (ex.type == "gauge") {
        ex.gold = 100;
    } else if (ex.type == "judgeperfect" || ex.type == "hit" || ex.type == "combo") {
        int notes = total_notes;
        if (song_idx >= 0 && song_idx < (int)song_note_counts.size()) notes = song_note_counts[song_idx];
        ex.gold = std::max(ex.red, notes);              // every note
    } else {
        ex.gold = ex.red;                               // score / renda: no perfect value, no gold tier
        ex.perfect_gold = false;
    }
    return ex;
}

inline int dan_exam_tier(const Exam& exam, int value) {
    const bool has_gold = exam.gold > 0 && (exam.gold != exam.red || exam.perfect_gold);
    if (exam.range == "less") {
        if (value >= exam.red) return 0;
        return has_gold && value < exam.gold ? 2 : 1;
    }
    if (value < exam.red) return 0;
    return has_gold && value >= exam.gold ? 2 : 1;
}
