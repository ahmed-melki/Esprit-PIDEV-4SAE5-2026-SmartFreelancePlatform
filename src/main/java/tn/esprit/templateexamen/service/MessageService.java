package tn.esprit.templateexamen.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.templateexamen.entite.Conversation;
import tn.esprit.templateexamen.entite.Message;
import tn.esprit.templateexamen.entite.MessageStatus;
import tn.esprit.templateexamen.repository.ConversationRepository;
import tn.esprit.templateexamen.repository.MessageRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService implements IMessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final FaqService faqService;
    private final UrgencyService urgencyService;

    // Liste des gros mots
    private static final List<String> BAD_WORDS = Arrays.asList(
            "con", "merde", "pute", "salope", "enculé", "fuck", "shit", "putain", "bordel"
    );

    @Override
    public Message sendMessage(Message message) {
        // 🔹 SI C'EST UN PARTAGE DE POSITION → SAUVEGARDE DIRECTE SANS TRAITEMENT
        if (message.isLocation()) {
            return messageRepository.save(message);
        }

        // 1. Sauvegarde initiale (sans les modifs)
        Message saved = messageRepository.save(message);

        // 2. Vérification des gros mots
        String content = saved.getContent();
        boolean isBadWord = content != null && containsBadWord(content);

        if (isBadWord) {
            // Soft delete + marquage inapproprié
            saved.setDeleted(true);
            saved.setInappropriate(true);
            saved.setUrgent(false); // pas urgent si supprimé
            messageRepository.save(saved);
            updateConversationLastMessage(saved.getConversationId());
            updateConversationUrgentCount(saved.getConversationId());
            return saved; // pas de FAQ
        }

        // 3. Détection d'urgence (si pas supprimé)
        boolean urgent = urgencyService.isUrgent(content);
        saved.setUrgent(urgent);
        messageRepository.save(saved); // mise à jour du champ urgent

        // 4. Mise à jour de la conversation (dernier message)
        updateConversationLastMessage(saved.getConversationId());

        // 5. Mise à jour du compteur urgent
        updateConversationUrgentCount(saved.getConversationId());

        // 6. Réponse automatique FAQ (si applicable)
        if (content != null && !content.isEmpty() && !content.startsWith("🤖")) {
            String reply = faqService.suggestReply(content);
            if (reply != null) {
                Message autoReply = new Message();
                autoReply.setConversationId(saved.getConversationId());
                autoReply.setSenderId(saved.getReceiverId());
                autoReply.setReceiverId(saved.getSenderId());
                autoReply.setContent("🤖 " + reply);
                autoReply.setStatus(MessageStatus.SENT);
                autoReply.setDeleted(false);
                autoReply.setInappropriate(false);
                // Détection d'urgence pour la réponse auto (optionnel)
                autoReply.setUrgent(urgencyService.isUrgent(reply));
                Message savedAuto = messageRepository.save(autoReply);
                updateConversationLastMessage(savedAuto.getConversationId());
                updateConversationUrgentCount(savedAuto.getConversationId());
            }
        }

        return saved;
    }

    @Override
    public List<Message> getMessagesByConversation(Long conversationId) {
        return messageRepository.findByConversationId(conversationId);
    }

    @Override
    public Message getMessageById(Long id) {
        return messageRepository.findById(id).orElse(null);
    }

    @Override
    public Message updateMessage(Message message) {
        Message existing = messageRepository.findById(message.getId())
                .orElseThrow(() -> new RuntimeException("Message not found"));
        existing.setContent(message.getContent());
        existing.setStatus(message.getStatus());
        // L'urgence pourrait changer après modification ? On recalcule.
        boolean urgent = urgencyService.isUrgent(message.getContent());
        existing.setUrgent(urgent);
        Message updated = messageRepository.save(existing);
        updateConversationLastMessage(updated.getConversationId());
        updateConversationUrgentCount(updated.getConversationId());
        return updated;
    }

    @Override
    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
        // Après suppression physique, il faudrait recalculer le compteur, mais ici  on utilise softDelete
    }

    public void softDeleteMessage(Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setDeleted(true);
        message.setInappropriate(false); // suppression manuelle
        message.setUrgent(false); // plus urgent si supprimé
        messageRepository.save(message);
        updateConversationLastMessage(message.getConversationId());
        updateConversationUrgentCount(message.getConversationId());
    }

    private boolean containsBadWord(String text) {
        String lower = text.toLowerCase();
        return BAD_WORDS.stream().anyMatch(bw -> lower.contains(bw));
    }

    private void updateConversationLastMessage(Long conversationId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId);
        Message lastActive = messages.stream()
                .filter(m -> !m.isDeleted())
                .findFirst()
                .orElse(null);
        Conversation conv = conversationRepository.findById(conversationId).orElse(null);
        if (conv != null) {
            if (lastActive != null) {
                conv.setLastMessageContent(lastActive.getContent());
                conv.setLastMessageTime(lastActive.getCreatedAt());
                conv.setLastMessageSenderId(lastActive.getSenderId());
            } else {
                conv.setLastMessageContent(null);
                conv.setLastMessageTime(null);
                conv.setLastMessageSenderId(null);
            }
            conversationRepository.save(conv);
        }
    }

    private void updateConversationUrgentCount(Long conversationId) {
        List<Message> messages = messageRepository.findByConversationId(conversationId);
        long count = messages.stream()
                .filter(m -> !m.isDeleted() && m.isUrgent())
                .count();
        Conversation conv = conversationRepository.findById(conversationId).orElse(null);
        if (conv != null) {
            conv.setUrgentCount((int) count);
            conversationRepository.save(conv);
        }
    }

    public void markMessageAsRead(Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (message.getReadAt() == null) {
            message.setReadAt(LocalDateTime.now());
            messageRepository.save(message);
        }
    }
}