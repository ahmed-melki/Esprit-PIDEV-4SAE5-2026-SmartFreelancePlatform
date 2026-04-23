package tn.esprit.templateexamen.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.templateexamen.entite.Conversation;
import tn.esprit.templateexamen.repository.ConversationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService implements IConversationService {

    private final ConversationRepository repository;

    @Override
    public Conversation createConversation(Conversation conversation) {
        return repository.save(conversation);
    }

    @Override
    public List<Conversation> getAllConversations() {
        return repository.findAll();
    }

    @Override
    public Conversation getConversationById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public void deleteConversation(Long id) {
        repository.deleteById(id);
    }

    // Méthode pour mettre à jour le dernier message d'une conversation
    public Conversation updateLastMessage(Long conversationId, String content, Long senderId) {
        Conversation conv = getConversationById(conversationId);
        if (conv != null) {
            conv.setLastMessageContent(content);
            conv.setLastMessageTime(java.time.LocalDateTime.now());
            conv.setLastMessageSenderId(senderId);
            return repository.save(conv);
        }
        return null;
    }

    // Nouvelle méthode pour mettre à jour le thème
    public Conversation updateTheme(Long id, String theme) {
        Conversation conv = getConversationById(id);
        if (conv == null) {
            throw new RuntimeException("Conversation non trouvée avec l'id : " + id);
        }
        conv.setTheme(theme);
        return repository.save(conv);
    }
}