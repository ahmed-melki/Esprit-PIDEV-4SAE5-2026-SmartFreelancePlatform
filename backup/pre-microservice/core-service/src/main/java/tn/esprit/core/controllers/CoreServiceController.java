package tn.esprit.core.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/core")
public class CoreServiceController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
                "service", "core-service",
                "status", "UP"
        );
    }
}
