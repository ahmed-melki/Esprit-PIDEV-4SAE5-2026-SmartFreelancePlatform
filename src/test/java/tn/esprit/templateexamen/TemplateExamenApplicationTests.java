package tn.esprit.templateexamen;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.templateexamen.entite.Conversation;
import tn.esprit.templateexamen.entite.ConversationStatus;
import tn.esprit.templateexamen.entite.Message;
import tn.esprit.templateexamen.entite.MessageStatus;
import tn.esprit.templateexamen.repository.ConversationRepository;
import tn.esprit.templateexamen.repository.MessageRepository;
import tn.esprit.templateexamen.service.ConversationService;
import tn.esprit.templateexamen.service.FaqService;
import tn.esprit.templateexamen.service.MessageService;
import tn.esprit.templateexamen.service.UrgencyService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TemplateExamenApplicationTests {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private FaqService faqService;

    @Mock
    private UrgencyService urgencyService;

    @InjectMocks
    private ConversationService conversationService;

    @InjectMocks
    private MessageService messageService;

    private Conversation conversation;
    private Message message;

    @BeforeEach
    public void setUp() {
        conversation = Conversation.builder()
                .id(1L)
                .clientId(1L)
                .freelanceId(2L)
                .projectId(1L)
                .status(ConversationStatus.ACTIVE)
                .theme("default")
                .urgentCount(0)
                .build();

        message = Message.builder()
                .id(1L)
                .conversationId(1L)
                .senderId(1L)
                .receiverId(2L)
                .content("Bonjour, comment avance le projet ?")
                .status(MessageStatus.SENT)
                .urgent(false)
                .deleted(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ================================================================
    // 2 TESTS WITH MOCKITO (CRUD)
    // ================================================================

    @Test
    public void testCreateConversation_WithMockito() {
        when(conversationRepository.save(any(Conversation.class))).thenReturn(conversation);

        Conversation result = conversationService.createConversation(conversation);

        assertNotNull(result);
        assertEquals(1L, result.getClientId());
        assertEquals(2L, result.getFreelanceId());
        assertEquals(ConversationStatus.ACTIVE, result.getStatus());
        assertEquals("default", result.getTheme());
        verify(conversationRepository, times(1)).save(any(Conversation.class));
    }

    @Test
    public void testGetConversationById_WithMockito() {
        when(conversationRepository.findById(1L)).thenReturn(Optional.of(conversation));

        Conversation result = conversationService.getConversationById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(ConversationStatus.ACTIVE, result.getStatus());
        verify(conversationRepository, times(1)).findById(1L);
    }

    // ================================================================
    // 2 TESTS WITH JUNIT (ADVANCED FEATURES)
    // ================================================================

    @Test
    public void testUpdateTheme_WithJUnit() {
        Conversation updated = Conversation.builder()
                .id(1L)
                .clientId(1L)
                .freelanceId(2L)
                .status(ConversationStatus.ACTIVE)
                .theme("dark")
                .build();

        when(conversationRepository.findById(1L)).thenReturn(Optional.of(conversation));
        when(conversationRepository.save(any(Conversation.class))).thenReturn(updated);

        Conversation result = conversationService.updateTheme(1L, "dark");

        assertNotNull(result);
        assertEquals("dark", result.getTheme());
        verify(conversationRepository, times(1)).save(any(Conversation.class));
    }

    @Test
    public void testSendMessage_NormalMessage_WithJUnit() {
        when(messageRepository.save(any(Message.class))).thenReturn(message);
        when(urgencyService.isUrgent(any(String.class))).thenReturn(false);
        when(faqService.suggestReply(any(String.class))).thenReturn(null);
        when(conversationRepository.findById(1L)).thenReturn(Optional.of(conversation));
        when(messageRepository.findByConversationIdOrderByCreatedAtDesc(1L))
                .thenReturn(Arrays.asList(message));
        when(messageRepository.findByConversationId(1L))
                .thenReturn(Arrays.asList(message));

        Message result = messageService.sendMessage(message);

        assertNotNull(result);
        assertEquals("Bonjour, comment avance le projet ?", result.getContent());
        assertFalse(result.isDeleted());
        assertFalse(result.isUrgent());
        verify(messageRepository, atLeastOnce()).save(any(Message.class));
    }
}