package com.hybridautoparts.backend.service;

import com.hybridautoparts.backend.model.AdminUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AdminAuditLogger {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminAuditLogger.class);

    public void logLoginSuccess(AdminUser user) {
        LOGGER.atInfo()
                .addKeyValue("event", "admin_login_succeeded")
                .addKeyValue("actor", user.getUsername())
                .addKeyValue("adminUserId", user.getId())
                .log("Admin authentication succeeded");
    }

    public void logLoginFailure(String attemptedUsername, String reason) {
        LOGGER.atWarn()
                .addKeyValue("event", "admin_login_failed")
                .addKeyValue("actor", normalize(attemptedUsername))
                .addKeyValue("reason", reason)
                .log("Admin authentication failed");
    }

    public void logPartCreated(Long partId, String sku, String status) {
        logPartEvent("admin_part_created", partId, sku, status);
    }

    public void logPartUpdated(Long partId, String sku, String status) {
        logPartEvent("admin_part_updated", partId, sku, status);
    }

    public void logPartStatusChanged(Long partId, String sku, String previousStatus, String nextStatus) {
        LOGGER.atInfo()
                .addKeyValue("event", "admin_part_status_changed")
                .addKeyValue("actor", currentActor())
                .addKeyValue("partId", partId)
                .addKeyValue("sku", normalize(sku))
                .addKeyValue("previousStatus", normalize(previousStatus))
                .addKeyValue("nextStatus", normalize(nextStatus))
                .log("Admin part status changed");
    }

    public void logPartDeleted(Long partId, String sku) {
        LOGGER.atInfo()
                .addKeyValue("event", "admin_part_deleted")
                .addKeyValue("actor", currentActor())
                .addKeyValue("partId", partId)
                .addKeyValue("sku", normalize(sku))
                .log("Admin part deleted");
    }

    public void logImagesUploaded(Long partId, int uploadedCount) {
        LOGGER.atInfo()
                .addKeyValue("event", "admin_part_images_uploaded")
                .addKeyValue("actor", currentActor())
                .addKeyValue("partId", partId)
                .addKeyValue("uploadedCount", uploadedCount)
                .log("Admin part images uploaded");
    }

    public void logImagesReordered(Long partId, int imageCount) {
        LOGGER.atInfo()
                .addKeyValue("event", "admin_part_images_reordered")
                .addKeyValue("actor", currentActor())
                .addKeyValue("partId", partId)
                .addKeyValue("imageCount", imageCount)
                .log("Admin part images reordered");
    }

    public void logImageDeleted(Long partId, Long imageId) {
        LOGGER.atInfo()
                .addKeyValue("event", "admin_part_image_deleted")
                .addKeyValue("actor", currentActor())
                .addKeyValue("partId", partId)
                .addKeyValue("imageId", imageId)
                .log("Admin part image deleted");
    }

    public void logCompanyConfigUpdated(Long companyId) {
        LOGGER.atInfo()
                .addKeyValue("event", "admin_company_config_updated")
                .addKeyValue("actor", currentActor())
                .addKeyValue("companyId", companyId)
                .log("Admin company configuration updated");
    }

    private void logPartEvent(String event, Long partId, String sku, String status) {
        LOGGER.atInfo()
                .addKeyValue("event", event)
                .addKeyValue("actor", currentActor())
                .addKeyValue("partId", partId)
                .addKeyValue("sku", normalize(sku))
                .addKeyValue("status", normalize(status))
                .log("Admin part change recorded");
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return "anonymous";
        }

        return normalize(authentication.getName());
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? "unknown" : value.trim();
    }
}
