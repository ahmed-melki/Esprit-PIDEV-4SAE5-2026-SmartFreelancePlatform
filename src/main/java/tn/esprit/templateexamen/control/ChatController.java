package tn.esprit.templateexamen.control;

import org.springframework.web.bind.annotation.*;
import tn.esprit.templateexamen.service.DynamicChatService;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200") // pour Angular
public class ChatController {

    private final DynamicChatService chatService;

    public ChatController(DynamicChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> payload) {
        String message = payload.get("message");
        String response = chatService.ask(message);
        return Map.of("response", response);
    }
}