package org.ourtaiko.fanmade;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeSet;

public class GameDataInstallerTest {
    static class BundledAssets implements GameDataInstaller.Assets {
        final Map<String, String> files = new LinkedHashMap<>();
        String failOn;
        int opened;
        public String[] list(String path) {
            TreeSet<String> children = new TreeSet<>();
            for (String file : files.keySet()) {
                if (file.startsWith(path + "/")) children.add(file.substring(path.length() + 1).split("/")[0]);
            }
            return children.toArray(new String[0]);
        }
        public InputStream open(String path) throws IOException {
            opened++;
            if (!files.containsKey(path)) throw new IOException("Missing bundled file " + path);
            if (path.equals(failOn)) return new InputStream() {
                int read;
                public int read() throws IOException {
                    if (read++ == 0) return 'x';
                    throw new IOException("Interrupted asset read");
                }
            };
            return new ByteArrayInputStream(files.get(path).getBytes(StandardCharsets.UTF_8));
        }
    }

    static void require(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    public static void main(String[] args) throws Exception {
        Path root = Files.createTempDirectory("ourtaiko-assets-test-");
        try {
            BundledAssets assets = new BundledAssets();
            assets.files.put("GameData/config.toml", "[general]\ntouch_input = true\n");
            assets.files.put("GameData/Skins/PyTaikoGreen/Graphics/skin_config.json", "skin-default");
            assets.files.put("GameData/LICENSE", "license");
            assets.files.put("GameData/NOTICE", "Yono / OurTaiko");
            Path data = root.resolve("OurTaiko");
            GameDataInstaller.install(assets, data);
            Path config = data.resolve("config.toml");
            Path skin = data.resolve("Skins/PyTaikoGreen/Graphics/skin_config.json");
            require(Files.readString(config).contains("touch_input = true"), "First launch restores config");
            require(Files.readString(skin).equals("skin-default"), "First launch installs skin");
            require(Files.isDirectory(data.resolve("Songs")), "Songs directory created");
            require(Files.readString(data.resolve("NOTICE")).contains("Yono"), "Attribution installed");

            Files.writeString(config, "player-config");
            Files.writeString(skin, "player-skin");
            Files.writeString(data.resolve("Songs/custom.tja"), "player-song");
            assets.opened = 0;
            GameDataInstaller.install(assets, data);
            require(Files.readString(config).equals("player-config"), "Existing config preserved");
            require(Files.readString(skin).equals("player-skin"), "Existing skin preserved");
            require(assets.opened == 0, "Existing large assets are not read again");

            Files.delete(config);
            Files.delete(skin);
            GameDataInstaller.install(assets, data);
            require(Files.readString(config).contains("touch_input = true"), "Deleted config restored on next launch");
            require(Files.readString(skin).equals("skin-default"), "Deleted skin file restored");
            require(Files.readString(data.resolve("Songs/custom.tja")).equals("player-song"), "Custom songs preserved");

            String newAsset = "GameData/Skins/PyTaikoGreen/Graphics/new.png";
            assets.files.put(newAsset, "complete-file");
            assets.failOn = newAsset;
            try { GameDataInstaller.install(assets, data); throw new AssertionError("Expected copy failure"); }
            catch (IOException expected) { }
            Path newFile = skin.getParent().resolve("new.png");
            require(!Files.exists(newFile), "Failed copy never leaves a partial destination");
            try (var paths = Files.walk(data)) {
                require(paths.noneMatch(p -> p.getFileName().toString().endsWith(".tmp")), "Temporary file cleaned after failure");
            }
            assets.failOn = null;
            GameDataInstaller.install(assets, data);
            require(Files.readString(newFile).equals("complete-file"), "Retry repairs interrupted/new asset");

            Thread.currentThread().interrupt();
            try { GameDataInstaller.install(assets, data); throw new AssertionError("Expected cancellation"); }
            catch (java.io.InterruptedIOException expected) { }
            finally { Thread.interrupted(); }
            System.out.println("PASS: initial install, config/skin recovery, user-file preservation, no reread, copy failure/retry, cancellation");
        } finally {
            try (var paths = Files.walk(root)) {
                for (Path path : paths.sorted(java.util.Comparator.reverseOrder()).toArray(Path[]::new)) Files.delete(path);
            }
        }
    }
}
