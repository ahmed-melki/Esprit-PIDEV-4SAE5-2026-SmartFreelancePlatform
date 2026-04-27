package tn.esprit.marketing.service;

import tn.esprit.marketing.dto.PromotionHealthDto;
import tn.esprit.marketing.entity.Promotion;
import java.util.List;

public interface IPromotionService {
    Promotion createPromotion(Promotion promotion, Long campaignId);
    List<Promotion> getAllPromotions();
    Promotion getPromotionById(Long id);
    List<Promotion> getPromotionsByCampaign(Long campaignId);
    Promotion updatePromotion(Long id, Promotion promotion);
    void deletePromotion(Long id);
    String generateCode(Long campaignId);

    List<Promotion> getExpiringSoon(int days);
    PromotionHealthDto getPromotionHealth(Long promotionId);
}