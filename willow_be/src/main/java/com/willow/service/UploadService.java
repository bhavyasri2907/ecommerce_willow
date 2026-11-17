package com.willow.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Stores product photos uploaded from the dashboard in a folder on this server.
 * They are then served publicly under /uploads (see UploadConfig).
 */
@Service
public class UploadService {

    private final Path directory;

    public UploadService(@Value("${willow.uploads.dir}") String directory) {
        this.directory = Paths.get(directory).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.directory);
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot create the uploads folder " + this.directory, e);
        }
    }

    public Path directory() {
        return directory;
    }

    /**
     * Saves an image and returns the file name it was stored under. The type is decided
     * from the file's own bytes, never from the name or content type the browser sent.
     */
    public String saveImage(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Choose an image to upload");
        try {
            byte[] bytes = file.getBytes();
            String extension = imageExtension(bytes);
            if (extension == null) {
                throw new IllegalArgumentException("Only JPG, PNG or WebP images can be uploaded");
            }
            String name = UUID.randomUUID() + extension;
            Files.write(directory.resolve(name), bytes);
            return name;
        } catch (IOException e) {
            throw new UncheckedIOException("Could not save the image", e);
        }
    }

    /** ".jpg", ".png" or ".webp" judged by the file signature; null for anything else. */
    private static String imageExtension(byte[] b) {
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) return ".jpg";
        if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') return ".png";
        if (b.length >= 12
                && "RIFF".equals(new String(b, 0, 4, StandardCharsets.US_ASCII))
                && "WEBP".equals(new String(b, 8, 4, StandardCharsets.US_ASCII))) return ".webp";
        return null;
    }
}
