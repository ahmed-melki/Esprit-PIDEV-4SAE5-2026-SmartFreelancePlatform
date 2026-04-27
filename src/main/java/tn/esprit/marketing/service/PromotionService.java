package tn.esprit.marketing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.marketing.dto.PromotionHealthDto;
import tn.esprit.marketing.entity.Campaign;
import tn.esprit.marketing.entity.Promotion;
import tn.esprit.marketing.repository.PromotionRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionService implements IPromotionService {

    private final PromotionRepository promotionRepository;
    private final ICampaignService campaignService;

    @Override
    public Promotion createPromotion(Promotion promotion, Long campaignId) {
        Campaign campaign = campaignService.getCampaignById(campaignId);
        promotion.setCampaign(campaign);
        if (promotionRepository.existsByCode(promotion.getCode())) {
            throw new IllegalArgumentException("Code promotionnel déjà utilisé.");
        }
        if (promotion.getUsedCount() == null) promotion.setUsedCount(0);
        return promotionRepository.save(promotion);
    }

    @Override
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    @Override
    public Promotion getPromotionById(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion non trouvée avec l'id : " + id));
    }

    @Override
    public List<Promotion> getPromotionsByCampaign(Long campaignId) {
        return promotionRepository.findByCampaignId(campaignId);
    }

    @Override
    public Promotion updatePromotion(Long id, Promotion updated) {
        Promotion existing = getPromotionById(id);
        existing.setCode(updated.getCode());
        existing.setDiscountPercentage(updated.getDiscountPercentage());
        existing.setValidFrom(updated.getValidFrom());
        existing.setValidUntil(updated.getValidUntil());
        existing.setMaxUses(updated.getMaxUses());
        existing.setUsedCount(updated.getUsedCount());

        if (updated.getCampaign() != null && !existing.getCampaign().getId().equals(updated.getCampaign().getId())) {
            Campaign newCampaign = campaignService.getCampaignById(updated.getCampaign().getId());
            existing.setCampaign(newCampaign);
        }
        return promotionRepository.save(existing);
    }

    @Override
    public void deletePromotion(Long id) {
        Promotion promotion = getPromotionById(id);
        promotionRepository.delete(promotion);
    }

    @Override
    public String generateCode(Long campaignId) {
        Campaign campaign = campaignService.getCampaignById(campaignId);

        String season = "PROMO";
        if (campaign.getStartDate() != null) {
            int month = campaign.getStartDate().getMonthValue();
            if (month >= 6 && month <= 8) season = "SUMMER";
            else if (month >= 12 || month <= 2) season = "WINTER";
            else if (month >= 3 && month <= 5) season = "SPRING";
            else season = "AUTUMN";
        }

        String level = "DEAL";
        List<Promotion> promos = promotionRepository.findByCampaignId(campaignId);
        if (!promos.isEmpty()) {
            double avg = promos.stream().mapToDouble(Promotion::getDiscountPercentage).average().orElse(0);
            if (avg > 40) level = "MEGA";
            else if (avg > 20) level = "DEAL";
            else level = "SAVE";
        }

        String duration = "";
        if (campaign.getStartDate() != null && campaign.getEndDate() != null) {
            long days = ChronoUnit.DAYS.between(campaign.getStartDate(), campaign.getEndDate());
            if (days < 7) duration = "FLASH-";
        }

        String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return duration + season + "-" + level + "-" + suffix;
    }

    // ========== NEW METHODS ==========

    @Override
    public List<Promotion> getExpiringSoon(int days) {
        LocalDateTime threshold = LocalDateTime.now().plusDays(days);
        return promotionRepository.findByValidUntilBefore(threshold);
    }

    @Override
    public PromotionHealthDto getPromotionHealth(Long promotionId) {
        Promotion promo = getPromotionById(promotionId);

        int used = promo.getUsedCount();
        int max = promo.getMaxUses();
        double rate = (max == 0) ? 0 : (used * 100.0 / max);
        String usageRate = String.format("%.0f%%", rate);

        long daysRemaining = ChronoUnit.DAYS.between(LocalDateTime.now(), promo.getValidUntil());
        int days = (int) Math.max(0, daysRemaining);

        String status;
        String recommendation;

        if (rate > 80 || days < 2) {
            status = "CRITICAL";
            if (rate > 80) {
                recommendation = "Usage limit almost reached – increase maxUses or limit further redemptions.";
            } else {
                recommendation = "Expiring very soon – consider extending validity.";
            }
        } else if (rate > 50 || days < 7) {
            status = "AT_RISK";
            if (rate > 50) {
                recommendation = "High usage rate – monitor closely.";
            } else {
                recommendation = "Expiring soon – plan a renewal or alternative promotion.";
            }
        } else {
            status = "HEALTHY";
            recommendation = "Promotion is in good health – no action needed.";
        }

        return new PromotionHealthDto(status, usageRate, days, recommendation);
    }
}