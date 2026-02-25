package tn.esprit.projetpi.entities;

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
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    private Double budget;

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime createdAt;


    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;


}