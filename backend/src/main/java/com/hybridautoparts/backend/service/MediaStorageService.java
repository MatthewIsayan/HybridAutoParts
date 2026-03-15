package com.hybridautoparts.backend.service;

import com.hybridautoparts.backend.config.MediaProperties;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MediaStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    private final MediaProperties mediaProperties;

    public MediaStorageService(MediaProperties mediaProperties) {
        this.mediaProperties = mediaProperties;
    }

    public StoredMediaFile storePartImage(long partId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uploaded image files must not be empty.");
        }

        String extension = extractAllowedExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + "." + extension;
        Path relativePath = Path.of("part-images", String.valueOf(partId), fileName);
        Path destination = resolveStoragePath(relativePath);

        try {
            Files.createDirectories(destination.getParent());
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Part image upload failed.");
        }

        return new StoredMediaFile(toPublicUrl(relativePath), destination);
    }

    public void deleteByPublicUrl(String publicUrl) {
        if (publicUrl == null || publicUrl.isBlank()) {
            return;
        }

        String normalizedPrefix = normalizeUrlPrefix();
        if (!publicUrl.startsWith(normalizedPrefix + "/")) {
            return;
        }

        String relativeSegment = publicUrl.substring(normalizedPrefix.length() + 1);
        if (relativeSegment.isBlank()) {
            return;
        }

        Path targetPath = resolveStoragePath(Path.of(relativeSegment));
        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Part image cleanup failed.");
        }
    }

    private Path resolveStoragePath(Path relativePath) {
        Path root = mediaProperties.uploadsPath().toAbsolutePath().normalize();
        Path resolved = root.resolve(relativePath).normalize();
        if (!resolved.startsWith(root)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid storage path.");
        }

        return resolved;
    }

    private String toPublicUrl(Path relativePath) {
        String path = relativePath.toString().replace('\\', '/');
        return normalizeUrlPrefix() + "/" + path;
    }

    private String normalizeUrlPrefix() {
        String prefix = mediaProperties.urlPrefix();
        if (prefix == null || prefix.isBlank()) {
            return "/uploads";
        }

        return prefix.startsWith("/") ? prefix : "/" + prefix;
    }

    private String extractAllowedExtension(String originalFilename) {
        String cleanedFileName = StringUtils.cleanPath(originalFilename == null ? "" : originalFilename);
        String extension = StringUtils.getFilenameExtension(cleanedFileName);
        if (extension == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uploaded images must include a file extension.");
        }

        String normalizedExtension = extension.toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(normalizedExtension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG, GIF, and WEBP images are supported.");
        }

        return normalizedExtension;
    }

    public record StoredMediaFile(
            String publicUrl,
            Path storedPath
    ) {
    }
}
