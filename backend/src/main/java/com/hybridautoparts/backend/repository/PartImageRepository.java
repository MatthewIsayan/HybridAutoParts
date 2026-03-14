package com.hybridautoparts.backend.repository;

import com.hybridautoparts.backend.model.PartImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartImageRepository extends JpaRepository<PartImage, Long> {
}
