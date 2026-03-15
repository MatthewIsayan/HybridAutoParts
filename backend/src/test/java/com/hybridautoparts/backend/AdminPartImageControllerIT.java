package com.hybridautoparts.backend;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mock.web.MockMultipartFile;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminPartImageControllerIT {

    private static final Path UPLOADS_DIRECTORY = createUploadsDirectory();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @DynamicPropertySource
    static void mediaProperties(DynamicPropertyRegistry registry) {
        registry.add("app.media.uploads-path", () -> UPLOADS_DIRECTORY.toString());
    }

    @Test
    void uploadsMultipleImagesAndServesThemFromStaticEndpoint() throws Exception {
        String token = loginAsAdmin();
        long partId = createAdminPart(token);

        MockMultipartFile firstFile = new MockMultipartFile("files", "battery-pack.png", "image/png", "first-image".getBytes());
        MockMultipartFile secondFile = new MockMultipartFile("files", "cluster.jpg", "image/jpeg", "second-image".getBytes());

        MvcResult uploadResult = mockMvc.perform(multipart("/api/admin/parts/{partId}/images", partId)
                        .file(firstFile)
                        .file(secondFile)
                        .param("altTexts", "Battery pack")
                        .param("altTexts", "Cluster display")
                        .header("Authorization", bearerToken(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.images.length()").value(2))
                .andExpect(jsonPath("$.images[0].sortOrder").value(1))
                .andExpect(jsonPath("$.images[1].sortOrder").value(2))
                .andExpect(jsonPath("$.images[0].url").value(org.hamcrest.Matchers.startsWith("/uploads/")))
                .andReturn();

        JsonNode uploadedPart = readJson(uploadResult);
        String firstUploadedUrl = uploadedPart.path("images").get(0).path("url").asText();
        String secondUploadedUrl = uploadedPart.path("images").get(1).path("url").asText();

        mockMvc.perform(get("/api/admin/parts/{partId}/images", partId)
                        .header("Authorization", bearerToken(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].altText").value("Battery pack"))
                .andExpect(jsonPath("$[1].altText").value("Cluster display"));

        mockMvc.perform(get(firstUploadedUrl))
                .andExpect(status().isOk())
                .andExpect(content().bytes("first-image".getBytes()));

        mockMvc.perform(get(secondUploadedUrl))
                .andExpect(status().isOk())
                .andExpect(content().bytes("second-image".getBytes()));
    }

    @Test
    void reordersAndDeletesUploadedImages() throws Exception {
        String token = loginAsAdmin();
        long partId = createAdminPart(token);

        MockMultipartFile firstFile = new MockMultipartFile("files", "first.png", "image/png", "first-image".getBytes());
        MockMultipartFile secondFile = new MockMultipartFile("files", "second.png", "image/png", "second-image".getBytes());

        JsonNode uploadedPart = readJson(mockMvc.perform(multipart("/api/admin/parts/{partId}/images", partId)
                        .file(firstFile)
                        .file(secondFile)
                        .header("Authorization", bearerToken(token)))
                .andExpect(status().isOk())
                .andReturn());

        long firstImageId = uploadedPart.path("images").get(0).path("id").asLong();
        long secondImageId = uploadedPart.path("images").get(1).path("id").asLong();
        String firstUploadedUrl = uploadedPart.path("images").get(0).path("url").asText();

        mockMvc.perform(patch("/api/admin/parts/{partId}/images/order", partId)
                        .header("Authorization", bearerToken(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "imageIds": [%d, %d]
                                }
                                """.formatted(secondImageId, firstImageId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.images[0].id").value(secondImageId))
                .andExpect(jsonPath("$.images[0].sortOrder").value(1))
                .andExpect(jsonPath("$.images[1].id").value(firstImageId))
                .andExpect(jsonPath("$.images[1].sortOrder").value(2));

        mockMvc.perform(delete("/api/admin/parts/{partId}/images/{imageId}", partId, secondImageId)
                        .header("Authorization", bearerToken(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.images.length()").value(1))
                .andExpect(jsonPath("$.images[0].id").value(firstImageId))
                .andExpect(jsonPath("$.images[0].sortOrder").value(1));

        mockMvc.perform(get(firstUploadedUrl))
                .andExpect(status().isOk());
    }

    private long createAdminPart(String token) throws Exception {
        MvcResult createResult = mockMvc.perform(post("/api/admin/parts")
                        .header("Authorization", bearerToken(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "sku": "PHASE3-MEDIA-%d",
                                  "title": "Phase 3 Media Test Part",
                                  "description": "Part used for upload integration coverage.",
                                  "manufacturer": "Hybrid Auto Parts",
                                  "vehicleMake": "Tesla",
                                  "vehicleModel": "Model 3",
                                  "vehicleYear": "2019",
                                  "condition": "Tested",
                                  "status": "AVAILABLE",
                                  "locationCode": "MEDIA-01",
                                  "price": 299.99,
                                  "featured": false
                                }
                                """.formatted(System.nanoTime())))
                .andExpect(status().isCreated())
                .andReturn();

        return readJson(createResult).path("id").asLong();
    }

    private String loginAsAdmin() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "admin",
                                  "password": "password"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        return readJson(result).path("accessToken").asText();
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private String bearerToken(String token) {
        return "Bearer " + token;
    }

    private static Path createUploadsDirectory() {
        try {
            return Files.createTempDirectory("hybrid-auto-parts-phase3-uploads");
        } catch (IOException exception) {
            throw new IllegalStateException("Could not create temporary uploads directory.", exception);
        }
    }
}
