#pragma once

#include "han_fold_table.h"

// The shinjitai form of a simplified / traditional character, or `cp` itself when the
// table has no entry (binary search: the table is sorted by `from`).
inline uint32_t han_fold_codepoint(uint32_t cp) {
    size_t lo = 0, hi = HAN_FOLD_TABLE_SIZE;
    while (lo < hi) {
        size_t mid = (lo + hi) / 2;
        if (HAN_FOLD_TABLE[mid].from < cp) lo = mid + 1;
        else hi = mid;
    }
    return (lo < HAN_FOLD_TABLE_SIZE && HAN_FOLD_TABLE[lo].from == cp) ? HAN_FOLD_TABLE[lo].to : cp;
}
