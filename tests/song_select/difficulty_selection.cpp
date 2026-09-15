#include "../../src/objects/song_select/difficulty_selection.h"
#include <cassert>
#include <iostream>

using D = Difficulty;
namespace selection = song_select_difficulty;

int main() {
    const std::vector<D> edit{D::URA};
    assert(selection::ura_mode(edit, false));
    assert(selection::visible(edit, false) == edit);
    for (int last = 0; last <= 4; ++last)
        assert(selection::initial(edit, last) == D::URA);
    assert(selection::initial(edit, -1) == D::BACK);

    const std::vector<D> easy_edit{D::EASY, D::URA};
    assert(selection::visible(easy_edit, false) == easy_edit);
    assert(selection::initial(easy_edit, 0) == D::EASY);
    assert(selection::initial(easy_edit, 3) == D::URA);

    const std::vector<D> pair{D::ONI, D::URA};
    assert(selection::visible(pair, false) == std::vector<D>{D::ONI});
    assert(selection::visible(pair, true) == edit);
    const std::vector<D> sparse{D::NORMAL, D::ONI, D::URA};
    assert((selection::visible(sparse, true) == std::vector<D>{D::NORMAL, D::URA}));
    assert(!selection::ura_mode({D::ONI}, true));
    assert(selection::initial({}, 4) == D::BACK);

    // Every ordinary course combination, both column modes and all remembered
    // levels: retain every available lower course and exactly one Oni/Edit card.
    for (int mask = 0; mask < 32; ++mask) {
        std::vector<D> courses;
        for (int d = 0; d < 5; ++d)
            if (mask & (1 << d)) courses.push_back((D)d);
        for (bool ura : {false, true}) {
            auto visible = selection::visible(courses, ura);
            const bool both = (mask & 24) == 24;
            assert(visible.size() == courses.size() - (both ? 1 : 0));
            for (D d : visible) assert(selection::has(courses, d));
            for (int d = 0; d < 3; ++d)
                assert(selection::has(visible, (D)d) == bool(mask & (1 << d)));
            for (int last = 0; last < 5; ++last) {
                D initial = selection::initial(visible, last);
                assert(visible.empty() ? initial == D::BACK : selection::has(visible, initial));
            }
        }
    }
    std::cout << "PASS: Edit-only, sparse courses, mode reset, and all 32 course combinations\n";
}
