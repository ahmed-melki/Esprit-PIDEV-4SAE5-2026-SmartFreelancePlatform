package tn.esprit.joboffre.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "job_offers")
public class JobOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String company;

    private String location;

    @Enumerated(EnumType.STRING)
    private ContractType contractType;

    private Double salaryMin;
    private Double salaryMax;

    @ElementCollection
    @CollectionTable(name = "job_required_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> requiredSkills;

    private String experienceLevel;
    private String educationLevel;

    private LocalDate deadline;
    private int numberOfPositions;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ID du client qui publie l'offre (référence vers le microservice ProjetPI)
    private Long employerId;

    private boolean remotePossible;

    @Column(length = 500)
    private String benefits;

    // IDs des freelancers qui ont postulé
    @ElementCollection
    @CollectionTable(name = "job_applicants", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "applicant_id")
    private List<Long> applicantIds;
}