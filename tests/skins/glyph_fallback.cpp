#include "../../src/libs/text.h"
#include <cassert>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <set>

// A font with only ASCII basics and 戯: raylib returns one owned image for every
// requested glyph it has, including duplicates. No graphics context is needed.
static std::set<void*> live_images;
static int fallback_calls = 0;
static ray::Image new_image() {
    void* p = std::malloc(1);
    assert(live_images.insert(p).second);
    return {p, 1, 1, 1, ray::PIXELFORMAT_UNCOMPRESSED_GRAYSCALE};
}
namespace ray {
GlyphInfo* LoadFontData(const unsigned char*, int, int, const int* cps, int n, int, int* count) {
    std::set<int> unique;
    std::vector<GlyphInfo> out;
    for (int i = 0; i < n; ++i) {
        assert(unique.insert(cps[i]).second); // A shared fallback form is rasterized once.
        if (cps[i] == 0x622f) ++fallback_calls;
        if (cps[i] == 'A' || cps[i] == '?' || cps[i] == ' ' || cps[i] == 0x622f) {
            GlyphInfo glyph{};
            glyph.value = cps[i];
            glyph.image = new_image();
            out.push_back(glyph);
        }
    }
    *count = (int)out.size();
    if (out.empty()) return nullptr;
    auto* data = (GlyphInfo*)std::malloc(out.size()*sizeof(GlyphInfo));
    std::memcpy(data, out.data(), out.size()*sizeof(GlyphInfo));
    return data;
}
Image ImageCopy(Image) { return new_image(); }
void UnloadImage(Image image) {
    assert(live_images.erase(image.data) == 1);
    std::free(image.data);
}
void UnloadTexture(Texture2D) {}
int GetCodepointNext(const char* text, int* size) {
    const auto* p = (const unsigned char*)text;
    if (p[0] < 0x80) { *size = 1; return p[0]; }
    *size = 3;
    return ((p[0]&15)<<12) | ((p[1]&63)<<6) | (p[2]&63);
}
}
int main() {
    for (bool warm : {false, true}) {
        FontManager manager;
        if (warm) manager.register_text("A", 24);
        const int before = fallback_calls;
        manager.register_text("戏戲", 24);
        assert(fallback_calls == before + 1);
        assert(live_images.size() == 5); // Basics plus independently owned originals.
        manager.register_text("戏戲", 24);
        assert(fallback_calls == before + 1);
        manager.unload();
        assert(live_images.empty());
    }
    std::cout << "PASS: shared glyph fallback, image ownership, missing-only batch, repeated registration\n";
}
