package com.willow.controller;

import com.willow.service.UploadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Map;

/** Product photo uploads from the dashboard. Signed-in sellers only (it sits under /api/seller). */
@RestController
@RequestMapping("/api/seller/uploads")
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    /** Returns {@code {"url": "http://host/uploads/<file>"}}, ready to be saved on a product. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        String name = uploadService.saveImage(file);
        String url = ServletUriComponentsBuilder.fromCurrentContextPath().path("/uploads/").path(name).toUriString();
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", url));
    }
}
