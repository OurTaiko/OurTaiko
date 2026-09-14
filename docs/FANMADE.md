# OurTaiko Fanmade 游戏接入

配置只在 TOML 文件中修改，游戏内不新增网络设置界面。每个服务器独立登录、下载和提交成绩。

## 配置

桌面运行目录优先读取 `dev-config.toml`，没有时读取 `config.toml`。iOS 读取应用 Documents 中的配置文件；可通过 Files/Finder 修改。不要把本机 `127.0.0.1` 当作另一台设备的地址：真机应填写后端所在电脑的局域网地址，后端需监听该网络接口。

删除 `[network]` 下的 `servers = []` 后，加入以下数组表。多个服务器重复整个 `[[network.servers]]` 段：

```toml
[[network.servers]]
name = "OurTaiko Fanmade"
base_url = "http://127.0.0.1:8080"
username = "你的用户名"
password = "你的密码"
http_proxy = ""

# [[network.servers]]
# name = "第二个服务器"
# base_url = "https://taiko.example.com"
# username = "另一个账号"
# password = "另一个密码"
# http_proxy = "http://127.0.0.1:7890"
```

`base_url` 是 API 服务的根地址，客户端添加 `/api/v1/...`。`name` 是选曲中的文件夹名。相同 API 地址和用户名视为同一个配置；不同账号的成绩和缓存相互隔离。空 `http_proxy` 显式禁用代理，包括环境变量中的代理。HTTP/HTTPS 下载禁止自动跳转，并保留 TLS 证书校验。公网服务请使用 HTTPS。

账号密码保存在本机配置中，Bearer token 只在进程内保存，到期自动重新登录。含密码的配置不要提交到 Git；仓库已忽略 `dev-config.toml`。原 `online_play`、`sync_scores` 和 `access_code` 已从配置结构、读写和设置绑定中移除。旧文件含这些字段仍可读取，保存配置时会自动清除；`network.servers` 中的服务器及账号配置继续保留。游戏载入皮肤设置模板时会过滤这三个旧选项及因此变空的分类，兼容已安装的旧皮肤。

## 生命周期

1. 启动 Loading 阶段，逐个服务器登录，并从 `/api/v1/game/bootstrap` 取得完整公开曲库和该账号所有历史成绩。某个服务器失败不会阻止其他服务器和本地歌曲进入选曲，失败服务器文件夹显示错误。
2. 每个服务器在选曲中有独立文件夹（示例名 OurTaiko Fanmade）。目录文件只含 API 的多语言标题、难度和等级，不提前下载原始 TJA/OGG。
3. 当前版本的各难度最高分及对应良、可、不可、连打数显示在选曲成绩区域。所有历史成绩保存在客户端内存中；旧版本成绩不混入当前版本。API 未提供 gauge、最大连击、冠和段位，界面不会伪造这些字段。单人使用 P1 或 P2 均对应配置账号；双人时仅首先登录的一方提交到这个账号。
4. 确定难度后，在加载页重新获取歌曲详情和 SHA-256，下载缺失或哈希不符的文件。只有哈希验证成功后才进入游戏，下载中可按返回异步取消。作者的新版本会在此阶段取得；原先所选难度已删除时停止加载并显示错误。
5. 下载保存原始字节。游玩副本转换为 UTF-8，使用 API 指定的谱面块，优先选同难度唯一 Single；纯 DOUBLE 保留 P1/P2 块。副本使用 API 最新翻译与标题，并将 WAVE 固定指向已校验的 `audio.ogg`。未上传的图片/视频引用不被加载。
6. 正常结算后，按实际版本提交歌曲 ID、难度、良、可、不可、分数和连打数。自动演奏、跳过游玩和 DOUBLE 不上传；中途退出不提交。练习场景不使用这一结算上传流程。
7. 上传先写本地持久化队列，再异步发送。临时失败每 30 秒重试，重启后继续处理同一服务器/账号的队列。每次游玩固定幂等 key，重试不生成重复成绩。成功后更新内存，选曲界面刷新成绩。

