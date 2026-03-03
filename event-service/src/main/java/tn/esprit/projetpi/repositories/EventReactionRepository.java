package tn.esprit.projetpi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tn.esprit.projetpi.entities.EventReaction;

import java.util.List;

public interface EventReactionRepository extends JpaRepository<EventReaction, Long> {
    void deleteByEventId(Long eventId);

    // Récupérer toutes les réactions pour un événement
    List<EventReaction> findByEventId(Long eventId);
    boolean existsByEventId(Long eventId);

    // Compter les réactions par type pour un événement
    @Query("""
        SELECT r.reactionType, COUNT(r)
        FROM EventReaction r
        WHERE r.event.id = :eventId
        GROUP BY r.reactionType
    """)
    List<Object[]> countReactionsByEvent(Long eventId);
}