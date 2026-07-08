package com.architect.tracker.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
public class TrackerController {

    @Autowired
    private DataService dataService;

    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getData() {
        return ResponseEntity.ok(dataService.readData());
    }

    @PutMapping("/data")
    public ResponseEntity<Map<String, Object>> updateData(@RequestBody Map<String, Object> data) {
        if (dataService.writeData(data)) {
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed"));
        }
    }

    @GetMapping("/skills")
    public ResponseEntity<Object> getSkills() {
        Map<String, Object> data = dataService.readData();
        return ResponseEntity.ok(data.getOrDefault("skills", new Object[0]));
    }

    @PutMapping("/skills")
    public ResponseEntity<Map<String, Object>> updateSkills(@RequestBody Object skills) {
        Map<String, Object> data = dataService.readData();
        data.put("skills", skills);
        if (dataService.writeData(data)) {
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed"));
        }
    }

    @GetMapping("/plan")
    public ResponseEntity<Object> getPlan() {
        Map<String, Object> data = dataService.readData();
        return ResponseEntity.ok(data.getOrDefault("sixMonthPlan", new HashMap<>()));
    }

    @PutMapping("/plan")
    public ResponseEntity<Map<String, Object>> updatePlan(@RequestBody Object plan) {
        Map<String, Object> data = dataService.readData();
        data.put("sixMonthPlan", plan);
        if (dataService.writeData(data)) {
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed"));
        }
    }

    @GetMapping("/today")
    public ResponseEntity<Map<String, Object>> getToday() {
        Map<String, Object> data = dataService.readData();
        String today = LocalDate.now().toString();
        
        Map<String, Object> days = (Map<String, Object>) data.getOrDefault("days", new HashMap<>());
        Object dayData = days.getOrDefault(today, Map.of("tasks", new HashMap<>(), "checklist", new HashMap<>()));
        
        Map<String, Object> response = new HashMap<>();
        response.put("today", today);
        response.put("dayData", dayData);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestBody Map<String, String> payload) {
        String image = payload.get("image");
        if (image == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No image provided"));
        }

        Pattern pattern = Pattern.compile("^data:image/([a-zA-Z0-9-+]+);base64,(.+)$");
        Matcher matcher = pattern.matcher(image);

        if (!matcher.matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid image format"));
        }

        String ext = matcher.group(1);
        String base64Data = matcher.group(2);

        try {
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            String filename = "img_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000) + "." + ext;
            Path imagePath = Paths.get("../data/images", filename).toAbsolutePath().normalize();
            
            Files.createDirectories(imagePath.getParent());
            Files.write(imagePath, imageBytes);

            return ResponseEntity.ok(Map.of("url", "/api/images/" + filename));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload image"));
        }
    }
}
