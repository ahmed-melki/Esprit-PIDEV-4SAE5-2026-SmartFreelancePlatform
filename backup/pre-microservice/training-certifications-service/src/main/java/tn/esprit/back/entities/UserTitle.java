package tn.esprit.back.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_titles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTitle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "title_id", nullable = false)
    @JsonIgnoreProperties("userTitles")
    private Title title;

    private LocalDateTime unlockedAt;

    @Enumerated(EnumType.STRING)
    private UnlockSource unlockSource;

    public enum UnlockSource {
        TRAINING_COMPLETION, ADMIN_GRANT, SYSTEM_AWARD
    }
}
