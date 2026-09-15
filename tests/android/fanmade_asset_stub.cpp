// Host-side adapter only: exercise the Android transport with real OpenSSL,
// while replacing SDL's APK reader with a fixture-controlled file. This does
// not test Android AssetManager or claim to be an APK/device build.
#include <SDL3/SDL_iostream.h>
#include <cstdlib>
#include <cstring>
#include <fstream>
#include <iterator>

extern "C" void* SDL_LoadFile(const char* name, size_t* size) {
    if(std::strcmp(name,"cacert.pem")!=0) return nullptr;
    const char* path=std::getenv("FANMADE_TEST_CA");
    if(!path) return nullptr;
    std::ifstream file(path,std::ios::binary);
    if(!file) return nullptr;
    std::string bytes{std::istreambuf_iterator<char>(file),{}};
    void* data=std::malloc(bytes.size()+1);
    if(!data) return nullptr;
    std::memcpy(data,bytes.data(),bytes.size());
    *size=bytes.size();
    return data;
}
extern "C" void SDL_free(void* memory) { std::free(memory); }
