package tn.esprit.templateexamen.control;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.templateexamen.entite.Message;
import tn.esprit.templateexamen.entite.MessageStatus;
import tn.esprit.templateexamen.service.FaqService;
import tn.esprit.templateexamen.service.MessageService;
import tn.esprit.templateexamen.service.SentimentService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final FaqService faqService;  // injection du service FAQ

    @PostMapping
    public Message send(@RequestBody Message message) {
        return messageService.sendMessage(message);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Message uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("conversationId") Long conversationId,
            @RequestParam("senderId") Long senderId,
            @RequestParam("receiverId") Long receiverId,
            @RequestParam(value = "content", required = false) String content) throws IOException {

        String uploadDir = "uploads/";
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, file.getBytes());

        String fileUrl = "/api/communication/uploads/" + fileName;

        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content != null ? content : "📎 Fichier joint");
        message.setStatus(MessageStatus.SENT);
        message.setFileUrl(fileUrl);
        message.setFileName(file.getOriginalFilename());
        message.setFileSize(file.getSize());

        return messageService.sendMessage(message);
    }

    @GetMapping("/conversation/{conversationId}")
    public List<Message> getByConversation(@PathVariable Long conversationId) {
        return messageService.getMessagesByConversation(conversationId);
    }

    @GetMapping("/{id}")
    public Message getById(@PathVariable Long id) {
        return messageService.getMessageById(id);
    }

    @PutMapping("/{id}")
    public Message update(@PathVariable Long id, @RequestBody Message message) {
        message.setId(id);
        return messageService.updateMessage(message);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        messageService.softDeleteMessage(id);
    }

    // Endpoint pour obtenir une suggestion de réponse automatique
    @GetMapping("/{id}/suggested-reply")
    public ResponseEntity<String> getSuggestedReply(@PathVariable Long id) {
        Message message = messageService.getMessageById(id);
        if (message == null) {
            return ResponseEntity.notFound().build();
        }
        String suggestion = faqService.suggestReply(message.getContent());
        if (suggestion == null) {
            return ResponseEntity.noContent().build(); // 204 : pas de suggestion
        }
        return ResponseEntity.ok(suggestion);
    }

    private final SentimentService sentimentService; // à ajouter dans le constructeur

    @GetMapping("/{id}/sentiment")
    public ResponseEntity<String> getSentiment(@PathVariable Long id) {
        Message message = messageService.getMessageById(id);
        if (message == null) {
            return ResponseEntity.notFound().build();
        }
        String sentiment = sentimentService.analyze(message.getContent());
        return ResponseEntity.ok(sentiment);
    }
    @GetMapping("/conversation/{conversationId}/sentiment-stats")
    public ResponseEntity<Map<String, Long>> getSentimentStats(@PathVariable Long conversationId) {
        List<Message> messages = messageService.getMessagesByConversation(conversationId);
        long positive = 0, neutral = 0, negative = 0;
        for (Message m : messages) {
            if (m.isDeleted()) continue; // ignorer les messages supprimés
            String sentiment = sentimentService.analyze(m.getContent());
            switch (sentiment) {
                case "POSITIVE": positive++; break;
                case "NEGATIVE": negative++; break;
                default: neutral++;
            }
        }
        return ResponseEntity.ok(Map.of(
                "positive", positive,
                "neutral", neutral,
                "negative", negative
        ));
    }
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        messageService.markMessageAsRead(id);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/{id}/read-status")
    public ResponseEntity<LocalDateTime> getReadStatus(@PathVariable Long id) {
        Message message = messageService.getMessageById(id);
        if (message == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(message.getReadAt());
    }


}