package tn.esprit.joboffre.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @ManyToOne
    @JoinColumn(name = "job_id")
    @JsonIgnore
    private JobOffer jobOffer;
    // Getter pour le frontend
    public Long getJob_Id() {
        return jobOffer != null ? jobOffer.getId() : null;
    }

    // Setter pour le frontend
    public void setJob_Id(Long jobId) {
        if (jobId != null && this.jobOffer == null) {
            this.jobOffer = new JobOffer();
            this.jobOffer.setId(jobId);
        } else if (jobId != null) {
            this.jobOffer.setId(jobId);
        }
    }
    private int passingScore; // Score minimum pour réussir (ex: 70%)
    private int timeLimitMinutes; // Limite de temps (optionnel)
    private boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();
}