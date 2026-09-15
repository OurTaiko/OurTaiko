#include "../../src/libs/global_data.h"
#include "../../src/objects/game/exam_caption.h"
#include <cassert>
#include <iostream>

GlobalData global_data;
static void load(TexID id) {
    tex.textures[(uint32_t)id] = std::make_shared<TextureObject>("fixture", 1, 1);
}
int main() {
    Config config;
    config.general.language = "zh";
    global_data.config = &config;
    assert(!tex.has_texture("combo/combo_zh"));
    load(COMBO::COMBO_EN);
    assert(tex.has_texture("combo/combo_zh"));
    assert(tex.get_enum("combo/combo_zh") == COMBO::COMBO_EN);
    load(COMBO::COMBO_JA);
    assert(tex.get_enum("combo/combo_zh") == COMBO::COMBO_JA);
    config.general.language = "en";
    assert(tex.get_enum("combo/combo_en") == COMBO::COMBO_EN);
    tex.textures.erase((uint32_t)COMBO::COMBO_EN);
    assert(tex.get_enum("combo/combo_en") == COMBO::COMBO_JA);
    assert(!tex.has_texture("combo/unrelated_name"));
    assert(tex.language_variants("combo/unrelated_name") == std::vector<std::string>{"combo/unrelated_name"});
    config.general.language = "zh_tw";
    assert(tex.get_enum("combo/combo_zh_tw") == COMBO::COMBO_JA);
    load(DAN_INFO::EXAM_DRUMROLL);
    assert(exam_icon_id(DAN_INFO::EXAM_ROLL, "dan_info") == DAN_INFO::EXAM_DRUMROLL);
    assert(exam_icon_id(DAN_INFO::EXAM_GAUGE, "dan_info") == DAN_INFO::EXAM_GAUGE);
    load(DAN_INFO::EXAM_ROLL);
    assert(exam_icon_id(DAN_INFO::EXAM_ROLL, "dan_info") == DAN_INFO::EXAM_ROLL);
    tex.unload_textures();
    assert(!tex.has_texture("combo/combo_zh_tw"));
    global_data.config = nullptr;
    std::cout << "PASS: loaded texture fallback, locale order, skin unload, drumroll-only substitution\n";
}
