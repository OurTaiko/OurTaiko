#include "../../src/libs/dan_exam_json.h"
#include <cassert>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <iterator>

static Exam parse(const char* json) {
    rapidjson::Document doc;
    doc.Parse(json);
    assert(!doc.HasParseError());
    return parse_dan_exam(doc);
}

int main(int argc, char** argv) {
    Exam nested = parse(R"({"type":"judgeperfect","range":"more","value":[[100,120],[200],[300,350]],"gothrough":true})");
    assert(nested.per_song() && !nested.gothrough);
    assert(nested.for_song(1).red == 200 && !nested.for_song(1).per_song());
    const std::vector<int> notes{150, 250, 400};
    auto first = resolve_dan_exam(nested, 0, 800, notes);
    auto second = resolve_dan_exam(nested, 1, 800, notes);
    assert(second.gold == 250);
    assert(dan_exam_tier(first, 99) == 0);
    assert(dan_exam_tier(first, 100) == 1);
    assert(dan_exam_tier(first, 120) == 2);
    assert(dan_exam_tier(second, 120) == 0);
    assert(dan_exam_tier(second, 249) == 1);
    assert(dan_exam_tier(second, 250) == 2);
    assert(dan_bar_state(second, 250) == "max");

    auto legacy = parse(R"({"type":"renda","range":"more","value":[10,20],"gothrough":false})");
    assert(!legacy.gothrough && !legacy.per_song());
    assert(resolve_dan_exam(legacy, 2, 800, notes).red == 10);
    auto course = parse(R"({"type":"judgeperfect","range":"more","value":[600]})");
    assert(course.gothrough);
    assert(resolve_dan_exam(course, -1, 800, notes).gold == 800);
    auto less = resolve_dan_exam(parse(R"({"type":"judgebad","range":"less","value":[10]})"), -1, 800, notes);
    assert(less.gold == 1);
    assert(dan_exam_tier(less, 0) == 2 && dan_exam_tier(less, 1) == 1);
    assert(dan_exam_tier(less, 10) == 0);
    assert(dan_bar_state(less, 0) == "max");
    auto gauge = resolve_dan_exam(parse(R"({"type":"gauge","range":"more","value":[90]})"), -1, 800, notes);
    assert(gauge.gold == 100 && dan_exam_tier(gauge, 100) == 2);
    auto score = resolve_dan_exam(parse(R"({"type":"score","range":"more","value":[100]})"), -1, 800, notes);
    assert(dan_exam_tier(score, 1000) == 1);
    assert(dan_bar_state(score, 1000) != "max");
    auto perfect_gauge = resolve_dan_exam(parse(R"({"type":"gauge","range":"more","value":[100]})"), -1, 800, notes);
    assert(dan_exam_tier(perfect_gauge, 100) == 2);
    auto no_bad = resolve_dan_exam(parse(R"({"type":"judgebad","range":"less","value":[1]})"), -1, 800, notes);
    assert(dan_exam_tier(no_bad, 0) == 2);
    assert(parse(R"({"type":"renda","range":"more","value":[100,50]})").gold == Exam::GOLD_FULL);
    assert(parse(R"({"type":"judgebad","range":"less","value":[10,20]})").gold == Exam::GOLD_FULL);

    for (auto json : {R"({})", R"({"type":"hit","range":"more","value":[]})",
                     R"({"type":"hit","range":"more","value":[[10],null,[30]]})"}) {
        bool rejected = false;
        try { parse(json); } catch (const std::invalid_argument&) { rejected = true; }
        assert(rejected); // Never shift song 3's border into song 2's slot.
    }

    int courses = 0;
    if (argc > 1) for (const auto& entry : std::filesystem::recursive_directory_iterator(argv[1])) {
        if (entry.path().filename() != "dan.json") continue;
        std::ifstream input(entry.path());
        std::string json{std::istreambuf_iterator<char>(input), {}};
        rapidjson::Document doc;
        doc.Parse(json.c_str());
        assert(!doc.HasParseError());
        for (auto& value : doc["exams"].GetArray()) {
            const Exam exam = parse_dan_exam(value);
            assert(exam.gothrough && !exam.per_song());
            assert(exam.red == value["value"][0].GetInt());
            const int gold = value["value"][1].GetInt();
            const bool wrong_side = exam.range == "less" ? gold > exam.red : gold < exam.red;
            assert(exam.gold == (wrong_side ? Exam::GOLD_FULL : gold));
        }
        ++courses;
    }
    std::cout << "PASS: per-song/legacy exams, gold borders, malformed pairs; " << courses << " bundled courses\n";
}
