package tn.esprit.templateexamen.control;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.templateexamen.service.PresenceService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/presence")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    /**
     * Endpoint appelé régulièrement par le frontend pour signaler que l'utilisateur est actif.
     */
    @PostMapping("/heartbeat")
    public void heartbeat(@RequestParam Long userId) {
        presenceService.updatePresence(userId);
    }

    /**
     * Retourne le statut de présence d'un utilisateur.
     */
    @GetMapping("/{userId}")
    public Map<String, Object> getPresence(@PathVariable Long userId) {
        boolean online = presenceService.isOnline(userId);
        LocalDateTime lastSeen = presenceService.getLastSeen(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("online", online);
        result.put("lastSeen", lastSeen); // HashMap accepte null
        return result;
    }
}