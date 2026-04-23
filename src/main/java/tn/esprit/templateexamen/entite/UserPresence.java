package tn.esprit.templateexamen.entite;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPresence {

    @Id
    private Long userId; // correspond à l'ID de l'utilisateur (client ou freelance)

    private LocalDateTime lastSeen; // dernière activité enregistrée
}