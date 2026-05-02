package tn.esprit.joboffre.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.repositories.*;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;

    public QuizService(QuizRepository quizRepository, QuizResultRepository quizResultRepository) {
        this.quizRepository = quizRepository;
        this.quizResultRepository = quizResultRepository;
    }

    // ========== CRUD QUIZ ==========

    public Quiz createQuiz(Quiz quiz) {
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setActive(true);

        if (quiz.getQuestions() != null) {
            for (Question question : quiz.getQuestions()) {
                question.setQuiz(quiz);
                if (question.getAnswers() != null) {
                    for (Answer answer : question.getAnswers()) {
                        answer.setQuestion(question);
                       
                    }
                }
            }
        }

        return quizRepository.save(quiz);
    }

    public Quiz getQuizById(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz non trouvé avec l'id: " + id));
    }

    public List<Quiz> getQuizzesByJob(Long jobId) {
        return quizRepository.findByJobOfferId(jobId);
    }

    // ✅ AJOUT : Mettre à jour un quiz
    @Transactional
    public Quiz updateQuiz(Long id, Quiz updatedQuiz) {
        Quiz existingQuiz = getQuizById(id);

        // Mettre à jour les champs simples
        existingQuiz.setTitle(updatedQuiz.getTitle());
        existingQuiz.setDescription(updatedQuiz.getDescription());
        existingQuiz.setPassingScore(updatedQuiz.getPassingScore());
        existingQuiz.setTimeLimitMinutes(updatedQuiz.getTimeLimitMinutes());
        existingQuiz.setActive(updatedQuiz.isActive());
        existingQuiz.setUpdatedAt(LocalDateTime.now());

        // Mettre à jour les questions (supprimer les anciennes, ajouter les nouvelles)
        if (updatedQuiz.getQuestions() != null) {
            // Supprimer les anciennes questions
            existingQuiz.getQuestions().clear();

            // Ajouter les nouvelles questions
            for (Question question : updatedQuiz.getQuestions()) {
                question.setQuiz(existingQuiz);
                if (question.getAnswers() != null) {
                    for (Answer answer : question.getAnswers()) {
                        answer.setQuestion(question);
                    }
                }
                existingQuiz.getQuestions().add(question);
            }
        }

        return quizRepository.save(existingQuiz);
    }


    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = getQuizById(id);


        List<QuizResult> results = quizResultRepository.findByQuizId(id);
        quizResultRepository.deleteAll(results);

        quizRepository.delete(quiz);
    }


    @Transactional
    public void deleteQuizById(Long id) {
        if (quizRepository.existsById(id)) {

            List<QuizResult> results = quizResultRepository.findByQuizId(id);
            quizResultRepository.deleteAll(results);

            quizRepository.deleteById(id);
        } else {
            throw new RuntimeException("Quiz non trouvé avec l'id: " + id);
        }
    }

    // ========== ÉVALUATION ==========

    public QuizResult evaluateQuiz(Long quizId, Long userId, Map<Long, List<Long>> answers) {
        Quiz quiz = getQuizById(quizId);

        int totalPoints = 0;
        int obtainedPoints = 0;

        for (Question question : quiz.getQuestions()) {
            totalPoints += question.getPoints();

            List<Long> userAnswers = answers.get(question.getId());
            List<Long> correctAnswers = question.getAnswers().stream()
                    .filter(Answer::isCorrect)
                    .map(Answer::getId)
                    .toList();

            if (userAnswers != null && userAnswers.containsAll(correctAnswers) && correctAnswers.containsAll(userAnswers)) {
                obtainedPoints += question.getPoints();
            }
        }

        double percentage = (double) obtainedPoints / totalPoints * 100;
        boolean passed = percentage >= quiz.getPassingScore();

        QuizResult result = new QuizResult();
        result.setQuiz(quiz);
        result.setUserId(userId);
        result.setScore(obtainedPoints);
        result.setMaxScore(totalPoints);
        result.setPercentage(percentage);
        result.setPassed(passed);
        result.setStartedAt(LocalDateTime.now());
        result.setCompletedAt(LocalDateTime.now());

        return quizResultRepository.save(result);
    }

    public boolean hasUserTakenQuiz(Long quizId, Long userId) {
        return quizResultRepository.existsByUserIdAndQuizId(userId, quizId);
    }

    // ========== MÉTHODES POUR LES QUESTIONS ==========

    @Transactional
    public Question addQuestionToQuiz(Long quizId, Question question) {
        Quiz quiz = getQuizById(quizId);
        question.setQuiz(quiz);
        if (question.getAnswers() != null) {
            for (Answer answer : question.getAnswers()) {
                answer.setQuestion(question);
            }
        }
        quiz.getQuestions().add(question);
        quizRepository.save(quiz);
        return question;
    }

    @Transactional
public void deleteQuestion(Long questionId) {
    throw new UnsupportedOperationException("Cette fonctionnalité n'est pas encore implémentée");
}

    public boolean hasUserPassedQuiz(Long quizId, Long userId) {
        return quizResultRepository.existsByUserIdAndQuizIdAndPassedTrue(userId, quizId);
    }

    //  récupérer le détail du résultat
    public QuizResult getQuizResult(Long quizId, Long userId) {
        return quizResultRepository.findByQuizIdAndUserId(quizId, userId).orElse(null);
    }
}