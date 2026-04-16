package tn.esprit.back.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "titles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Title {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private String iconName;

    private Integer requiredTrainingCount;

    @Column(length = 2000)
    private String requiredCategories;

    @Column(length = 2000)
    private String requiredTrainingIds;

    @Enumerated(EnumType.STRING)
    private TitleRarity rarity;

    private Boolean isActive;

    @OneToMany(mappedBy = "title", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("title")
    private Set<UserTitle> userTitles = new HashSet<>();

    public enum TitleRarity {
        COMMON, RARE, EPIC, LEGENDARY
    }
}
