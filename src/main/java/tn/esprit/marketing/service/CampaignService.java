package tn.esprit.marketing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.marketing.entity.Campaign;
import tn.esprit.marketing.entity.Promotion;
import tn.esprit.marketing.repository.CampaignRepository;
import tn.esprit.marketing.repository.PromotionRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CampaignService implements ICampaignService {

    private final CampaignRepository campaignRepository;
    private final PromotionRepository promotionRepository;

    @Override
    public Campaign createCampaign(Campaign campaign) {
        if (campaign.getStartDate().isAfter(campaign.getEndDate())) {
            throw new IllegalArgumentException("La date de début doit être antérieure à la date de fin.");
        }
        return campaignRepository.save(campaign);
    }

    @Override
    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    @Override
    public Campaign getCampaignById(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campagne non trouvée avec l'id : " + id));
    }

    @Override
    public Campaign updateCampaign(Long id, Campaign campaign) {
        Campaign existing = getCampaignById(id);
        existing.setName(campaign.getName());
        existing.setDescription(campaign.getDescription());
        existing.setStartDate(campaign.getStartDate());
        existing.setEndDate(campaign.getEndDate());
        existing.setStatus(campaign.getStatus());

        if (existing.getStartDate().isAfter(existing.getEndDate())) {
            throw new IllegalArgumentException("La date de début doit être antérieure à la date de fin.");
        }
        return campaignRepository.save(existing);
    }

    @Override
    public void deleteCampaign(Long id) {
        Campaign campaign = getCampaignById(id);
        campaignRepository.delete(campaign);
    }

    @Override
    @Transactional
    public Campaign duplicateCampaign(Long originalId) {
        // Load original campaign with all its promotions
        Campaign original = campaignRepository.findByIdWithPromotions(originalId)
                .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + originalId));

        // Create a new campaign instance
        Campaign copy = new Campaign();
        copy.setName(generateUniqueCopyName(original.getName()));
        copy.setDescription(original.getDescription());

        // Shift dates: preserve the original duration, start from now
        long durationDays = ChronoUnit.DAYS.between(original.getStartDate(), original.getEndDate());
        copy.setStartDate(LocalDateTime.now());
        copy.setEndDate(LocalDateTime.now().plusDays(durationDays));
        copy.setStatus(original.getStatus());  // or set to PLANNED if you prefer

        // Save the campaign copy first (to obtain an ID for promotions)
        Campaign savedCopy = campaignRepository.save(copy);

        // Clone all promotions and add them to the savedCopy's list
        for (Promotion promo : original.getPromotions()) {
            Promotion promoCopy = new Promotion();
            promoCopy.setCode(generateUniquePromoCopyCode(promo.getCode()));
            promoCopy.setDiscountPercentage(promo.getDiscountPercentage());

            // Shift promotion dates by the same offset as the campaign
            long promoDurationDays = ChronoUnit.DAYS.between(promo.getValidFrom(), promo.getValidUntil());
            promoCopy.setValidFrom(savedCopy.getStartDate());
            promoCopy.setValidUntil(savedCopy.getStartDate().plusDays(promoDurationDays));

            promoCopy.setMaxUses(promo.getMaxUses());
            promoCopy.setUsedCount(0);               // reset usage counter
            promoCopy.setCampaign(savedCopy);        // link to the new campaign

            Promotion savedPromo = promotionRepository.save(promoCopy);
            savedCopy.getPromotions().add(savedPromo);   // <-- ADD THIS LINE
        }

        return savedCopy;
    }

    // Helper: avoid duplicate campaign names
    private String generateUniqueCopyName(String originalName) {
        String base = originalName + " - Copy";
        String candidate = base;
        int counter = 1;
        while (campaignRepository.existsByName(candidate)) {
            candidate = base + " (" + ++counter + ")";
        }
        return candidate;
    }

    // Helper: avoid duplicate promotion codes
    private String generateUniquePromoCopyCode(String originalCode) {
        String base = originalCode + "_COPY";
        String candidate = base;
        int counter = 1;
        while (promotionRepository.existsByCode(candidate)) {
            candidate = base + (++counter);
        }
        return candidate;
    }
}