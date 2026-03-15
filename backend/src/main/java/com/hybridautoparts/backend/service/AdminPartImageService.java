package com.hybridautoparts.backend.service;

import com.hybridautoparts.backend.config.PartImageMapper;
import com.hybridautoparts.backend.config.PartMapper;
import com.hybridautoparts.backend.dto.PartDto;
import com.hybridautoparts.backend.dto.PartImageDto;
import com.hybridautoparts.backend.model.Part;
import com.hybridautoparts.backend.model.PartImage;
import com.hybridautoparts.backend.repository.PartImageRepository;
import com.hybridautoparts.backend.repository.PartRepository;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminPartImageService {

    private final PartRepository partRepository;
    private final PartImageRepository partImageRepository;
    private final PartMapper partMapper;
    private final PartImageMapper partImageMapper;
    private final MediaStorageService mediaStorageService;

    public AdminPartImageService(
            PartRepository partRepository,
            PartImageRepository partImageRepository,
            PartMapper partMapper,
            PartImageMapper partImageMapper,
            MediaStorageService mediaStorageService
    ) {
        this.partRepository = partRepository;
        this.partImageRepository = partImageRepository;
        this.partMapper = partMapper;
        this.partImageMapper = partImageMapper;
        this.mediaStorageService = mediaStorageService;
    }

    @Transactional(readOnly = true)
    public List<PartImageDto> getImages(long partId) {
        verifyPartExists(partId);
        return partImageRepository.findByPartIdOrderBySortOrderAscIdAsc(partId).stream()
                .map(partImageMapper::toDto)
                .toList();
    }

    @Transactional
    public PartDto uploadImages(long partId, List<MultipartFile> files, List<String> altTexts) {
        Part part = loadPart(partId);
        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one image file is required.");
        }

        List<String> storedUrls = new ArrayList<>();
        int nextSortOrder = partImageRepository.findMaxSortOrderByPartId(partId);

        try {
            for (int index = 0; index < files.size(); index++) {
                MultipartFile file = files.get(index);
                MediaStorageService.StoredMediaFile storedMediaFile = mediaStorageService.storePartImage(partId, file);
                storedUrls.add(storedMediaFile.publicUrl());

                PartImage image = new PartImage();
                image.setPart(part);
                image.setUrl(storedMediaFile.publicUrl());
                image.setAltText(resolveAltText(file, altTexts, index, part));
                image.setSortOrder(++nextSortOrder);
                image.setPlaceholder(false);
                part.getImages().add(image);
            }
        } catch (RuntimeException exception) {
            storedUrls.forEach(mediaStorageService::deleteByPublicUrl);
            throw exception;
        }

        partRepository.save(part);
        return reloadPartDto(partId);
    }

    @Transactional
    public PartDto reorderImages(long partId, List<Long> imageIds) {
        if (imageIds == null || imageIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image order is required.");
        }

        Part part = loadPart(partId);
        List<PartImage> currentImages = new ArrayList<>(part.getImages());
        Set<Long> currentImageIds = currentImages.stream().map(PartImage::getId).collect(java.util.stream.Collectors.toSet());
        Set<Long> requestedImageIds = new HashSet<>(imageIds);

        if (currentImages.size() != imageIds.size() || !requestedImageIds.equals(currentImageIds)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image order must include every image exactly once.");
        }

        Map<Long, PartImage> imagesById = currentImages.stream()
                .collect(java.util.stream.Collectors.toMap(PartImage::getId, image -> image));

        part.getImages().clear();
        int sortOrder = 1;
        for (Long imageId : imageIds) {
            PartImage image = imagesById.get(imageId);
            image.setSortOrder(sortOrder++);
            part.getImages().add(image);
        }

        partRepository.save(part);
        return reloadPartDto(partId);
    }

    @Transactional
    public PartDto deleteImage(long partId, long imageId) {
        Part part = loadPart(partId);
        PartImage image = partImageRepository.findByIdAndPartId(imageId, partId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Part image was not found."));

        String imageUrl = image.getUrl();
        removeImage(part, existingImage -> existingImage.getId().equals(imageId));
        resequenceImages(part.getImages());
        partRepository.save(part);
        mediaStorageService.deleteByPublicUrl(imageUrl);
        return reloadPartDto(partId);
    }

    private Part loadPart(long partId) {
        return partRepository.findDetailedById(partId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Part was not found."));
    }

    private void verifyPartExists(long partId) {
        if (!partRepository.existsById(partId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Part was not found.");
        }
    }

    private String resolveAltText(MultipartFile file, List<String> altTexts, int index, Part part) {
        if (altTexts != null && index < altTexts.size()) {
            String altText = altTexts.get(index);
            if (altText != null && !altText.trim().isEmpty()) {
                return altText.trim();
            }
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName != null && !originalFileName.isBlank()) {
            return originalFileName.trim();
        }

        return part.getTitle();
    }

    private void resequenceImages(List<PartImage> images) {
        for (int index = 0; index < images.size(); index++) {
            images.get(index).setSortOrder(index + 1);
        }
    }

    private void removeImage(Part part, Predicate<PartImage> predicate) {
        part.getImages().removeIf(predicate);
    }

    private PartDto reloadPartDto(long partId) {
        return partRepository.findDetailedById(partId)
                .map(partMapper::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Part was not found."));
    }
}
