package tn.esprit.blogservice.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.blogservice.Service.ReactionService;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reactions")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleReaction(@RequestBody Map<String, Object> payload) {
        try {
            Long articleId = Long.valueOf(payload.get("articleId").toString());
            String sessionId = payload.get("sessionId").toString();
            String reactionType = payload.get("reactionType").toString();

            Map<String, Object> response = reactionService.toggleReaction(articleId, sessionId, reactionType);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUserReaction(
            @RequestParam Long articleId,
            @RequestParam String sessionId) {

        try {
            Map<String, Object> response = reactionService.getUserReaction(articleId, sessionId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}