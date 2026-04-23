package tn.esprit.templateexamen.control;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.templateexamen.entite.Conversation;
import tn.esprit.templateexamen.service.ConversationService;
import tn.esprit.templateexamen.service.FaqService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final FaqService faqService;

    // Create
    @PostMapping
    public Conversation create(@RequestBody Conversation conversation) {
        return conversationService.createConversation(conversation);
    }

    // Read all
    @GetMapping
    public List<Conversation> getAll() {
        return conversationService.getAllConversations();
    }

    // Read one by ID
    @GetMapping("/{id}")
    public Conversation getById(@PathVariable Long id) {
        return conversationService.getConversationById(id);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        conversationService.deleteConversation(id);
    }

    // Mise à jour du thème (nouvel endpoint)
    @PatchMapping("/{id}/theme")
    public Conversation updateTheme(@PathVariable Long id, @RequestParam String theme) {
        return conversationService.updateTheme(id, theme);
    }
    @GetMapping("/{id}/urgent-status")
    public ResponseEntity<Map<String, Object>> getUrgentStatus(@PathVariable Long id) {
        Conversation conv = conversationService.getConversationById(id);
        if (conv == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of("urgentCount", conv.getUrgentCount()));
    }
}