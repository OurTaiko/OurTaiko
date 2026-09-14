#include "fanmade.h"
#include "sha256.h"
#include <algorithm>
#include <atomic>
#include <chrono>
#include <fstream>
#include <future>
#include <mutex>
#include <random>
#include <sstream>
#include <stdexcept>
#include <tuple>
#include <rapidjson/document.h>
#include <rapidjson/stringbuffer.h>
#include <rapidjson/writer.h>
#if defined(FANMADE_NETWORK)
#include <cpr/cpr.h>
#endif
#if defined(_WIN32)
#define NOMINMAX
#include <windows.h>
#elif defined(__APPLE__) || (defined(__unix__) && !defined(__ANDROID__))
#include <iconv.h>
#endif

namespace fanmade {
namespace {
const std::array<std::string,5> courses{"Easy","Normal","Hard","Oni","Edit"};
std::string trim(std::string s) {
    auto begin=s.find_first_not_of(" \t\r\n"), end=s.find_last_not_of(" \t\r\n");
    return begin==std::string::npos ? "" : s.substr(begin,end-begin+1);
}
std::string upper(std::string s) { for(auto& c:s) if(c>='a'&&c<='z') c-=32; return s; }
std::string line_text(std::string s) { for(auto& c:s) if(c=='\n'||c=='\r'||c=='\0') c=' '; return s; }
std::string path_key(const fs::path& p) { return fs::absolute(p).lexically_normal().generic_string(); }
std::string read(const fs::path& p) {
    std::ifstream in(p,std::ios::binary); if(!in) throw std::runtime_error("CACHE_READ_FAILED");
    return std::string(std::istreambuf_iterator<char>(in),{});
}
void write(const fs::path& p,const std::string& bytes) {
    fs::create_directories(p.parent_path());
    fs::path temp=p; temp += ".part";
    { std::ofstream out(temp,std::ios::binary|std::ios::trunc); out.write(bytes.data(),bytes.size()); out.flush(); if(!out) throw std::runtime_error("CACHE_WRITE_FAILED"); }
#ifdef _WIN32
    // MoveFileEx replaces the destination atomically on Windows as well.
    if(!MoveFileExW(temp.c_str(),p.c_str(),MOVEFILE_REPLACE_EXISTING|MOVEFILE_WRITE_THROUGH)) throw std::runtime_error("CACHE_RENAME_FAILED");
#else
    fs::rename(temp,p);
#endif
}
bool hex_id(const std::string& s,size_t length) { return s.size()==length && s.find_first_not_of("0123456789abcdef")==std::string::npos; }
std::string str(const rapidjson::Value& v,const char* key) {
    if(!v.IsObject()||!v.HasMember(key)||!v[key].IsString()) throw std::runtime_error("API_STRING_INVALID");
    return {v[key].GetString(),v[key].GetStringLength()};
}
int64_t number(const rapidjson::Value& v,const char* key) {
    if(!v.IsObject()||!v.HasMember(key)||!v[key].IsInt64()||v[key].GetInt64()<0) throw std::runtime_error("API_NUMBER_INVALID");
    return v[key].GetInt64();
}
rapidjson::Document json(const std::string& text) {
    rapidjson::Document d; d.Parse(text.data(),text.size());
    if(d.HasParseError()||!d.IsObject()) throw std::runtime_error("API_JSON_INVALID"); return d;
}
std::string encode(const rapidjson::Value& d) { rapidjson::StringBuffer b; rapidjson::Writer<rapidjson::StringBuffer> w(b); d.Accept(w); return b.GetString(); }
void put(rapidjson::Document& d,const char* k,const std::string& v) { d.AddMember(rapidjson::Value(k,d.GetAllocator()),rapidjson::Value(v.c_str(),v.size(),d.GetAllocator()),d.GetAllocator()); }
void put(rapidjson::Document& d,const char* k,int64_t v) { d.AddMember(rapidjson::Value(k,d.GetAllocator()),rapidjson::Value(v),d.GetAllocator()); }
Score score_from(const rapidjson::Value& v) {
    Score s; s.id=str(v,"id"); s.song=str(v,"songId"); s.version=str(v,"versionId"); s.difficulty=str(v,"difficulty");
    s.good=number(v,"good"); s.ok=number(v,"ok"); s.bad=number(v,"bad"); s.score=number(v,"score"); s.drumroll=number(v,"drumroll");
    s.max_combo=number(v,"max_combo");
    return s;
}
Chart chart_from(const rapidjson::Value& v,const std::string& server) {
    Chart c; c.server=server; c.id=str(v,"id"); c.version=str(v,"versionId"); c.title=str(v,"title"); c.subtitle=str(v,"subtitle");
    c.tja_hash=str(v,"tjaHash"); c.audio_hash=str(v,"audioHash"); c.encoding=str(v,"encoding");
    if(!hex_id(c.id,32)||!hex_id(c.version,32)||!hex_id(c.tja_hash,64)||!hex_id(c.audio_hash,64)) throw std::runtime_error("API_ID_INVALID");
    c.titles["en"]=c.title; c.subtitles["en"]=c.subtitle;
    for(auto pair:{std::make_pair("titleTranslations",&c.titles),std::make_pair("subtitleTranslations",&c.subtitles)}) {
        if(!v.HasMember(pair.first)||!v[pair.first].IsObject()) throw std::runtime_error("API_TRANSLATIONS_INVALID");
        for(auto& m:v[pair.first].GetObject()) if(m.value.IsString()) (*pair.second)[m.name.GetString()]=m.value.GetString();
    }
    if(!v.HasMember("bpm")||!v["bpm"].IsNumber()||!v.HasMember("demoStart")||!v["demoStart"].IsNumber()) throw std::runtime_error("API_METADATA_INVALID");
    c.bpm=v["bpm"].GetDouble(); c.demo_start=v["demoStart"].GetDouble();
    if(!v.HasMember("difficulties")||!v["difficulties"].IsArray()) throw std::runtime_error("API_DIFFICULTIES_INVALID");
    for(auto& d:v["difficulties"].GetArray()) {
        auto name=str(d,"course"); auto it=std::find(courses.begin(),courses.end(),name); if(it==courses.end()) continue;
        auto& slot=c.difficulties[it-courses.begin()];
        if(!d.HasMember("cloudScoreEligible")||!d["cloudScoreEligible"].IsBool()) throw std::runtime_error("API_DIFFICULTY_INVALID");
        auto level=number(d,"level"), block=number(d,"blockIndex");
        if(level>100||block>100000) throw std::runtime_error("API_DIFFICULTY_INVALID");
        bool cloud=d["cloudScoreEligible"].GetBool();
        Difficulty diff{name,(int)level,(int)block,cloud,str(d,"player")};
        c.blocks.push_back(diff);
        if(!slot || (!slot->cloud&&cloud)) slot=diff;
    }
    return c;
}
std::string title_headers(const Chart& c) {
    std::string out;
    for(auto pair:{std::make_pair("TITLE",&c.titles),std::make_pair("SUBTITLE",&c.subtitles)})
        for(auto& [lang,value]:*pair.second) {
            if(lang!="en"&&lang!="ja"&&lang!="zh"&&lang!="ko") continue;
            out+=std::string(pair.first)+(lang=="en"?"":upper(lang))+":"+line_text(value)+"\n";
        }
    return out;
}
std::string to_utf8(const std::string& bytes,const std::string& encoding) {
    if(encoding=="utf-8") return bytes;
    if(encoding!="shift-jis") throw std::runtime_error("TJA_ENCODING_UNSUPPORTED");
#ifdef _WIN32
    int n=MultiByteToWideChar(932,0,bytes.data(),(int)bytes.size(),nullptr,0);
    if(n<=0) throw std::runtime_error("TJA_ENCODING_INVALID");
    std::wstring wide(n,L'\0'); MultiByteToWideChar(932,0,bytes.data(),(int)bytes.size(),wide.data(),n);
    n=WideCharToMultiByte(CP_UTF8,0,wide.data(),(int)wide.size(),nullptr,0,nullptr,nullptr);
    std::string out(n,'\0'); WideCharToMultiByte(CP_UTF8,0,wide.data(),(int)wide.size(),out.data(),n,nullptr,nullptr); return out;
#elif defined(__APPLE__) || (defined(__unix__) && !defined(__ANDROID__))
    iconv_t converter=iconv_open("UTF-8","CP932");
    if(converter==(iconv_t)-1) throw std::runtime_error("TJA_ENCODING_UNSUPPORTED");
    std::string out(bytes.size()*4+16,'\0'); size_t in_left=bytes.size(),out_left=out.size();
    char* in=const_cast<char*>(bytes.data()); char* dest=out.data();
    auto result=iconv(converter,&in,&in_left,&dest,&out_left); iconv_close(converter);
    if(result==(size_t)-1||in_left) throw std::runtime_error("TJA_ENCODING_INVALID"); out.resize(out.size()-out_left); return out;
#else
    throw std::runtime_error("SHIFT_JIS_UNSUPPORTED_ON_THIS_PLATFORM");
#endif
}
struct HttpError:std::runtime_error { int status; explicit HttpError(int s):runtime_error("HTTP_"+std::to_string(s)),status(s){} };
struct Endpoint {
    ServerConfig config;
    std::string id,token;
    std::mutex http_mutex;
    bool connected=false;
    std::vector<Score> scores;
    std::map<std::tuple<std::string,std::string,std::string>,Score> best_scores;
    void index_score(const Score& score) {
        auto key=std::make_tuple(score.song,score.version,score.difficulty);
        auto it=best_scores.find(key);
        if(it==best_scores.end()||score.score>it->second.score) best_scores[key]=score;
    }
};
#if defined(FANMADE_NETWORK)
std::string request(Endpoint& e,const std::string& path,const std::string& body="",const std::string& key="",size_t limit=64*1024*1024, std::shared_ptr<std::atomic_bool> cancel={}) {
    if(cancel && *cancel) throw std::runtime_error("DOWNLOAD_CANCELLED");
    cpr::Session s;
    if(cancel) s.SetCancellationParam(cancel);
    s.SetUrl(cpr::Url{e.config.base_url+path});
    s.SetTimeout(cpr::Timeout{path.find("/versions/")==std::string::npos?15000:120000});
    s.SetConnectTimeout(cpr::ConnectTimeout{5000});
    s.SetRedirect(cpr::Redirect{false});
    // Explicit empty proxies also disable libcurl's environment proxy fallback.
    s.SetProxies(cpr::Proxies{{"http",e.config.http_proxy},{"https",e.config.http_proxy}});
    if(!e.config.http_proxy.empty()) curl_easy_setopt(s.GetCurlHolder()->handle, CURLOPT_NOPROXY, "");
    cpr::Header headers{{"Accept","application/json"}};
    if(!e.token.empty()) headers["Authorization"]="Bearer "+e.token;
    if(!body.empty()) { headers["Content-Type"]="application/json"; s.SetBody(cpr::Body{body}); }
    if(!key.empty()) headers["Idempotency-Key"]=key;
    s.SetHeader(headers);
    std::string bytes;
    s.SetWriteCallback(cpr::WriteCallback{[&](std::string_view part,intptr_t) {
        if(part.size()>limit-bytes.size()) return false; bytes.append(part); return true;
    }});
    auto r=body.empty()?s.Get():s.Post();
    if(r.error.code!=cpr::ErrorCode::OK) throw std::runtime_error("NETWORK_OR_SIZE_ERROR");
    if(r.status_code<200||r.status_code>=300) throw HttpError((int)r.status_code);
    return bytes;
}
#else
std::string request(Endpoint&,const std::string&,const std::string& ="",const std::string& ="",size_t =64*1024*1024, std::shared_ptr<std::atomic_bool> ={}) { throw std::runtime_error("FANMADE_NETWORK_DISABLED"); }
#endif
void login(Endpoint& e) {
    rapidjson::Document d; d.SetObject(); put(d,"username",e.config.username); put(d,"password",e.config.password);
    e.token.clear(); auto reply=json(request(e,"/api/v1/game/login",encode(d))); e.token=str(reply,"accessToken");
    if(!hex_id(e.token,64)) throw std::runtime_error("API_TOKEN_INVALID");
}
std::string authorized(Endpoint& e,const std::string& path,const std::string& body="",const std::string& key="", std::shared_ptr<std::atomic_bool> cancel={}) {
    try { return request(e,path,body,key,64*1024*1024,cancel); }
    catch(const HttpError& err) { if(err.status!=401) throw; login(e); return request(e,path,body,key,64*1024*1024,cancel); }
}
std::string random_key() {
    std::random_device r; std::string bytes; for(int i=0;i<8;i++) bytes+=std::to_string(r()); return sha256(bytes);
}
}

std::string sha256(const std::string& bytes) { return crypto::to_hex(crypto::sha256(bytes)); }

std::string playable_tja(const std::string& utf8,const Chart& chart) {
    std::istringstream input(utf8.substr(utf8.compare(0,3,"\xef\xbb\xbf")==0?3:0));
    std::vector<std::string> globals,headers; std::string line,body,output=title_headers(chart)+"WAVE:audio.ogg\n";
    bool in_block=false,seen_course=false; int block=-1; std::map<int,Difficulty> wanted; std::map<int,bool> found;
    for(auto& d:chart.difficulties) if(d) {
        wanted[d->block_index]=*d;
        if(!d->cloud) for(auto& other:chart.blocks)
            if(other.course==d->course) wanted[other.block_index]=other;
    }
    auto header=[](const std::string& line) {
        auto key=upper(trim(line.substr(0,line.find(':'))));
        return key.rfind("TITLE",0)!=0&&key.rfind("SUBTITLE",0)!=0&&key!="WAVE"&&key!="BGMOVIE"&&key!="PREIMAGE"&&key!="COURSE"&&key!="LEVEL"&&key!="STYLE";
    };
    while(std::getline(input,line)) {
        line=trim(line.substr(0,line.find("//"))); if(line.empty()) continue;
        auto key=upper(trim(line.substr(0,line.find(':'))));
        if(line.rfind("#START",0)==0) { in_block=true; block++; body.clear(); continue; }
        if(line=="#END") {
            if(in_block&&wanted.count(block)) {
                auto d=wanted.at(block);
                output+="COURSE:"+d.course+"\nLEVEL:"+std::to_string(d.level)+"\nSTYLE:"+(d.cloud?"Single":"Double")+"\n";
                for(auto& h:globals) if(header(h)) output+=h+"\n";
                for(auto& h:headers) if(header(h)) output+=h+"\n";
                output+="#START"+(d.player.empty()?std::string{}:" "+d.player)+"\n"+body+"#END\n"; found[block]=true;
            }
            in_block=false; continue;
        }
        if(in_block) { body+=line+"\n"; continue; }
        if(key=="COURSE") { seen_course=true; headers.clear(); continue; }
        (seen_course?headers:globals).push_back(line);
    }
    if(found.size()!=wanted.size()||in_block) throw std::runtime_error("TJA_BLOCK_MISMATCH");
    return output;
}

struct Client::Impl {
    mutable std::mutex mutex;
    std::mutex prepare_mutex;
    std::mutex pump_mutex;
    std::atomic<bool> bootstrapping{false};
    std::atomic<uint64_t> revision{0};
    fs::path cache,root;
    std::map<std::string,std::shared_ptr<Endpoint>> endpoints;
    std::map<std::string,Chart> charts;
    std::string message;
    std::future<void> uploads;
    std::chrono::steady_clock::time_point retry{};
    void status(const std::string& s) { std::lock_guard lock(mutex); message=s; }
    void drain() {
        for(auto& [id,e]:endpoints) {
            auto folder=cache/"pending"/id; if(!fs::exists(folder)) continue;
            for(auto& file:fs::directory_iterator(folder)) {
                if(file.path().extension()!=".json") continue;
                try {
                    auto body=read(file.path());
                    std::lock_guard transport(e->http_mutex);
                    auto result=json(authorized(*e,"/api/v1/game/scores",body,file.path().stem().string()));
                    auto score=score_from(result);
                    { std::lock_guard lock(mutex);
                      if(std::none_of(e->scores.begin(),e->scores.end(),[&](auto& s){return s.id==score.id;})) e->scores.push_back(score);
                      e->index_score(score); revision++;
                      message=e->config.name+": score uploaded";
                    }
                    fs::remove(file.path());
                } catch(const HttpError& err) {
                    status(e->config.name+": score pending ("+err.what()+")");
                    if(err.status>=400&&err.status<500&&err.status!=401&&err.status!=408&&err.status!=429) {
                        auto rejected=file.path(); rejected.replace_extension(".rejected"); fs::rename(file.path(),rejected);
                        status(e->config.name+": score rejected ("+err.what()+"), saved locally");
                    } else break;
                } catch(const std::exception& err) { status(e->config.name+": score pending ("+err.what()+")"); break; }
            }
        }
    }
};
Client::Client():impl(std::make_unique<Impl>()){}
Client::~Client() { if(impl->uploads.valid()) impl->uploads.wait(); }
Client& client(){ static Client instance; return instance; }

void Client::bootstrap(const std::vector<ServerConfig>& servers,const fs::path& cache) {
    impl->bootstrapping = true;
    struct Reset { std::atomic<bool>& flag; ~Reset(){flag=false;} } reset{impl->bootstrapping};
    if(impl->uploads.valid()) impl->uploads.get();
    impl->cache=fs::absolute(cache); impl->root=impl->cache/"catalog";
    fs::create_directories(impl->root);
    // Catalog is disposable display metadata. Content-addressed objects and
    // pending/rejected score submissions live outside it and survive refresh.
    fs::remove_all(impl->root); fs::create_directories(impl->root);
    { std::lock_guard lock(impl->mutex); impl->charts.clear(); impl->endpoints.clear(); }
    for(auto config:servers) {
        auto e=std::make_shared<Endpoint>(); e->config=std::move(config);
        while(!e->config.base_url.empty()&&e->config.base_url.back()=='/') e->config.base_url.pop_back();
        e->id=sha256(e->config.base_url+"\n"+e->config.username);
        if(impl->endpoints.count(e->id)) continue;
        { std::lock_guard lock(impl->mutex); impl->endpoints[e->id]=e; }
        auto dir=impl->root/e->id;
        try {
            auto& url=e->config.base_url;
            if((url.rfind("http://",0)!=0&&url.rfind("https://",0)!=0)||url.find_first_of("?#@ \r\n")!=std::string::npos) throw std::runtime_error("SERVER_URL_INVALID");
            if(e->config.username.empty()||e->config.password.empty()) throw std::runtime_error("ACCOUNT_NOT_CONFIGURED");
            impl->status(e->config.name+": loading catalog and scores");
            std::lock_guard transport(e->http_mutex);
            login(*e); auto snapshot=json(authorized(*e,"/api/v1/game/bootstrap"));
            if(!snapshot.HasMember("charts")||!snapshot["charts"].IsArray()||!snapshot.HasMember("scores")||!snapshot["scores"].IsArray()) throw std::runtime_error("API_BOOTSTRAP_INVALID");
            std::vector<Chart> charts;
            for(auto& v:snapshot["charts"].GetArray()) charts.push_back(chart_from(v,e->id));
            std::vector<Score> scores;
            for(auto& v:snapshot["scores"].GetArray()) scores.push_back(score_from(v));
            write(dir/"box.def","#TITLE:"+line_text(e->config.name)+"\n#GENRE:Namco Original\n");
            for(auto& c:charts) {
                auto path=dir/(c.id+".tja");
                std::string preview="// Fanmade catalog metadata only. Never play this file.\n"+title_headers(c)+"BPM:"+std::to_string(c.bpm)+"\nDEMOSTART:"+std::to_string(c.demo_start)+"\nWAVE:unavailable.ogg\n";
                bool supported=false;
                for(auto& d:c.difficulties) if(d) { supported=true; preview+="COURSE:"+d->course+"\nLEVEL:"+std::to_string(d->level)+"\n#START\n0,\n#END\n"; }
                if(supported) { write(path,preview); std::lock_guard lock(impl->mutex); impl->charts[path_key(path)]=c; }
                else write(dir/c.id/"box.def","#TITLE:"+line_text(c.title)+" [Tower/Dan unsupported]\n");
            }
            { std::lock_guard lock(impl->mutex); e->scores=std::move(scores); for(auto& score:e->scores) e->index_score(score); e->connected=true; }
            impl->status(e->config.name+": "+std::to_string(charts.size())+" songs loaded");
        } catch(const std::exception& err) {
            impl->status(e->config.name+": "+err.what());
            write(dir/"box.def","#TITLE:"+line_text(e->config.name)+" ["+err.what()+"]\n");
        }
    }
    impl->bootstrapping = false;
    update();
}
std::vector<fs::path> Client::song_paths(std::vector<fs::path> local) const {
    if(!impl->endpoints.empty()) local.push_back(impl->root); return local;
}
std::optional<Chart> Client::chart(const fs::path& path) const {
    std::lock_guard lock(impl->mutex); auto it=impl->charts.find(path_key(path));
    return it==impl->charts.end()?std::nullopt:std::optional<Chart>(it->second);
}
std::optional<Score> Client::best(const fs::path& path,int difficulty) const {
    auto c=chart(path); if(!c||difficulty<0||difficulty>=5||!c->difficulties[difficulty]||!c->difficulties[difficulty]->cloud) return {};
    std::lock_guard lock(impl->mutex);
    const auto& best=impl->endpoints.at(c->server)->best_scores;
    auto it=best.find(std::make_tuple(c->id,c->version,courses[difficulty]));
    return it==best.end()?std::nullopt:std::optional<Score>(it->second);
}
fs::path Client::prepare(const fs::path& path, std::shared_ptr<std::atomic_bool> cancel) {
    std::lock_guard preparing(impl->prepare_mutex);
    auto selected=chart(path); if(!selected) return path; auto c=*selected;
    auto e=impl->endpoints.at(c.server);
    std::lock_guard transport(e->http_mutex);
    impl->status(e->config.name+": checking file hashes");
    auto current=json(authorized(*e,"/api/v1/charts/"+c.id,"","",cancel));
    c=chart_from(current,c.server); // Revisions and renamed metadata are refreshed at loading time.
    auto dir=impl->cache/"objects"/c.server/c.id/c.version;
    auto base="/api/v1/charts/"+c.id+"/versions/"+c.version+"/";
    auto ensure=[&](const fs::path& file,const std::string& digest,const std::string& kind,size_t limit) {
        if(fs::exists(file)&&sha256(read(file))==digest) return;
        impl->status(e->config.name+": downloading "+kind);
        auto bytes=request(*e,base+kind,"","",limit,cancel);
        if(sha256(bytes)!=digest) throw std::runtime_error("DOWNLOAD_HASH_MISMATCH");
        write(file,bytes);
    };
    ensure(dir/"original.tja",c.tja_hash,"tja",4*1024*1024);
    ensure(dir/"audio.ogg",c.audio_hash,"audio",256*1024*1024);
    auto playable=dir/"play.tja";
    write(playable,playable_tja(to_utf8(read(dir/"original.tja"),c.encoding),c));
    { std::lock_guard lock(impl->mutex); impl->charts[path_key(playable)]=c; impl->charts[path_key(path)]=c; impl->revision++; }
    impl->status(e->config.name+": ready"); return playable;
}
void Client::submit(const fs::path& path,int difficulty,const Score& score) {
    auto c=chart(path); if(!c||difficulty<0||difficulty>=5||!c->difficulties[difficulty]||!c->difficulties[difficulty]->cloud) return;
    rapidjson::Document d; d.SetObject(); put(d,"songId",c->id); put(d,"versionId",c->version); put(d,"difficulty",courses[difficulty]);
    put(d,"good",score.good); put(d,"ok",score.ok); put(d,"bad",score.bad); put(d,"score",score.score); put(d,"drumroll",score.drumroll); put(d,"max_combo",score.max_combo);
    try { write(impl->cache/"pending"/c->server/(random_key()+".json"),encode(d)); impl->retry={}; update(); }
    catch(const std::exception& err) { impl->status(std::string("Score queue error: ")+err.what()); }
}
void Client::update() {
    std::lock_guard pump(impl->pump_mutex);
    if(impl->bootstrapping) return;
    if(impl->uploads.valid()) {
        if(impl->uploads.wait_for(std::chrono::seconds(0))!=std::future_status::ready) return;
        try { impl->uploads.get(); } catch(const std::exception& err) { impl->status(std::string("Score upload error: ")+err.what()); }
    }
    auto now=std::chrono::steady_clock::now();
    if(impl->endpoints.empty()||now<impl->retry) return;
    impl->retry=now+std::chrono::seconds(30);
    impl->uploads=std::async(std::launch::async,[this]{impl->drain();});
}
uint64_t Client::revision() const { return impl->revision; }
bool Client::online() const { std::lock_guard lock(impl->mutex); for(auto& [id,e]:impl->endpoints) if(e->connected) return true; return false; }
std::string Client::status() const { std::lock_guard lock(impl->mutex); return impl->message; }
} // namespace fanmade
