package com.hybridautoparts.backend.repository;

import com.hybridautoparts.backend.model.PartImage;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PartImageRepository extends JpaRepository<PartImage, Long> {

    List<PartImage> findByPartIdOrderBySortOrderAscIdAsc(Long partId);

    Optional<PartImage> findByIdAndPartId(Long id, Long partId);

    @Query("select coalesce(max(partImage.sortOrder), 0) from PartImage partImage where partImage.part.id = :partId")
    int findMaxSortOrderByPartId(@Param("partId") Long partId);
}
