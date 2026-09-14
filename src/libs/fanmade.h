#pragma once

#include <array>
#include <atomic>
#include <cstdint>
#include <filesystem>
#include <map>
#include <memory>
#include <optional>
#include <string>
#include <vector>

namespace fanmade {
namespace fs = std::filesystem;
struct ServerConfig {
    std::string name, base_url, username, password, http_proxy;
};
struct Difficulty {
    std::string course;
    int level = 0, block_index = 0;
    bool cloud = false;
    std::string player;
};
struct Chart {
    std::string server, id, version, title, subtitle, tja_hash, audio_hash, encoding, audio_name;
    std::map<std::string, std::string> titles, subtitles;
    double bpm = 120, demo_start = 0;
    std::array<std::optional<Difficulty>, 5> difficulties;
    std::vector<Difficulty> blocks;
};
struct Score {
    std::string id, song, version, difficulty;
    int64_t good = 0, ok = 0, bad = 0, score = 0, drumroll = 0, max_combo = 0;
};
// No rendering or game globals: the HTTP/cache client can be integration-tested
// against a fixture server without starting raylib or accessing local scores.db.
class Client {
public:
    Client();
    ~Client();
    void bootstrap(const std::vector<ServerConfig>& servers, const fs::path& cache);
    std::vector<fs::path> song_paths(std::vector<fs::path> local) const;
    std::optional<Chart> chart(const fs::path& path) const;
    std::optional<Score> best(const fs::path& path, int difficulty) const;
    fs::path prepare(const fs::path& path, std::shared_ptr<std::atomic_bool> cancel = {}); // worker thread only, throws on failure
    void submit(const fs::path& path, int difficulty, const Score& score);
    void update(); // launches queued submissions; never waits for HTTP
    bool online() const;
    uint64_t revision() const;
    std::string status() const;
private:
    struct Impl;
    std::unique_ptr<Impl> impl;
};
Client& client();
std::string sha256(const std::string& bytes);
// Select the server-identified blocks and normalize only the playable copy.
// Original downloads remain byte-for-byte intact for hash verification.
std::string playable_tja(const std::string& utf8, const Chart& chart);
} // namespace fanmade
