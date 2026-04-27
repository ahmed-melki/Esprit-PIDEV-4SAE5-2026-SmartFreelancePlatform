package tn.esprit.marketing.repository;

import tn.esprit.marketing.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    List<Promotion> findByCampaignId(Long campaignId);
    boolean existsByCode(String code);

    // New method for expiring soon
    List<Promotion> findByValidUntilBefore(LocalDateTime date);
}