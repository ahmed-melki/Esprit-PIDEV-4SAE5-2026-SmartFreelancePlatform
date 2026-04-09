package tn.esprit.joboffre.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "candidatures")
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private JobOffer jobOffer;

    private Long candidatId;

    @Column(length = 2000)
    private String lettreMotivation;

    private String cvUrl;

    @Enumerated(EnumType.STRING)
    private StatutCandidature statut;

    private LocalDateTime datePostulation;
    private LocalDateTime dateDerniereModification;

    private String commentaireRecruteur;
}