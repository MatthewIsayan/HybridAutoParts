package com.hybridautoparts.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_config")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyConfig {

    @Id
    private Long id;

    @Column(name = "company_name", nullable = false, length = 160)
    private String companyName;

    @Column(name = "support_email", nullable = false, length = 160)
    private String supportEmail;

    @Column(nullable = false, length = 40)
    private String phone;

    @Column(name = "address_line", nullable = false, length = 160)
    private String addressLine;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "postal_code", nullable = false, length = 20)
    private String postalCode;

    @Column(name = "hero_headline", nullable = false, length = 160)
    private String heroHeadline;

    @Column(name = "hero_subheadline", nullable = false, length = 255)
    private String heroSubheadline;

    @Column(name = "about_text", columnDefinition = "text")
    private String aboutText;
}
