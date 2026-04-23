package tn.esprit.templateexamen.entite;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String keyword;       // mot-clé (ex: "prix", "délai")

    @Column(nullable = false, length = 1000)
    private String answer;        // réponse associée
}