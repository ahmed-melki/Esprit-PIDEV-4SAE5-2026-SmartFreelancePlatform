package Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tn.esprit.blogservice.Controllers.ReactionController;
import tn.esprit.blogservice.Service.ReactionService;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ReactionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReactionService reactionService;

    @InjectMocks
    private ReactionController reactionController;

    private ObjectMapper objectMapper;
    private Map<String, Object> mockResponse;
    private Map<String, Object> mockPayload;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reactionController).build();
        objectMapper = new ObjectMapper();

        // Réponse mockée pour les tests
        mockResponse = new HashMap<>();
        mockResponse.put("success", true);
        mockResponse.put("reactionType", "LIKE");
        mockResponse.put("count", 5);

        // Payload mocké
        mockPayload = new HashMap<>();
        mockPayload.put("articleId", 1L);
        mockPayload.put("sessionId", "session123");
        mockPayload.put("reactionType", "LIKE");
    }

    @Test
    void toggleReaction_WithValidData_ShouldReturnOk() throws Exception {
        // Arrange
        when(reactionService.toggleReaction(anyLong(), anyString(), anyString()))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/reactions/toggle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.reactionType").value("LIKE"))
                .andExpect(jsonPath("$.count").value(5));

        verify(reactionService, times(1))
                .toggleReaction(1L, "session123", "LIKE");
    }

    @Test
    void toggleReaction_WithInvalidArticleId_ShouldReturnBadRequest() throws Exception {
        // Arrange
        Map<String, Object> invalidPayload = new HashMap<>();
        invalidPayload.put("articleId", "invalid");
        invalidPayload.put("sessionId", "session123");
        invalidPayload.put("reactionType", "LIKE");

        // Act & Assert
        mockMvc.perform(post("/api/reactions/toggle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPayload)))
                .andExpect(status().isBadRequest());

        verify(reactionService, never())
                .toggleReaction(anyLong(), anyString(), anyString());
    }

    @Test
    void toggleReaction_WhenServiceThrowsException_ShouldReturnBadRequest() throws Exception {
        // Arrange
        when(reactionService.toggleReaction(anyLong(), anyString(), anyString()))
                .thenThrow(new RuntimeException("Article not found"));

        // Act & Assert
        mockMvc.perform(post("/api/reactions/toggle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockPayload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Article not found"));

        verify(reactionService, times(1))
                .toggleReaction(1L, "session123", "LIKE");
    }

    @Test
    void toggleReaction_WithMissingSessionId_ShouldThrowException() throws Exception {
        // Arrange
        Map<String, Object> invalidPayload = new HashMap<>();
        invalidPayload.put("articleId", 1L);
        invalidPayload.put("reactionType", "LIKE");
        // sessionId manquant

        // Act & Assert
        mockMvc.perform(post("/api/reactions/toggle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPayload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getUserReaction_WithValidParameters_ShouldReturnOk() throws Exception {
        // Arrange
        Map<String, Object> userReactionResponse = new HashMap<>();
        userReactionResponse.put("reactionType", "LIKE");
        userReactionResponse.put("hasReacted", true);

        when(reactionService.getUserReaction(anyLong(), anyString()))
                .thenReturn(userReactionResponse);

        // Act & Assert
        mockMvc.perform(get("/api/reactions/user")
                        .param("articleId", "1")
                        .param("sessionId", "session123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reactionType").value("LIKE"))
                .andExpect(jsonPath("$.hasReacted").value(true));

        verify(reactionService, times(1))
                .getUserReaction(1L, "session123");
    }

    @Test
    void getUserReaction_WithMissingParameters_ShouldReturnBadRequest() throws Exception {
        // Act & Assert - articleId manquant
        mockMvc.perform(get("/api/reactions/user")
                        .param("sessionId", "session123"))
                .andExpect(status().isBadRequest());

        // Act & Assert - sessionId manquant
        mockMvc.perform(get("/api/reactions/user")
                        .param("articleId", "1"))
                .andExpect(status().isBadRequest());

        verify(reactionService, never())
                .getUserReaction(anyLong(), anyString());
    }

    @Test
    void getUserReaction_WhenServiceThrowsException_ShouldReturnBadRequest() throws Exception {
        // Arrange
        when(reactionService.getUserReaction(anyLong(), anyString()))
                .thenThrow(new RuntimeException("Article does not exist"));

        // Act & Assert
        mockMvc.perform(get("/api/reactions/user")
                        .param("articleId", "999")
                        .param("sessionId", "session123"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Article does not exist"));

        verify(reactionService, times(1))
                .getUserReaction(999L, "session123");
    }

    @Test
    void toggleReaction_WithDifferentReactionTypes_ShouldHandleAllTypes() throws Exception {
        // Test avec différents types de réactions
        String[] reactionTypes = {"LIKE", "DISLIKE", "LOVE", "HAHA", "SAD"};

        for (String reactionType : reactionTypes) {
            mockPayload.put("reactionType", reactionType);
            Map<String, Object> typeResponse = new HashMap<>(mockResponse);
            typeResponse.put("reactionType", reactionType);

            when(reactionService.toggleReaction(1L, "session123", reactionType))
                    .thenReturn(typeResponse);

            mockMvc.perform(post("/api/reactions/toggle")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(mockPayload)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.reactionType").value(reactionType));
        }

        verify(reactionService, times(reactionTypes.length))
                .toggleReaction(eq(1L), eq("session123"), anyString());
    }

    @Test
    void getUserReaction_WhenNoReactionExists_ShouldReturnEmptyResponse() throws Exception {
        // Arrange
        Map<String, Object> emptyResponse = new HashMap<>();
        emptyResponse.put("reactionType", null);
        emptyResponse.put("hasReacted", false);

        when(reactionService.getUserReaction(anyLong(), anyString()))
                .thenReturn(emptyResponse);

        // Act & Assert
        mockMvc.perform(get("/api/reactions/user")
                        .param("articleId", "1")
                        .param("sessionId", "newSession"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasReacted").value(false))
                .andExpect(jsonPath("$.reactionType").isEmpty());

        verify(reactionService, times(1))
                .getUserReaction(1L, "newSession");
    }
}