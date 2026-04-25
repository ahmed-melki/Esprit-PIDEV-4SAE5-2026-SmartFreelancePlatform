package tn.esprit.projetpi;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.projetpi.controllers.EventReactionController;
import tn.esprit.projetpi.entities.ReactionType;
import tn.esprit.projetpi.service.EventReactionService;

import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventReactionController.class)
class EventReactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventReactionService service;

    // ---------------- REACT ----------------
    @Test
    void react_shouldReturnOk() throws Exception {

        doNothing().when(service).react(anyLong(), any(), anyLong());

        mockMvc.perform(post("/api/events/1/react")
                        .param("type", "LIKE")
                        .param("userId", "2"))
                .andExpect(status().isOk());

        verify(service, times(1)).react(1L, ReactionType.LIKE, 2L);
    }

    // ---------------- REACT DEFAULT USER ----------------
    @Test
    void react_shouldUseDefaultUserId() throws Exception {

        doNothing().when(service).react(anyLong(), any(), anyLong());

        mockMvc.perform(post("/api/events/1/react")
                        .param("type", "DISLIKE"))
                .andExpect(status().isOk());

        verify(service).react(1L, ReactionType.DISLIKE, 1L);
    }

    // ---------------- STATS ----------------
    @Test
    void getStats_shouldReturnMap() throws Exception {

        Map<ReactionType, Long> stats = Map.of(
                ReactionType.LIKE, 10L,
                ReactionType.DISLIKE, 2L
        );

        when(service.getStats(1L)).thenReturn(stats);

        mockMvc.perform(get("/api/events/1/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.LIKE").value(10))
                .andExpect(jsonPath("$.DISLIKE").value(2));
    }

    // ---------------- HAS VOTED ----------------
    @Test
    void hasUserVoted_shouldReturnTrue() throws Exception {

        when(service.hasUserVoted(1L, 2L)).thenReturn(true);

        mockMvc.perform(get("/api/events/1/has-voted")
                        .param("userId", "2"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    // ---------------- USER VOTE ----------------
    @Test
    void getUserVote_shouldReturnReaction() throws Exception {

        when(service.getUserVote(1L, 2L)).thenReturn(ReactionType.LIKE);

        mockMvc.perform(get("/api/events/1/user-vote")
                        .param("userId", "2"))
                .andExpect(status().isOk())
                .andExpect(content().string("LIKE"));
    }

    // ---------------- RESET VOTES ----------------
    @Test
    void resetVotes_shouldReturnOk() throws Exception {

        doNothing().when(service).resetVotes(1L);

        mockMvc.perform(delete("/api/events/1/reset-votes"))
                .andExpect(status().isOk());

        verify(service).resetVotes(1L);
    }
}