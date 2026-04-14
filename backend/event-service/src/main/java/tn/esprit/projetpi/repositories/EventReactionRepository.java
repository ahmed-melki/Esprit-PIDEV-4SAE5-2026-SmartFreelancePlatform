package tn.esprit.projetpi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.projetpi.entities.EventReaction;
import tn.esprit.projetpi.entities.ReactionType;
import java.util.List;
import java.util.Optional;

public interface EventReactionRepository extends JpaRepository<EventReaction, Long> {

    // Statistiques des réactions par événement
    @Query("SELECT e.reactionType, COUNT(e) FROM EventReaction e WHERE e.event.id = :eventId GROUP BY e.reactionType")
    List<Object[]> countReactionsByEvent(@Param("eventId") Long eventId);

    // ✅ Vérifier si un utilisateur a déjà voté pour un événement
    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    // ✅ Récupérer le vote d'un utilisateur pour un événement
    Optional<EventReaction> findByEventIdAndUserId(Long eventId, Long userId);

    // ✅ Supprimer tous les votes d'un événement
    void deleteByEventId(Long eventId);
}