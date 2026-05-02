package tn.esprit.joboffre;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.joboffre.controllers.QuizController;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.services.QuizService;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuizController.class)
class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QuizService quizService;

    @Autowired
    private ObjectMapper objectMapper;

    private Quiz sampleQuiz;

    @BeforeEach
    void setUp() {
        sampleQuiz = new Quiz();
        sampleQuiz.setId(1L);
        sampleQuiz.setTitle("Quiz Java");
        sampleQuiz.setDescription("Testez vos connaissances Java");
        sampleQuiz.setPassingScore(70);
        sampleQuiz.setTimeLimitMinutes(30);
        sampleQuiz.setActive(true);

        JobOffer job = new JobOffer();
        job.setId(1L);
        sampleQuiz.setJobOffer(job);
    }

    @Test
    void createQuiz_shouldReturn201() throws Exception {
        when(quizService.createQuiz(any(Quiz.class))).thenReturn(sampleQuiz);

        mockMvc.perform(post("/api/quizzes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleQuiz)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Quiz Java"));
    }

    @Test
    void getQuiz_shouldReturn200() throws Exception {
        when(quizService.getQuizById(1L)).thenReturn(sampleQuiz);

        mockMvc.perform(get("/api/quizzes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void getQuizzesByJob_shouldReturn200() throws Exception {
        when(quizService.getQuizzesByJob(1L)).thenReturn(List.of(sampleQuiz));

        mockMvc.perform(get("/api/quizzes/job/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void updateQuiz_shouldReturn200() throws Exception {
        when(quizService.updateQuiz(eq(1L), any(Quiz.class))).thenReturn(sampleQuiz);

        mockMvc.perform(put("/api/quizzes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleQuiz)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void deleteQuiz_shouldReturn204() throws Exception {
        doNothing().when(quizService).deleteQuiz(1L);

        mockMvc.perform(delete("/api/quizzes/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void evaluateQuiz_shouldReturn200() throws Exception {
        QuizResult result = new QuizResult();
        result.setId(1L);
        result.setPassed(true);
        result.setPercentage(85.0);

        when(quizService.evaluateQuiz(eq(1L), eq(5L), anyMap())).thenReturn(result);

        Map<Long, List<Long>> answers = new HashMap<>();
        answers.put(1L, List.of(1L, 2L));

        mockMvc.perform(post("/api/quizzes/1/evaluate")
                        .param("userId", "5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(answers)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.passed").value(true));
    }

    @Test
    void hasUserTakenQuiz_shouldReturn200() throws Exception {
        when(quizService.hasUserTakenQuiz(1L, 5L)).thenReturn(true);

        mockMvc.perform(get("/api/quizzes/1/taken/5"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    void hasUserPassedQuiz_shouldReturn200() throws Exception {
        when(quizService.hasUserPassedQuiz(1L, 5L)).thenReturn(true);

        mockMvc.perform(get("/api/quizzes/1/passed/5"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    void getQuizResult_shouldReturn200WhenFound() throws Exception {
        QuizResult result = new QuizResult();
        result.setId(1L);
        when(quizService.getQuizResult(1L, 5L)).thenReturn(result);

        mockMvc.perform(get("/api/quizzes/1/result/5"))
                .andExpect(status().isOk());
    }

    @Test
    void getQuizResult_shouldReturn404WhenNotFound() throws Exception {
        when(quizService.getQuizResult(1L, 5L)).thenReturn(null);

        mockMvc.perform(get("/api/quizzes/1/result/5"))
                .andExpect(status().isNotFound());
    }
}