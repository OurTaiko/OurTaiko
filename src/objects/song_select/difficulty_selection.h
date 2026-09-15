#pragma once

#include "../../libs/global_data.h"
#include <algorithm>

namespace song_select_difficulty {

inline bool has(const std::vector<Difficulty>& diffs, Difficulty difficulty) {
    return std::find(diffs.begin(), diffs.end(), difficulty) != diffs.end();
}

inline bool ura_mode(const std::vector<Difficulty>& diffs, bool preferred) {
    return has(diffs, Difficulty::URA) && (preferred || !has(diffs, Difficulty::ONI));
}

// Oni and Edit share a column. A standalone Edit is always visible.
inline std::vector<Difficulty> visible(const std::vector<Difficulty>& diffs, bool ura) {
    std::vector<Difficulty> result;
    ura = ura_mode(diffs, ura);
    for (Difficulty d : diffs) {
        if (d == Difficulty::ONI && ura) continue;
        if (d == Difficulty::URA && !ura) continue;
        result.push_back(d);
    }
    return result;
}

inline Difficulty initial(const std::vector<Difficulty>& diffs, int last) {
    if (last < (int)Difficulty::EASY) return Difficulty::BACK;
    const Difficulty desired = (Difficulty)std::min(last, (int)Difficulty::ONI);
    Difficulty pick = Difficulty::BACK;
    for (Difficulty d : diffs) {
        if (d < Difficulty::EASY || d > Difficulty::URA) continue;
        if (std::min(d, Difficulty::ONI) <= desired) pick = d;
    }
    if (pick == Difficulty::BACK) {
        for (Difficulty d : diffs) {
            if (d >= Difficulty::EASY && d <= Difficulty::URA) return d;
        }
    }
    return pick;
}

} // namespace song_select_difficulty
