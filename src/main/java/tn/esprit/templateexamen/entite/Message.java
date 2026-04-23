package tn.esprit.templateexamen.entite;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String sentiment; // "POSITIVE", "NEUTRAL", "NEGATIVE"
    private Long conversationId;
    private Long senderId;
    private Long receiverId;
    private String content;
    private boolean urgent = false;
    // Message.java (extrait)
    private Double locationLat;
    private Double locationLng;
    private boolean isLocation = false; // true si c'est un partage de position

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime readAt; // null = non lu

    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private boolean inappropriate = false;

    @Builder.Default
    private boolean deleted = false; // ← nouveau champ, false par défaut

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}