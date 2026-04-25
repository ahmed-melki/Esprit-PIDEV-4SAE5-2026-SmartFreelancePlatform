package tn.esprit.projetpi.controllers;

import org.springframework.web.bind.annotation.*;
import tn.esprit.projetpi.entities.Event;
import tn.esprit.projetpi.service.EventService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:4200")
public class EventController {

    private final EventService service;

    public EventController(EventService service) {
        this.service = service;
    }

    // 🔹 Récupérer tous les événements
    @GetMapping
    public List<Event> getAllEvents() {
        return service.getAllEvents();
    }

    // 🔹 Récupérer un événement par ID
    @GetMapping("/{id}")
    public Optional<Event> getEvent(@PathVariable Long id) {
        return service.getEventById(id);
    }

    // 🔹 Ajouter un événement
    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return service.saveEvent(event);
    }

    // 🔹 Mettre à jour un événement
    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable Long id, @RequestBody Event event) {
        event.setId(id); // Associer l'ID
        return service.saveEvent(event);
    }

    // 🔹 Supprimer un événement
    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        service.deleteEvent(id);
    }




}