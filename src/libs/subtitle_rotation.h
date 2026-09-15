#pragma once

#include <cmath>

// Empty fields do not consume a slot. Each nonempty field gets three seconds.
inline bool show_maker_credit(bool has_subtitle, bool has_maker, double elapsed_ms) {
    if (!has_maker) return false;
    if (!has_subtitle) return true;
    return elapsed_ms >= 0 && std::fmod(elapsed_ms, 6000.0) >= 3000.0;
}
