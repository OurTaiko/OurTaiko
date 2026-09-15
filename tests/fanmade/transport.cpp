// Include the implementation to exercise the private bounded HTTP transport.
#include "../../src/libs/fanmade.cpp"
#include <iostream>

int main(int argc, char** argv) {
    if(argc!=5) return 2;
    fanmade::Endpoint endpoint;
    endpoint.config.base_url=argv[1];
    const std::string expected=argv[3];
    auto cancelled=std::make_shared<std::atomic_bool>(expected=="DOWNLOAD_CANCELLED");
    try {
        auto body=fanmade::request(endpoint,argv[2],"","",std::stoull(argv[4]),cancelled);
        if(expected!="OK" || body!="test") return 1;
    } catch(const std::exception& error) {
        if(expected!=error.what()) {
            std::cerr<<"Expected "<<expected<<", received "<<error.what()<<'\n';
            return 1;
        }
    }
    std::cout<<"PASS: "<<expected<<'\n';
}
