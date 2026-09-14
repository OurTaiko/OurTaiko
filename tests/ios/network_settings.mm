// Compile this fixture alone: it exercises the real Foundation reader with an
// isolated suite, without writing the game's preference domain or credentials.
#include "../../src/platform/ios_network_settings.mm"
#include <iostream>
void check(bool value, const char* message) {
    if (!value) throw std::runtime_error(message);
}
int main(int argc, char** argv) {
    if (argc != 2) return 2;
    @autoreleasepool {
        NSString* domain = [@"org.ourtaiko.settings-fixture." stringByAppendingString:NSUUID.UUID.UUIDString];
        NSUserDefaults* prefs = [[NSUserDefaults alloc] initWithSuiteName:domain];
        try {
            SettingsStore store(prefs, domain, [NSString stringWithUTF8String:argv[1]]);
            check(!store.initialized(), "registered defaults must not prevent first migration");
            check(store.servers().empty(), "fresh install must not connect before configuration");
            check([[prefs stringForKey:key_for(1,@"base_url")] isEqualToString:@"https://fanmade.ourtaiko.org"], "bundle URL default");
            std::vector<fanmade::ServerConfig> legacy{
                {"服务器一", "https://first.invalid", "player", " password ", ""},
                {"Second", "https://second.invalid", "other", "second-pass", "http://127.0.0.1:3128"}};
            store.initialize(legacy);
            auto servers=store.servers();
            check(store.initialized() && servers.size()==2,"one-time migration imports servers");
            check(servers[0].name==legacy[0].name && servers[0].password==" password " && servers[0].http_proxy.empty(),"Unicode, password whitespace and empty proxy preserved");
            check(servers[1].http_proxy==legacy[1].http_proxy,"independent proxy");
            [prefs setBool:NO forKey:key_for(1,@"enabled")];
            [prefs setObject:@"edited" forKey:key_for(2,@"username")];
            store.initialize(legacy);
            servers=store.servers();
            check(servers.size()==1 && servers[0].username=="edited","settings edits and disabled slots survive migration retries");
            [prefs setBool:NO forKey:key_for(2,@"enabled")];
            [prefs setBool:YES forKey:key_for(5,@"enabled")];
            [prefs setObject:@"fifth" forKey:key_for(5,@"username")];
            servers=store.servers();
            check(servers.size()==1 && servers[0].username=="fifth","fifth slot is independently readable");
            [prefs removePersistentDomainForName:domain];
            [prefs setBool:NO forKey:key_for(1,@"enabled")];
            store.initialize(legacy);
            check(store.servers().empty(),"settings configured before first launch must not be overwritten by TOML");
            [prefs removePersistentDomainForName:domain];
            store.initialize({});
            store.initialize(legacy);
            check(store.servers().empty(),"empty first migration never falls back to later TOML changes");
            [prefs removePersistentDomainForName:domain];
            [prefs release];
            std::cout<<"PASS: Settings.bundle defaults, five slots, migration, edits, disabled servers, credentials and proxy isolation\n";
        } catch (const std::exception& error) {
            [prefs removePersistentDomainForName:domain];
            [prefs release];
            std::cerr<<"FAIL: "<<error.what()<<"\n";return 1;
        }
    }
}
