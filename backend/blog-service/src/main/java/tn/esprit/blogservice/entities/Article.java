package tn.esprit.blogservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "articles")
@Getter
@Setter
@Data
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String summary;
    private String author;
    private String category;
    private String tags;
    private String status;

    private int likes;

    private int reportCount = 0;

    @Column(name = "like_count")
    private Integer likeCount = 0;  // Changé de int à Integer

    @Column(name = "dislike_count")
    private Integer dislikeCount = 0;  // Changé de int à Integer






}