package tn.esprit.projetpi;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.projetpi.entities.*;
import tn.esprit.projetpi.repositories.EventReactionRepository;
import tn.esprit.projetpi.repositories.EventRepository;
import tn.esprit.projetpi.service.EventReactionService;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventReactionServiceMockitoTest {

    @Mock
    private EventReactionRepository reactionRepository;

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventReactionService service;

    @Test
    void react_shouldSaveReaction_whenUserHasNotVoted() {

        Long eventId = 1L;
        Long userId = 10L;

        Event event = new Event();
        event.setId(eventId);
        event.setTitle("Test Event");

        // MOCK behavior
        when(reactionRepository.existsByEventIdAndUserId(eventId, userId))
                .thenReturn(false);

        when(eventRepository.findById(eventId))
                .thenReturn(Optional.of(event));

        // CALL SERVICE
        service.react(eventId, ReactionType.LIKE, userId);

        // VERIFY
        verify(reactionRepository, times(1)).save(any(EventReaction.class));
    }

    @Test
    void react_shouldThrowException_whenUserAlreadyVoted() {

        Long eventId = 1L;
        Long userId = 10L;

        when(reactionRepository.existsByEventIdAndUserId(eventId, userId))
                .thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.react(eventId, ReactionType.LIKE, userId));

        assertEquals("Vous avez déjà voté pour cet événement !", exception.getMessage());

        verify(reactionRepository, never()).save(any());
    }

    @Test
    void react_shouldThrowException_whenEventNotFound() {

        Long eventId = 1L;
        Long userId = 10L;

        when(reactionRepository.existsByEventIdAndUserId(eventId, userId))
                .thenReturn(false);

        when(eventRepository.findById(eventId))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.react(eventId, ReactionType.LIKE, userId));

        assertEquals("Event not found", exception.getMessage());
    }
}