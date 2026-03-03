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

    // Ajouter une réaction à un événement existant
    public void react(Long eventId, ReactionType type) {
        boolean alreadyReacted = repository.existsByEventId(eventId);
        if (alreadyReacted) {
            throw new RuntimeException("Cet événement a déjà été voté !");
        }
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        EventReaction reaction = new EventReaction();
        reaction.setEvent(event);
        reaction.setReactionType(type);
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
}