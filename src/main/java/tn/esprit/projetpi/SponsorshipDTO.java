package tn.esprit.projetpi;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SponsorshipDTO {
    private Long id;
    private Long eventId;
    private Long sponsorId;
    private double amount;
    private String contractStatus;
    private String pdfUrl;
    private LocalDateTime dateCreated;

    private String sponsorFirstName;  // lowercase 's'
    private String sponsorLastName;   // lowercase 's'
    private String sponsorEmail;      // lowercase 's'
}