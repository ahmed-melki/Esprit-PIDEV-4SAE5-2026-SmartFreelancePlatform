package tn.esprit.projetpi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.projetpi.entities.ReactionType;
import tn.esprit.projetpi.service.EventReactionService;

import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class EventReactionController {

    private final EventReactionService service;

    @PostMapping("/{eventId}/react")
    public ResponseEntity<?> react(
            @PathVariable Long eventId,
            @RequestParam ReactionType type,
            @RequestParam(required = false) Long userId) {

        // Si pas d'userId, utiliser un ID par défaut (temporaire)
        Long defaultUserId = (userId != null) ? userId : 1L;

        try {
            service.react(eventId, type, defaultUserId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{eventId}/stats")
    public ResponseEntity<Map<ReactionType, Long>> getStats(@PathVariable Long eventId) {
        return ResponseEntity.ok(service.getStats(eventId));
    }

    @GetMapping("/{eventId}/has-voted")
    public ResponseEntity<Boolean> hasUserVoted(
            @PathVariable Long eventId,
            @RequestParam(required = false) Long userId) {
        Long defaultUserId = (userId != null) ? userId : 1L;
        return ResponseEntity.ok(service.hasUserVoted(eventId, defaultUserId));
    }

    @GetMapping("/{eventId}/user-vote")
    public ResponseEntity<ReactionType> getUserVote(
            @PathVariable Long eventId,
            @RequestParam(required = false) Long userId) {
        Long defaultUserId = (userId != null) ? userId : 1L;
        return ResponseEntity.ok(service.getUserVote(eventId, defaultUserId));
    }

    @DeleteMapping("/{eventId}/reset-votes")
    public ResponseEntity<Void> resetVotes(@PathVariable Long eventId) {
        service.resetVotes(eventId);
        return ResponseEntity.ok().build();
    }
}