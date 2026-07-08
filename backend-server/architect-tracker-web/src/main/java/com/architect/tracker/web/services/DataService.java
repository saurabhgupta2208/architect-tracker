package com.architect.tracker.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Service
public class DataService {

    private final Path dataFile = Paths.get("../data/tracker.json").toAbsolutePath().normalize();
    private final ObjectMapper mapper = new ObjectMapper();

    public Map<String, Object> readData() {
        try {
            if (Files.exists(dataFile)) {
                return mapper.readValue(dataFile.toFile(), Map.class);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return new HashMap<>(); // Empty or default
    }

    public boolean writeData(Map<String, Object> data) {
        try {
            // Ensure directory exists
            Files.createDirectories(dataFile.getParent());
            mapper.writerWithDefaultPrettyPrinter().writeValue(dataFile.toFile(), data);
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }
}
