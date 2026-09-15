package org.ourtaiko.fanmade;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/** Installs bundled resources once, preserving player files during migration/retry. */
final class GameDataInstaller {
    static final String MARKER = ".game-data-installed";

    interface Assets {
        InputStream open(String path) throws IOException;
    }

    static void install(Assets assets, Path destination) throws IOException {
        checkInterrupted();
        destination = destination.toAbsolutePath().normalize();
        // No APK access, asset listing, or resource traversal on later launches.
        if (Files.isRegularFile(destination.resolve(MARKER))) return;
        Files.createDirectories(destination);
        int expected;
        try (BufferedReader input = new BufferedReader(new InputStreamReader(
                assets.open("GameData.count"), StandardCharsets.UTF_8))) {
            expected = Integer.parseInt(input.readLine());
        } catch (NumberFormatException error) {
            throw new IOException("Invalid bundled resource count", error);
        }
        if (expected <= 0) throw new IOException("Empty game data bundle");
        byte[] buffer = new byte[64 * 1024];
        Set<Path> directories = new HashSet<>();
        directories.add(destination);
        int count = 0;
        try (ZipInputStream zip = new ZipInputStream(new BufferedInputStream(assets.open("GameData.zip"), buffer.length))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                checkInterrupted();
                Path target = destination.resolve(entry.getName()).normalize();
                if (!target.startsWith(destination) || target.equals(destination)
                        || target.equals(destination.resolve(MARKER))) {
                    throw new IOException("Invalid bundled resource path: " + entry.getName());
                }
                if (entry.isDirectory()) {
                    createDirectory(target, directories);
                } else {
                    count++;
                    createDirectory(target.getParent(), directories);
                    copyFile(zip, target, buffer);
                }
                zip.closeEntry();
            }
        }
        // ZipInputStream can accept EOF between entries in a truncated archive.
        if (count != expected) throw new IOException("Incomplete game data bundle");
        createDirectory(destination.resolve("Skins"), directories);
        createDirectory(destination.resolve("Songs"), directories);
        checkInterrupted();
        // Only commit completion after every file succeeded. Never version this
        // marker: an app update must not trigger another full resource scan.
        Files.createFile(destination.resolve(MARKER));
    }

    private static void createDirectory(Path path, Set<Path> directories) throws IOException {
        if (directories.add(path)) Files.createDirectories(path);
    }

    private static void copyFile(InputStream input, Path target, byte[] buffer) throws IOException {
        if (Files.exists(target)) {
            if (!Files.isRegularFile(target)) throw new IOException("Expected a file: " + target);
            return;
        }
        Path temporary = Files.createTempFile(target.getParent(), ".ourtaiko-", ".tmp");
        try {
            try (OutputStream output = Files.newOutputStream(temporary)) {
                int count;
                while ((count = input.read(buffer)) != -1) {
                    checkInterrupted();
                    output.write(buffer, 0, count);
                }
            }
            checkInterrupted();
            if (!Files.exists(target)) Files.move(temporary, target);
        } finally {
            Files.deleteIfExists(temporary);
        }
    }

    private static void checkInterrupted() throws InterruptedIOException {
        if (Thread.currentThread().isInterrupted()) throw new InterruptedIOException("Setup cancelled");
    }
}
