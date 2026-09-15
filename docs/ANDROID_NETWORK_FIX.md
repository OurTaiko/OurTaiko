# Android HTTPS 证书加载修复（2026-09-15）

## 原因与真机证据

用户报告进入在线曲库时显示 `NETWORK_OR_SIZE_ERROR`。`fanmade.cpp`
把所有 CPR 传输错误和响应体超限合并成这一提示，无法据此判断文件大小。

在用户连接的 V2352GA / Android 16 上，从已安装 APK 提取
`libOurTaiko.so`、`libc++_shared.so` 和 `assets/cacert.pem`，通过独立
`app_process` JNI 探针调用原 APK 导出的 curl API。探针不替换应用、不读取
成绩库；仅测试 HTTPS 和登录，密码经标准输入传递，响应 token 丢弃。

同一台手机、同一库（curl 8.10.1 / OpenSSL 3.4.0）、同一服务器
`https://fanmade.ourtaiko.org` 的对照：

| 设置 | 登录结果 |
| --- | --- |
| 原 APK 的 curl 默认设置 | curl 60、HTTP 0：`SSL certificate problem: unable to get local issuer certificate` |
| 设置 `CURLOPT_CAINFO_BLOB` 为原 APK 的 CA 内容 | curl 0、HTTP 200 |

两次均启用服务器证书和主机名验证。手机系统 curl 访问 HTTPS 成功；电脑使用
同一个内置 CA 登录、读取 bootstrap 也均为 HTTP 200。账号有效，故障在原生
客户端的证书信任配置。

APK 已带 CA，但 Fanmade 请求没有使用它。CPR 的 Android 默认 CA 目录
不能在此次环境中完成服务器证书链验证。原库还包含 CI 构建机器的 OpenSSL
默认路径，但未单独证明这些路径是此次失败的唯一原因。

## 修改

- Android 通过 SDL 从 APK 读取 `cacert.pem`，在线程安全的静态对象中缓存，
  并给每个请求传入 CA blob。无需把证书复制到共享游戏目录。
- Android 明确使用 CPR 自带 curl 和 OpenSSL，关闭构建主机 CA bundle 自动搜索。
- 区分 DNS、代理 DNS、连接失败、超时、TLS、真正的响应超限和取消。
  其余错误保留 CPR 错误编号；不暴露密码、token、请求体或响应体。
- iOS / 桌面的证书来源不变；错误分类属于各原生平台共享修改。

## 验证范围

- 真机原 APK 网络库：修复前证书失败，加载 CA 后真实账号登录成功。
- 新代码 Android 条件分支的主机夹具：可信 CA 成功、未知签发者和错误主机名
  被拒绝、CA 缺失/空/无效、精确大小边界、大小超限、HTTP 403 和取消均通过。
  TLS 使用真实 OpenSSL；SDL APK 读取由受控文件适配器代替。
- 原有完整客户端 HTTP 夹具通过：曲库、代理、下载、缓存、损坏恢复、取消、
  成绩版本隔离和幂等重试。
- 未完成新版 APK 的完整构建、安装和游戏 UI 回归。此次电脑只有 Android
  Studio / SDK，缺少项目要求的 NDK 27.3.13750724、CMake 3.22.1 和 Android
  FFmpeg / OpenSSL 预编译依赖。手机上的应用仍为原版本，修复需要重新构建安装。

测试方法见 [Android 检查说明](../tests/android/README.md)。临时探针不纳入
产品代码，重测时可按上述方法从待测 APK 提取库，分别执行默认请求和带 CA blob
请求；不能将该探针对照称为新版游戏完整真机验证。
