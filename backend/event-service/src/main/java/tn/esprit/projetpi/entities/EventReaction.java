package tn.esprit.projetpi.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_reaction")
@Getter
@Setter
public class EventReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false)
    private ReactionType reactionType;

    // Relation avec Event existant
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    // ✅ Ajouter ce champ pour l'ID de l'utilisateur
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // ✅ Ajouter la date de création (optionnel mais recommandé)
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ✅ Auto-remplir la date avant la persistance
    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}