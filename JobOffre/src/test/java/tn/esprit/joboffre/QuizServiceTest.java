package tn.esprit.joboffre;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.repositories.QuizRepository;
import tn.esprit.joboffre.repositories.QuizResultRepository;
import tn.esprit.joboffre.services.QuizService;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuizResultRepository quizResultRepository;

    @InjectMocks
    private QuizService quizService;

    private Quiz quiz;
    private Question question;
    private Answer answer;
    private QuizResult quizResult;

    @BeforeEach
    void setUp() {
        // Création des objets avec des listes modifiables
        answer = new Answer();
        answer.setId(1L);
        answer.setText("Java");
        answer.setCorrect(true);

        question = new Question();
        question.setId(1L);
        question.setText("Quel langage?");
        question.setPoints(10);
        // ⭐ Liste modifiable
        question.setAnswers(new ArrayList<>());
        question.getAnswers().add(answer);
        answer.setQuestion(question);

        quiz = new Quiz();
        quiz.setId(1L);
        quiz.setTitle("Test Java");
        quiz.setPassingScore(70);
        // ⭐ Liste modifiable
        quiz.setQuestions(new ArrayList<>());
        quiz.getQuestions().add(question);
        question.setQuiz(quiz);

        quizResult = new QuizResult();
        quizResult.setId(1L);
        quizResult.setQuiz(quiz);
        quizResult.setUserId(5L);
        quizResult.setPassed(true);
        quizResult.setPercentage(85);
    }

    @Test
    void createQuiz_shouldSaveQuiz() {
        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);

        Quiz result = quizService.createQuiz(quiz);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Java");
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.isActive()).isTrue();
        verify(quizRepository).save(quiz);
    }

    @Test
    void getQuizById_shouldReturnQuiz() {
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));

        Quiz result = quizService.getQuizById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getQuizById_shouldThrowWhenNotFound() {
        when(quizRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> quizService.getQuizById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Quiz non trouvé");
    }

    @Test
    void getQuizzesByJob_shouldReturnList() {
        when(quizRepository.findByJobOfferId(1L)).thenReturn(List.of(quiz));

        List<Quiz> result = quizService.getQuizzesByJob(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    void updateQuiz_shouldUpdateExistingQuiz() {
        Quiz updatedQuiz = new Quiz();
        updatedQuiz.setTitle("Nouveau titre");
        updatedQuiz.setDescription("Nouvelle description");
        updatedQuiz.setPassingScore(80);
        updatedQuiz.setTimeLimitMinutes(45);
        updatedQuiz.setActive(false);
        updatedQuiz.setQuestions(new ArrayList<>()); // Liste modifiable

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);

        Quiz result = quizService.updateQuiz(1L, updatedQuiz);

        assertThat(result.getTitle()).isEqualTo("Nouveau titre");
        assertThat(result.getDescription()).isEqualTo("Nouvelle description");
        assertThat(result.getPassingScore()).isEqualTo(80);
        assertThat(result.getTimeLimitMinutes()).isEqualTo(45);
        assertThat(result.isActive()).isFalse();
        assertThat(result.getUpdatedAt()).isNotNull();
        verify(quizRepository).save(quiz);
    }

    @Test
    void addQuestionToQuiz_shouldAddNewQuestion() {
        Question newQuestion = new Question();
        newQuestion.setText("Nouvelle question?");
        newQuestion.setPoints(15);
        newQuestion.setAnswers(new ArrayList<>()); // Liste modifiable

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);

        Question result = quizService.addQuestionToQuiz(1L, newQuestion);

        assertThat(result).isNotNull();
        assertThat(result.getText()).isEqualTo("Nouvelle question?");
        verify(quizRepository).save(quiz);
    }

    @Test
    void evaluateQuiz_shouldReturnResultWhenPassed() {
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizResultRepository.save(any(QuizResult.class))).thenReturn(quizResult);

        Map<Long, List<Long>> answers = new HashMap<>();
        answers.put(1L, new ArrayList<>(List.of(1L)));

        QuizResult result = quizService.evaluateQuiz(1L, 5L, answers);

        assertThat(result).isNotNull();
        assertThat(result.isPassed()).isTrue();
        verify(quizResultRepository).save(any(QuizResult.class));
    }

    @Test
    void hasUserTakenQuiz_shouldReturnTrue() {
        when(quizResultRepository.existsByUserIdAndQuizId(5L, 1L)).thenReturn(true);

        boolean result = quizService.hasUserTakenQuiz(1L, 5L);

        assertThat(result).isTrue();
    }

    @Test
    void hasUserPassedQuiz_shouldReturnTrue() {
        when(quizResultRepository.existsByUserIdAndQuizIdAndPassedTrue(5L, 1L)).thenReturn(true);

        boolean result = quizService.hasUserPassedQuiz(1L, 5L);

        assertThat(result).isTrue();
    }

    @Test
    void getQuizResult_shouldReturnResult() {
        when(quizResultRepository.findByQuizIdAndUserId(1L, 5L)).thenReturn(Optional.of(quizResult));

        QuizResult result = quizService.getQuizResult(1L, 5L);

        assertThat(result).isNotNull();
        assertThat(result.isPassed()).isTrue();
    }

    @Test
    void deleteQuiz_shouldDeleteQuizAndResults() {
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizResultRepository.findByQuizId(1L)).thenReturn(new ArrayList<>(List.of(quizResult)));
        doNothing().when(quizResultRepository).deleteAll(anyList());
        doNothing().when(quizRepository).delete(quiz);

        quizService.deleteQuiz(1L);

        verify(quizResultRepository).deleteAll(anyList());
        verify(quizRepository).delete(quiz);
    }

    @Test
    void deleteQuizById_shouldDeleteWhenExists() {
        when(quizRepository.existsById(1L)).thenReturn(true);
        when(quizResultRepository.findByQuizId(1L)).thenReturn(new ArrayList<>(List.of(quizResult)));
        doNothing().when(quizResultRepository).deleteAll(anyList());
        doNothing().when(quizRepository).deleteById(1L);

        quizService.deleteQuizById(1L);

        verify(quizRepository).deleteById(1L);
    }

    @Test
    void deleteQuizById_shouldThrowWhenNotExists() {
        when(quizRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> quizService.deleteQuizById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Quiz non trouvé avec l'id: 99");
    }



    @Test
    void getQuizzesByJob_shouldReturnEmptyListWhenJobIdNull() {
        List<Quiz> result = quizService.getQuizzesByJob(null);
        assertThat(result).isEmpty();
    }
}