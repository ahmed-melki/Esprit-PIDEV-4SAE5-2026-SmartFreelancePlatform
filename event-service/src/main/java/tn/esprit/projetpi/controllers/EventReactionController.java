package tn.esprit.projetpi.controllers;

import lombok.RequiredArgsConstructor;
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

    // Ajouter une réaction
    @PostMapping("/{eventId}/react")
    public String react(@PathVariable Long eventId,
                        @RequestParam ReactionType type) {
        service.react(eventId, type);
        return "Réaction ajoutée avec succès!";
    }

    // Obtenir les stats des réactions
    @GetMapping("/{eventId}/stats")
    public Map<ReactionType, Long> stats(@PathVariable Long eventId) {
        return service.getStats(eventId);
    }
}