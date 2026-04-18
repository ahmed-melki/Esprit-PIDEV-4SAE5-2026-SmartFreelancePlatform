package tn.esprit.back.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.back.entities.Title;
import tn.esprit.back.entities.UserTitle;
import tn.esprit.back.services.TitleService;

import java.util.List;

@RestController
@RequestMapping("/api/titles")
@RequiredArgsConstructor
public class TitleController {

    private final TitleService titleService;

    @PostMapping
    public ResponseEntity<Title> createTitle(@RequestBody Title title) {
        return ResponseEntity.ok(titleService.createTitle(title));
    }

    @GetMapping
    public ResponseEntity<List<Title>> getAllActiveTitles() {
        return ResponseEntity.ok(titleService.getAllActiveTitles());
    }

    @GetMapping("/user/{clientId}")
    public ResponseEntity<List<UserTitle>> getUserTitles(@PathVariable Long clientId) {
        return ResponseEntity.ok(titleService.getUserTitles(clientId));
    }

    @PostMapping("/check/{clientId}")
    public ResponseEntity<List<Title>> checkAndUnlockTitles(@PathVariable Long clientId) {
        List<Title> unlockedTitles = titleService.checkAndUnlockTitles(clientId);
        return ResponseEntity.ok(unlockedTitles);
    }

    @PostMapping("/initialize")
    public ResponseEntity<String> initializeDefaultTitles() {
        titleService.initializeDefaultTitles();
        return ResponseEntity.ok("Default titles initialized successfully");
    }
}
