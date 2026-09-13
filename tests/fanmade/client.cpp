#include "../../src/libs/fanmade.h"
#include <chrono>
#include "../../src/libs/parsers/tja.h"
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <thread>
#include <stdexcept>
using namespace fanmade;
void check(bool condition,const char* message) { if(!condition) throw std::runtime_error(message); }
std::string read_file(const fs::path& path) { std::ifstream f(path); return {std::istreambuf_iterator<char>(f),{}}; }
void parser_tests() {
    check(sha256("abc")=="ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad","SHA-256 vector");
    Chart c; c.titles["en"]="Renamed"; c.subtitles["zh"]="中文副标题";
    c.difficulties[3]=Difficulty{"Oni",8,2,true,""};
    auto tja=playable_tja("TITLE:Original\nBPM:120\nWAVE:../external.ogg\nBGMOVIE:/secret.mp4\nCOURSE:Oni\nLEVEL:8\nSTYLE:Double\n#START P1\n1111,\n#END\n#START P2\n2222,\n#END\nCOURSE:Oni\nLEVEL:8\nBALLOON:3,4\n#START\n1234,\n#END\n",c);
    check(tja.find("1234,")!=std::string::npos && tja.find("1111,")==std::string::npos && tja.find("2222,")==std::string::npos,"select exact single block");
    check(tja.find("BALLOON:3,4")!=std::string::npos && tja.find("BGMOVIE")==std::string::npos && tja.find("../external")==std::string::npos,"gameplay headers and confined assets");
    check(tja.find("TITLE:Renamed")!=std::string::npos && tja.find("SUBTITLEZH:中文副标题")!=std::string::npos,"metadata overrides");
    c.difficulties[3]=Difficulty{"Oni",8,0,false,"P1"};
    c.blocks={*c.difficulties[3],Difficulty{"Oni",8,1,false,"P2"}};
    auto dual=playable_tja("COURSE:Oni\nLEVEL:8\n#START P1\n1111,\n#END\n#START P2\n2222,\n#END\n",c);
    check(dual.find("#START P1")!=std::string::npos && dual.find("#START P2")!=std::string::npos,"retain double lanes");
    c.difficulties[3]->block_index=7;
    bool rejected=false; try { playable_tja("COURSE:Oni\n#START\n1,\n#END\n",c); } catch(...) { rejected=true; }
    check(rejected,"reject missing block");
}
int main(int argc,char** argv) {
 try {
    parser_tests();
    if(argc<3) { std::cout<<"parser checks passed\n"; return 0; }
    std::string base=argv[1]; fs::path cache=argv[2];
    bool real=argc>3;
    std::string username=real?std::getenv("FANMADE_TEST_USERNAME"):"fixture";
    std::string password=real?std::getenv("FANMADE_TEST_PASSWORD"):"fixture-password";
    std::vector<ServerConfig> configs{{"OurTaiko Fanmade",base,username,password,""}};
    if(!real) configs.push_back({"Second server",base+"/second",username,password,base});
    Client client; client.bootstrap(configs,cache);
    check(client.online(),client.status().c_str());
    auto roots=client.song_paths({}); check(roots.size()==1,"catalog root");
    std::vector<fs::path> paths;
    for(auto& f:fs::recursive_directory_iterator(roots[0])) if(f.path().extension()==".tja") paths.push_back(f.path());
    check(paths.size()>=(real?1u:2u),"all server catalogs");
    for(auto& path:paths) {
        auto chart=client.chart(path); check(chart.has_value(),"registered chart");
        if(!real) check(client.best(path,3)->score==(chart->title=="Second"?700000:900000),"server score isolation");
    }
    auto path=paths.front();
    auto cancelled=std::make_shared<std::atomic_bool>(true);
    bool cancellation_worked=false;
    try { client.prepare(path,cancelled); } catch(const std::exception&) { cancellation_worked=true; }
    check(cancellation_worked,"cancelled download must not start");
    auto playable=client.prepare(path);
    check(fs::exists(playable)&&fs::exists(playable.parent_path()/"audio.ogg"),"assets ready");
    TJAParser parsed(playable);
    for(int i=0;i<5;i++) if(client.chart(path)->difficulties[i]) {
        auto [notes, normal, expert, master] = parsed.notes_to_position(i);
        check(!notes.notes.empty(), "actual game parser produced empty notes");
    }
    auto first=fs::last_write_time(playable.parent_path()/"audio.ogg");
    client.prepare(path);
    check(fs::last_write_time(playable.parent_path()/"audio.ogg")==first,"hash hit avoids download");
    { std::ofstream file(playable.parent_path()/"audio.ogg",std::ios::trunc); file<<"corrupted"; }
    client.prepare(path);
    check(sha256(read_file(playable.parent_path()/"audio.ogg"))==client.chart(path)->audio_hash,"corruption repaired");
    auto chart=client.chart(path); int diff=3;
    if(real) {
        diff=-1; for(int i=0;i<5;i++) if(chart->difficulties[i]&&chart->difficulties[i]->cloud) { diff=i; break; }
        check(diff>=0,"single difficulty available");
    }
    Score score; score.good=12; score.ok=3; score.bad=1; score.score=999999; score.drumroll=9;
    client.submit(playable,diff,score);
    for(int n=0;n<40;n++) {
        client.update(); auto best=client.best(path,diff);
        if(best&&best->score==score.score) break;
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
    }
    if (!real && (!client.best(path,diff) || client.best(path,diff)->score!=score.score)) {
        // Fixture commits the first request but returns 500. A new client must
        // replay the durable queue with the original key and recover one score.
        Client resumed; resumed.bootstrap(configs,cache);
        for(int n=0;n<100;n++) {
            resumed.update(); auto best=resumed.best(path,diff);
            if(best&&best->score==score.score) break;
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
        }
        check(resumed.best(path,diff)&&resumed.best(path,diff)->score==score.score,"durable idempotent retry after restart");
    } else {
        check(client.best(path,diff)&&client.best(path,diff)->score==score.score,client.status().c_str());
    }
    if(!real) {
        Score double_score=score; client.submit(playable,2,double_score);
        check(!client.best(path,2),"double scores excluded");
    }
    std::cout<<"PASS: catalog, isolated scores, download, cache hit, corruption recovery, score submission\n";
 } catch(const std::exception& e) { std::cerr<<"FAIL: "<<e.what()<<"\n"; return 1; }
}
