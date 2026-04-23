package tn.esprit.templateexamen.service;

import tn.esprit.templateexamen.entite.Conversation;
import java.util.List;

public interface IConversationService {
    Conversation createConversation(Conversation conversation);
    List<Conversation> getAllConversations();
    Conversation getConversationById(Long id);
    void deleteConversation(Long id);
    Conversation updateTheme(Long id, String theme); // nouvelle méthode
}