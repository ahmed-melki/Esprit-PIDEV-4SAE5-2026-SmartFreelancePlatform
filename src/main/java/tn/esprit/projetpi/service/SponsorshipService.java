package tn.esprit.projetpi.service;

import tn.esprit.projetpi.SponsorshipDTO;
import tn.esprit.projetpi.entities.Sponsorship;
import org.springframework.stereotype.Service;

@Service
public class SponsorshipService {

    public SponsorshipDTO convertToDTO(Sponsorship sponsorship) {
        SponsorshipDTO dto = new SponsorshipDTO();
        dto.setId(sponsorship.getId());
        dto.setEventId(sponsorship.getEvent().getId());
        dto.setSponsorId(sponsorship.getSponsorId());
        dto.setSponsorFirstName(sponsorship.getSponsorFirstName()); // ✅ ajouté
        dto.setSponsorLastName(sponsorship.getSponsorLastName());   // ✅ ajouté
        dto.setSponsorEmail(sponsorship.getSponsorEmail());         // ✅ ajouté
        dto.setAmount(sponsorship.getAmount().doubleValue());
        dto.setDateCreated(sponsorship.getDateCreated());
        dto.setContractStatus(sponsorship.getContractStatus());
        dto.setPdfUrl(sponsorship.getPdfUrl());
        return dto;
    }
}