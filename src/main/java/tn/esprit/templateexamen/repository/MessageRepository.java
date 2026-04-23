package tn.esprit.templateexamen.repository;

import tn.esprit.templateexamen.entite.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationId(Long conversationId);
    List<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId);
}