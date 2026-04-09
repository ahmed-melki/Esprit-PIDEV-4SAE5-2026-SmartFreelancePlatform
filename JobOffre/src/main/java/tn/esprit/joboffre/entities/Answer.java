package tn.esprit.joboffre.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "answers")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;
    @JsonProperty("isCorrect")
    private boolean isCorrect;

    @ManyToOne
    @JoinColumn(name = "question_id")
    @JsonIgnore
    private Question question;
}