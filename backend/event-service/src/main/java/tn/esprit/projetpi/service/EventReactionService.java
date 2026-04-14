package tn.esprit.projetpi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.projetpi.entities.Event;
import tn.esprit.projetpi.entities.EventReaction;
import tn.esprit.projetpi.entities.ReactionType;
import tn.esprit.projetpi.repositories.EventReactionRepository;
import tn.esprit.projetpi.repositories.EventRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EventReactionService {

    private final EventReactionRepository repository;
    private final EventRepository eventRepository;

    // Ajouter une réaction à un événement (avec userId)
    public void react(Long eventId, ReactionType type, Long userId) {
        // Vérifier si l'utilisateur a déjà voté pour cet événement
        boolean alreadyReacted = repository.existsByEventIdAndUserId(eventId, userId);
        if (alreadyReacted) {
            throw new RuntimeException("Vous avez déjà voté pour cet événement !");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        EventReaction reaction = new EventReaction();
        reaction.setEvent(event);
        reaction.setReactionType(type);
        reaction.setUserId(userId);
        repository.save(reaction);
    }

    // Statistiques des réactions
    public Map<ReactionType, Long> getStats(Long eventId) {
        List<Object[]> results = repository.countReactionsByEvent(eventId);
        Map<ReactionType, Long> stats = new HashMap<>();
        for (Object[] obj : results) {
            stats.put((ReactionType) obj[0], (Long) obj[1]);
        }
        return stats;
    }

    // Vérifier si l'utilisateur a déjà voté
    public boolean hasUserVoted(Long eventId, Long userId) {
        return repository.existsByEventIdAndUserId(eventId, userId);
    }

    // Récupérer le vote de l'utilisateur
    public ReactionType getUserVote(Long eventId, Long userId) {
        return repository.findByEventIdAndUserId(eventId, userId)
                .map(EventReaction::getReactionType)
                .orElse(null);
    }

    // Réinitialiser tous les votes d'un événement (admin)
    public void resetVotes(Long eventId) {
        repository.deleteByEventId(eventId);
    }
}