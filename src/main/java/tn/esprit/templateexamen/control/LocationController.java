package tn.esprit.templateexamen.control;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.templateexamen.Dto.LocationShareRequest;
import tn.esprit.templateexamen.entite.Message;
import tn.esprit.templateexamen.entite.MessageStatus;
import tn.esprit.templateexamen.service.MessageService;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200") // à adapter si nécessaire
public class LocationController {

    private final MessageService messageService;

    @PostMapping("/share")
    public ResponseEntity<Message> shareLocation(@RequestBody LocationShareRequest request) {
        Message message = new Message();
        message.setConversationId(request.getConversationId());
        message.setSenderId(request.getSenderId());
        message.setContent("📍 Position partagée");
        message.setLocationLat(request.getLatitude());
        message.setLocationLng(request.getLongitude());
        message.setLocation(true);
        message.setStatus(MessageStatus.SENT);

        Message saved = messageService.sendMessage(message);
        return ResponseEntity.ok(saved);
    }
}