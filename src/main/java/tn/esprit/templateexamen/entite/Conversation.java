package tn.esprit.templateexamen.entite;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long clientId;
    private Long freelanceId;
    private Long projectId;
    private int urgentCount = 0; // nombre de messages urgents non supprimés dans la conversation
    @Enumerated(EnumType.STRING)
    private ConversationStatus status;

    // Nouveaux champs pour le dernier message
    private String lastMessageContent;
    private LocalDateTime lastMessageTime;
    private Long lastMessageSenderId;

    // Champ pour le thème de la conversation (nouveau)
    @Column(length = 50)
    private String theme = "default"; // Valeur par défaut
}