package tn.esprit.blogservice.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "article_reports")
@Getter
@Setter
public class ArticleReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "article_id", nullable = false)
    private Long articleId;

    @Column(nullable = false)
    private String reason;

    @Column(length = 1000)
    private String description;

    @Column(name = "reporter_name")
    private String reporterName;

    private String email;

    @Column(name = "reported_at")
    private LocalDateTime reportedAt;

    private String status;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        reportedAt = now;
        createdAt = now;  // Ajoutez cette ligne
        if (status == null) status = "pending";
    }


}