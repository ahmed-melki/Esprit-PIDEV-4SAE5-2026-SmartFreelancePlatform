package tn.esprit.joboffre.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "entretiens")
public class Entretien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "candidature_id")
    private Candidature candidature;

    private LocalDateTime dateHeure;
    private String lienVisio; // Zoom/Teams/Google Meet
    private String dureeMinutes;
    private String notes;

    @Enumerated(EnumType.STRING)
    private StatutEntretien statut; // PLANIFIE, TERMINE, ANNULE
}