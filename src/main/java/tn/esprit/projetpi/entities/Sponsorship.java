package tn.esprit.projetpi.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sponsorships")
@Getter
@Setter
public class Sponsorship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 FIX IMPORTANT (évite boucle JSON)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;

    @Column(name = "sponsor_id")
    private Long sponsorId;

    @Column(name = "sponsor_first_name", length = 50)
    private String sponsorFirstName;

    @Column(name = "sponsor_last_name", length = 50)
    private String sponsorLastName;

    @Column(name = "sponsor_email", length = 100)
    private String sponsorEmail;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "date_created", nullable = false)
    private LocalDateTime dateCreated = LocalDateTime.now();

    @Column(name = "contract_status", nullable = false, length = 20)
    private String contractStatus = "PENDING";

    @Column(name = "pdf_url", length = 255)
    private String pdfUrl;
}