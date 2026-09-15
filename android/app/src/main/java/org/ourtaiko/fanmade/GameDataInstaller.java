package org.ourtaiko.fanmade;

import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;

/** Restores missing bundled files without replacing the player's files. */
final class GameDataInstaller {
    interface Assets {
        String[] list(String path) throws IOException;
        InputStream open(String path) throws IOException;
    }

    static void install(Assets assets, Path destination) throws IOException {
        Files.createDirectories(destination);
        // Restore settings before traversing potentially large skin directories.
        copyFile(assets, "GameData/config.toml", destination.resolve("config.toml"));
        for (String name : assets.list("GameData")) {
            if (!name.equals("config.toml")) {
                copyTree(assets, "GameData/" + name, destination.resolve(name));
            }
        }
        Files.createDirectories(destination.resolve("Skins"));
        Files.createDirectories(destination.resolve("Songs"));
    }

    private static void copyTree(Assets assets, String source, Path target) throws IOException {
        checkInterrupted();
        String[] children = assets.list(source);
        if (children.length == 0) {
            copyFile(assets, source, target);
            return;
        }
        Files.createDirectories(target);
        for (String child : children) {
            copyTree(assets, source + "/" + child, target.resolve(child));
        }
    }

    private static void copyFile(Assets assets, String source, Path target) throws IOException {
        checkInterrupted();
        if (Files.exists(target)) {
            if (!Files.isRegularFile(target)) throw new IOException("Expected a file: " + target);
            return;
        }
        // A failed/interrupted copy must not leave a partial file that would be
        // mistaken for a complete user file on the next launch.
        Path temporary = Files.createTempFile(target.getParent(), ".ourtaiko-", ".tmp");
        try {
            try (InputStream input = assets.open(source);
                 OutputStream output = Files.newOutputStream(temporary)) {
                byte[] buffer = new byte[64 * 1024];
                int count;
                while ((count = input.read(buffer)) != -1) {
                    checkInterrupted();
                    output.write(buffer, 0, count);
                }
            }
            checkInterrupted();
            // Do not replace a file the player created while copying.
            if (!Files.exists(target)) Files.move(temporary, target);
        } finally {
            Files.deleteIfExists(temporary);
        }
    }

    private static void checkInterrupted() throws InterruptedIOException {
        if (Thread.currentThread().isInterrupted()) throw new InterruptedIOException("Setup cancelled");
    }
}
