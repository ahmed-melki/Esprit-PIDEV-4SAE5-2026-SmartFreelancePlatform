package tn.esprit.projetpi.service;

import org.springframework.stereotype.Service;
import tn.esprit.projetpi.entities.Event;
import tn.esprit.projetpi.repositories.EventRepository;

import java.util.List;
import java.util.Optional;


@Service
public class EventService {

    private final EventRepository repository;

    public EventService(EventRepository repository) {
        this.repository = repository;
    }

    // 🔹 Liste de tous les événements
    public List<Event> getAllEvents() {
        return repository.findAll();
    }

    // 🔹 Récupérer un événement par ID
    public Optional<Event> getEventById(Long id) {
        return repository.findById(id);
    }

    // 🔹 Ajouter ou mettre à jour un événement
    public Event saveEvent(Event event) {
        return repository.save(event);
    }

    // 🔹 Supprimer un événement par ID
    public void deleteEvent(Long id) {
        repository.deleteById(id);
    }
}
