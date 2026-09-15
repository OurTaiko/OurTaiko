# GitHub Actions 构建与 Android 签名

仓库：[OurTaiko/OurTaiko](https://github.com/OurTaiko/OurTaiko)。

## 启动构建

- 推送到 `master` 不会自动运行 CI。
- 在 **Actions → Build OurTaiko (Release) → Run workflow** 手动启动，生成各平台构建产物。
- 默认不创建 GitHub Release。成功的单个平台产物可在该次运行的 **Artifacts** 下载。
- **Build OurTaiko (Debug)** 仍为手动触发，包含 Linux、Windows 和 macOS。

命令行手动构建：

```sh
gh workflow run build.yml --repo OurTaiko/OurTaiko --ref master
gh run list --repo OurTaiko/OurTaiko --workflow build.yml
```

需要正式发布时，在 Run workflow 中勾选 `publish_release`，或执行：

```sh
gh workflow run build.yml --repo OurTaiko/OurTaiko --ref master -f publish_release=true
```

所有平台构建成功后，发布任务创建 `build-<run_number>-<run_attempt>` 标签，
指向本次构建的提交，避免复用 fork 从上游继承的旧 `latest` 标签。
只有发布任务获得 `contents: write` 权限。iOS 产物仍是需要自行签名的 unsigned IPA。

上述行为需要先将本地工作流修改提交并推送到 GitHub。

## 皮肤子模块与临时 TLS 设置

代码生成需要三个皮肤子模块，仓库中的 Git 子模块提交号决定使用的版本。
工作流通过共享的 `prepare-skins` action 拉取和缓存它们。

2026-09-15 检查时，`ese.tjadataba.se` 的证书已于 2026-09-12 过期。
按项目维护者要求，工作流目前默认仅对此服务器的 Git 拉取临时关闭证书校验：

```sh
git -c http.https://ese.tjadataba.se/.sslVerify=false submodule update --init --recursive
```

此选项不写入全局 Git 配置。子模块 URL 统一使用 HTTPS。
源站证书续期后，在仓库 **Settings → Secrets and variables → Actions → Variables**
设置 `SKINS_ALLOW_INSECURE_TLS=false`，即可恢复校验，无需改动所有工作流。

当前三个仓库可匿名访问，不需要皮肤凭据。如果上游以后改为私有，
同时设置仓库 Secrets `GITEA_USER` 和 `GITEA_TOKEN`；二者不能只设置一个。

## Android 内置资源与首次启动

Gradle 的 `copyGameAssets` 任务把三个皮肤、仓库内的 Songs、默认 `config.toml`、
LICENSE 和 NOTICE 打进 APK，排除皮肤中的 Git 元数据。默认配置启用触摸输入和 VSync，
本地构建与 CI 使用相同的打包逻辑，不修改仓库中的配置文件。

启动器先检查存储权限，再在后台准备 `/sdcard/OurTaiko` 中的文件，完成后启动 SDL 游戏。
Android 10 使用存储写入权限，Android 11 及以上使用“所有文件访问”权限。
每次启动都会补齐缺失的内置文件；已有配置、皮肤和歌曲保留。
删除 `config.toml` 后再启动即可恢复默认配置。不会读取或迁移旧目录。
复制失败时提示重试，单个文件通过临时文件写入，避免将半成品当成完整文件。
皮肤包含在 APK 中，因此安装包大小与首次资源准备耗时都会增加。

验证方法见 [Android 资源初始化检查](../tests/android/README.md)。

## OurTaiko 自己的 Android 发布密钥

APK 使用长期保存的同一把签名密钥，才能为现有安装正常提供更新。
GitHub Secrets 保存以下四项：

| 名称 | 内容 |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | JKS 文件的 Base64 编码 |
| `ANDROID_KEYSTORE_PASSWORD` | 密钥库密码 |
| `ANDROID_KEY_ALIAS` | `ourtaiko` |
| `ANDROID_KEY_PASSWORD` | 私钥密码 |

工作流将 JKS 临时恢复到 `android/ourtaiko-release.jks`，密码通过环境变量传给 Gradle。
密钥文件已被 Git 忽略。不能将密钥、密码或其 Base64 编码写入源代码。

### 首次生成

需要 Python 3、JDK 的 `keytool`，上传时还需要已登录的 GitHub CLI。
在仓库根目录执行，密钥目录必须位于仓库外：

```sh
python3 tools/android_signing.py create \
  --directory "$HOME/.local/share/OurTaiko/android-signing"
```

也可用 `--keytool /path/to/jdk/bin/keytool` 指定工具路径。
脚本生成 RSA 3072 位、有效期 10000 天、署名 OurTaiko 的密钥，
随机密码保存到该目录的 `password.txt`，不会打印密码。
目录已存在时拒绝重新生成，避免替换正在使用的签名身份。

### 配置 GitHub Secrets

```sh
python3 tools/android_signing.py upload \
  --directory "$HOME/.local/share/OurTaiko/android-signing" \
  --repo OurTaiko/OurTaiko
```

四项内容通过标准输入交给 GitHub CLI，不出现在命令参数中。
若上传中断，确认仍使用同一份密钥备份后，可加 `--replace-existing` 重试。

### 备份与测试签名

将生成目录整体保存到独立的安全备份中，至少保留 `ourtaiko-release.jks` 和 `password.txt`。
`certificate.pem` 和 `certificate-info.txt` 是公开证书及指纹信息。
GitHub Secrets 不能作为可下载的密钥备份。已生成过密钥后，不要为每个版本重新生成。

无任何签名 Secret 时，普通 CI 构建使用测试密钥并在运行摘要中注明；
勾选正式发布则会报错，要求先配置四个 Secret。只配置部分 Secret 也会明确报错。
测试密钥可能随运行变化；正式分发使用自己的发布密钥。

Android 工具链使用 AGP 8.7.3、Gradle 8.9、JDK 17、SDK 35 和 NDK 27.3.13750724，
不依赖原作者电脑上的绝对路径。

参考：[Android 应用签名](https://developer.android.com/studio/publish/app-signing)、
[AGP 8.7 兼容性](https://developer.android.com/build/releases/agp-8-7-0-release-notes)、
[GitHub Actions Secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)。
