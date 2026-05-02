package tn.esprit.joboffre.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.services.QuizService;
import java.util.*;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = {"http://localhost:4200"})
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // ========== CREATE ==========
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        Quiz created = quizService.createQuiz(quiz);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ========== READ ==========
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Quiz>> getQuizzesByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(quizService.getQuizzesByJob(jobId));
    }

    // ========== UPDATE ==========
    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @RequestBody Quiz quiz) {
        Quiz updated = quizService.updateQuiz(id, quiz);
        return ResponseEntity.ok(updated);
    }

    // ========== DELETE ==========
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    // ========== EVALUATION ==========
    @PostMapping("/{quizId}/evaluate")
    public ResponseEntity<QuizResult> evaluateQuiz(
            @PathVariable Long quizId,
            @RequestParam Long userId,
            @RequestBody Map<Long, List<Long>> answers) {
        return ResponseEntity.ok(quizService.evaluateQuiz(quizId, userId, answers));
    }

    // ========== UTILITAIRES ==========
    @GetMapping("/{quizId}/taken/{userId}")
    public ResponseEntity<Boolean> hasUserTakenQuiz(@PathVariable Long quizId, @PathVariable Long userId) {
        return ResponseEntity.ok(quizService.hasUserTakenQuiz(quizId, userId));
    }

    @GetMapping("/{quizId}/passed/{userId}")
    public ResponseEntity<Boolean> hasUserPassedQuiz(@PathVariable Long quizId, @PathVariable Long userId) {
        return ResponseEntity.ok(quizService.hasUserPassedQuiz(quizId, userId));
    }

    @GetMapping("/{quizId}/result/{userId}")
    public ResponseEntity<QuizResult> getQuizResult(@PathVariable Long quizId, @PathVariable Long userId) {
        QuizResult result = quizService.getQuizResult(quizId, userId);
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.notFound().build();
    }
}