`cache/fanmade/catalog/` 是启动时重建的展示目录；`objects/` 是分服务器/歌曲/版本的文件缓存；`pending/` 保存待上传 JSON。服务器永久拒绝的记录改为 `.rejected` 保留，状态区显示失败。作者在游玩期间换版时，后端返回 409，记录保留本地，不会归到新版本。

当前版本在启动时获取完整曲库快照；其他设备刚提交的成绩和新增歌曲在重启后同步，已经进入内存的歌曲在加载时取得最新版本。暂未加入定时全量刷新。服务器支持的 Tower/Dan 会以不支持的目录项标记；当前普通选曲仅支持 Easy/Normal/Hard/Oni/Edit。Android 的 Shift-JIS 转码尚未实现，会明确报错；UTF-8 不受影响。浏览器构建默认禁用原生网络模块。

## 构建

`FANMADE_NETWORK=ON` 默认启用原生 CPR/curl，服务器地址与账号从运行时 TOML 配置读取。设置为 `OFF` 可构建离线版本；浏览器构建自动禁用原生网络。CMake、Android 和 CI 均不再需要旧服务的 URL/认证密钥。旧联网实现、归档、专用测试、远端选曲与批量同步代码已删除；仍被本地成绩保存和跳过操作使用的修改器序列化、按键记录保留在成绩与游玩模块。

## 验证

2026-09-14 旧联网配置清理的专项检查：使用实际 `config.cpp` 在临时目录验证旧字段兼容、双服务器账号/代理读写、空列表及配置文件权限；使用实际 PyTaikoGreen 模板验证旧选项过滤、其他设置保留、分类顺序与退出入口。最终 iOS Simulator Release 完整构建通过；本次未进行真机、Android 或 Windows 运行回归。

删除旧联网实现后的专项回归：当前 Fanmade 原生夹具通过多服务器登录、代理、版本隔离、下载缓存与损坏修复、成绩提交及重试检查；不定义 `FANMADE_NETWORK`、不链接 CPR 时的原生模块编译和谱面解析检查通过。重新生成 Xcode 工程后的 iOS Simulator Release 完整构建通过。两个 CI workflow 通过 YAML 结构检查，未执行远端 CI；真机、Android 和 Windows 运行回归仍待验证。

- Go HTTP/PostgreSQL 集成测试：原生/浏览器会话隔离、Origin 拒绝、版本核对、幂等提交和曲库/成绩读取。
- `tests/fanmade/client.cpp` + `fixture.py`：两个 API、HTTP proxy、空代理直连、旧版本成绩隔离、正确 Single 块/DOUBLE 双人块、原生 TJA 音符解析、缓存命中、损坏修复、取消、提交后响应失败及重启后的幂等重试。
- 独立数据库 schema 中以 ESE 的 Happy Synthesizer 和 Natsumatsuri 验证真实 Go API、真实 TJA/OGG 与原生解析器，确认成绩落 PostgreSQL；测试后清理数据。
- iOS Simulator Release 完整构建通过；独立验证应用启动、登录及生成 5 首云端曲库已确认。当前环境的原生 UI 控制服务超时，未完成选曲到结算的手动界面回归。Windows、Android、真机和所有皮肤仍需相应平台回归。

可在 macOS 用仓库现有 CPR 源码构建独立测试（只访问临时测试缓存，不读取 scores.db）：

```sh
cmake -S .cmake-deps/cpr-src -B /tmp/fanmade-cpr -DCPR_USE_SYSTEM_CURL=ON -DCPR_BUILD_TESTS=OFF -DBUILD_SHARED_LIBS=OFF -DCMAKE_BUILD_TYPE=Release
cmake --build /tmp/fanmade-cpr --parallel 4
clang++ -std=c++20 -DFANMADE_NETWORK -I.cmake-deps/cpr-src/include -I/tmp/fanmade-cpr/cpr_generated_includes -I.cmake-deps/rapidjson-src/include -I.cmake-deps/spdlog-src/include tests/fanmade/client.cpp src/libs/fanmade.cpp src/libs/parsers/tja.cpp src/libs/md5.cpp /tmp/fanmade-cpr/lib/libcpr.a -lcurl -liconv -o /tmp/fanmade-client-test
python3 tests/fanmade/fixture.py /tmp/fanmade-client-test
```
