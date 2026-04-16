package tn.esprit.back.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.back.entities.Title;
import tn.esprit.back.entities.UserTitle;

import java.util.List;
import java.util.Optional;

@Repository
public interface TitleRepository extends JpaRepository<Title, Long> {
    
    List<Title> findByIsActiveTrue();
    
    List<Title> findByRarity(Title.TitleRarity rarity);
    
    @Query("SELECT t FROM Title t WHERE t.isActive = true AND " +
           "(t.requiredTrainingCount IS NOT NULL OR " +
           "t.requiredCategories IS NOT NULL OR " +
           "t.requiredTrainingIds IS NOT NULL)")
    List<Title> findActiveTitlesWithRequirements();
    
    @Query("SELECT ut FROM UserTitle ut WHERE ut.clientId = :clientId")
    List<UserTitle> findByClientId(@Param("clientId") Long clientId);
    
    @Query("SELECT ut FROM UserTitle ut WHERE ut.clientId = :clientId AND ut.title.id = :titleId")
    Optional<UserTitle> findByClientIdAndTitleId(@Param("clientId") Long clientId, @Param("titleId") Long titleId);
}
