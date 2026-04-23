package tn.esprit.templateexamen.service;

import tn.esprit.templateexamen.entite.Message;
import java.util.List;

public interface IMessageService {
    Message sendMessage(Message message);
    List<Message> getMessagesByConversation(Long conversationId);
    Message getMessageById(Long id);
    Message updateMessage(Message message);
    void deleteMessage(Long id);
    void softDeleteMessage(Long id); // nouvelle méthode
}