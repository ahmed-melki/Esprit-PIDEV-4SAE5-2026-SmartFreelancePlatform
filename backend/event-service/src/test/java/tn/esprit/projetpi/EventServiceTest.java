package tn.esprit.projetpi;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.projetpi.entities.Event;
import tn.esprit.projetpi.repositories.EventReactionRepository;
import tn.esprit.projetpi.repositories.EventRepository;
import tn.esprit.projetpi.service.EventService;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository repository;

    @Mock
    private EventReactionRepository eventReactionRepository;

    @InjectMocks
    private EventService eventService;

    private Event event;

    @BeforeEach
    void setUp() {
        event = new Event();
        event.setId(1L);
        event.setTitle("Test Event");
    }

    // ✅ Test getAllEvents
    @Test
    void testGetAllEvents() {
        when(repository.findAll()).thenReturn(Arrays.asList(event));

        List<Event> events = eventService.getAllEvents();

        assertNotNull(events);
        assertEquals(1, events.size());
        verify(repository, times(1)).findAll();
    }

    // ✅ Test getEventById
    @Test
    void testGetEventById() {
        when(repository.findById(1L)).thenReturn(Optional.of(event));

        Optional<Event> result = eventService.getEventById(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
        verify(repository).findById(1L);
    }

    // ✅ Test saveEvent
    @Test
    void testSaveEvent() {
        when(repository.save(event)).thenReturn(event);

        Event saved = eventService.saveEvent(event);

        assertNotNull(saved);
        assertEquals("Test Event", saved.getTitle());
        verify(repository).save(event);
    }

}