package tn.esprit.joboffre.entities;

import jakarta.persistence.*;
        import lombok.*;
        import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "quiz_results")
public class QuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    private Long userId; // ID du candidat
    private int score;
    private int maxScore;
    private double percentage;
    private boolean passed;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}