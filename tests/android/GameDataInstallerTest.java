package org.ourtaiko.fanmade;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class GameDataInstallerTest {
    static class BundledAssets implements GameDataInstaller.Assets {
        final Map<String, String> files = new LinkedHashMap<>();
        boolean fail;
        int opened;
        int extraCount;
        public InputStream open(String path) throws IOException {
            opened++;
            if (path.equals("GameData.count"))
                return new ByteArrayInputStream(Integer.toString(files.size() + extraCount).getBytes(StandardCharsets.UTF_8));
            require(path.equals("GameData.zip"), "Installer opens only the bundle/count");
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            try (ZipOutputStream zip = new ZipOutputStream(bytes)) {
                for (var entry : files.entrySet()) {
                    zip.putNextEntry(new ZipEntry(entry.getKey()));
                    zip.write(entry.getValue().getBytes(StandardCharsets.UTF_8));
                    zip.closeEntry();
                }
            }
            byte[] archive = bytes.toByteArray();
            if (fail) return new InputStream() {
                int position;
                public int read() throws IOException {
                    if (position >= 60) throw new IOException("Interrupted archive read");
                    return archive[position++] & 255;
                }
            };
            return new ByteArrayInputStream(archive);
        }
    }

    static void require(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    static void fails(BundledAssets assets, Path data) throws Exception {
        try { GameDataInstaller.install(assets, data); throw new AssertionError("Expected failure"); }
        catch (IOException expected) { }
        require(!Files.exists(data.resolve(GameDataInstaller.MARKER)), "Failure never commits completion");
    }

    public static void main(String[] args) throws Exception {
        Path root = Files.createTempDirectory("ourtaiko-assets-test-");
        try {
            BundledAssets assets = new BundledAssets();
            assets.files.put("config.toml", "[general]\ntouch_input = true\n");
            assets.files.put("Skins/PyTaikoGreen/Graphics/skin_config.json", "skin-default");
            assets.files.put("Songs/日本語/song.tja", "chart");
            assets.files.put("NOTICE", "Yono / OurTaiko");
            Path data = root.resolve("OurTaiko");
            GameDataInstaller.install(assets, data);
            Path config = data.resolve("config.toml");
            Path skin = data.resolve("Skins/PyTaikoGreen/Graphics/skin_config.json");
            require(Files.readString(config).contains("touch_input = true"), "Initial config");
            require(Files.readString(skin).equals("skin-default"), "Initial skin");
            require(Files.readString(data.resolve("Songs/日本語/song.tja")).equals("chart"), "Unicode paths");

            Files.writeString(config, "player-config");
            Files.writeString(skin, "player-skin");
            assets.opened = 0;
            assets.fail = true;
            GameDataInstaller.install(assets, data);
            require(assets.opened == 0, "Repeat launch does not open any APK assets");
            require(Files.readString(config).equals("player-config"), "Edited config preserved");
            Files.delete(config);
            Files.delete(skin);
            assets.files.put("new-resource", "new version");
            GameDataInstaller.install(assets, data);
            require(assets.opened == 0, "Deleted files/updated bundle do not trigger a scan");
            require(!Files.exists(config) && !Files.exists(skin), "Config recovery belongs to native settings loader");

            // Old installations have no marker; preserve their content on migration.
            Files.delete(data.resolve(GameDataInstaller.MARKER));
            Files.writeString(config, "old-player-config");
            assets.fail = false;
            GameDataInstaller.install(assets, data);
            require(Files.readString(config).equals("old-player-config"), "Migration preserves settings");
            require(Files.readString(skin).equals("skin-default"), "Migration fills missing resources once");

            Path retry = root.resolve("retry");
            assets.fail = true;
            fails(assets, retry);
            require(!Files.exists(retry.resolve("config.toml")), "Failed copy leaves no partial destination");
            try (var paths = Files.walk(retry)) {
                require(paths.noneMatch(p -> p.toString().endsWith(".tmp")), "Failed temporary file cleaned");
            }
            assets.fail = false;
            GameDataInstaller.install(assets, retry);
            require(Files.readString(retry.resolve("config.toml")).contains("touch_input"), "Retry completes copy");

            assets.extraCount = 1;
            fails(assets, root.resolve("truncated"));
            assets.extraCount = 0;
            assets.files.put("../escaped", "invalid");
            fails(assets, root.resolve("invalid-path"));
            require(!Files.exists(root.resolve("escaped")), "Zip path cannot escape destination");
            Thread.currentThread().interrupt();
            try { fails(assets, root.resolve("cancelled")); }
            finally { Thread.interrupted(); }
            System.out.println("PASS: install once, zero APK reads on restart, migration, Unicode, failure/retry, incomplete archive, traversal rejection, cancellation");
        } finally {
            try (var paths = Files.walk(root)) {
                for (Path path : paths.sorted(java.util.Comparator.reverseOrder()).toArray(Path[]::new)) Files.delete(path);
            }
        }
    }
}
