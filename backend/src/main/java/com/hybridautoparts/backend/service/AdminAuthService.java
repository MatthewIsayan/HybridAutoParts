package com.hybridautoparts.backend.service;

import com.hybridautoparts.backend.config.AdminUserMapper;
import com.hybridautoparts.backend.config.JwtProperties;
import com.hybridautoparts.backend.dto.AdminLoginRequest;
import com.hybridautoparts.backend.dto.AdminLoginResponse;
import com.hybridautoparts.backend.model.AdminUser;
import com.hybridautoparts.backend.repository.AdminUserRepository;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final AdminUserMapper adminUserMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;
    private final AdminAuditLogger adminAuditLogger;

    public AdminAuthService(
            AdminUserRepository adminUserRepository,
            AdminUserMapper adminUserMapper,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            JwtProperties jwtProperties,
            AdminAuditLogger adminAuditLogger
    ) {
        this.adminUserRepository = adminUserRepository;
        this.adminUserMapper = adminUserMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.jwtProperties = jwtProperties;
        this.adminAuditLogger = adminAuditLogger;
    }

    public AdminLoginResponse login(AdminLoginRequest request) {
        AdminUser user = adminUserRepository.findByUsernameIgnoreCase(request.username())
                .orElse(null);
        if (user == null) {
            adminAuditLogger.logLoginFailure(request.username(), "user_not_found");
            throw invalidCredentials();
        }

        if (!user.isActive()) {
            adminAuditLogger.logLoginFailure(request.username(), "user_inactive");
            throw invalidCredentials();
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            adminAuditLogger.logLoginFailure(request.username(), "password_mismatch");
            throw invalidCredentials();
        }

        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(jwtProperties.expiration());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("hybrid-auto-parts-backend")
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(user.getUsername())
                .claim("scope", user.getRole())
                .claim("adminUserId", user.getId())
                .claim("displayName", user.getDisplayName())
                .build();

        String accessToken = jwtEncoder.encode(
                JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)
        ).getTokenValue();
        adminAuditLogger.logLoginSuccess(user);

        return new AdminLoginResponse(
                "Bearer",
                accessToken,
                OffsetDateTime.ofInstant(expiresAt, ZoneOffset.UTC),
                adminUserMapper.toDto(user)
        );
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials.");
    }
}
