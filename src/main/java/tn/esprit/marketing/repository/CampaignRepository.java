package tn.esprit.marketing.repository;

import tn.esprit.marketing.entity.Campaign;
import tn.esprit.marketing.entity.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByStatus(CampaignStatus status);

    // For duplication: load campaign with all promotions eagerly
    @Query("SELECT c FROM Campaign c LEFT JOIN FETCH c.promotions WHERE c.id = :id")
    Optional<Campaign> findByIdWithPromotions(@Param("id") Long id);

    // Check for duplicate names when creating a copy
    boolean existsByName(String name);
}