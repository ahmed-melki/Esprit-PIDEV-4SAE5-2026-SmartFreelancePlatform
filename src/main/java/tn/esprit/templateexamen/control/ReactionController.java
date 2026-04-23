package tn.esprit.templateexamen.control;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.templateexamen.entite.Reaction;
import tn.esprit.templateexamen.service.IReactionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reactions")
@RequiredArgsConstructor
public class ReactionController {

    private final IReactionService reactionService;

    @PostMapping("/message/{messageId}")
    public ResponseEntity<?> addReaction(@PathVariable Long messageId,
                                         @RequestParam Long userId,
                                         @RequestParam String emoji) {
        try {
            Reaction reaction = reactionService.addReaction(messageId, userId, emoji);
            return ResponseEntity.ok(reaction);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<Void> removeReaction(@PathVariable Long messageId,
                                               @RequestParam Long userId,
                                               @RequestParam String emoji) {
        reactionService.removeReaction(messageId, userId, emoji);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/message/{messageId}")
    public List<Reaction> getReactions(@PathVariable Long messageId) {
        return reactionService.getReactionsByMessage(messageId);
    }
}