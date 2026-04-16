package tn.esprit.back.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.back.entities.UserTitle;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTitleRepository extends JpaRepository<UserTitle, Long> {
    
    List<UserTitle> findByClientId(Long clientId);
    
    @Query("SELECT ut FROM UserTitle ut WHERE ut.clientId = :clientId ORDER BY ut.unlockedAt DESC")
    List<UserTitle> findByClientIdOrderByUnlockedAtDesc(@Param("clientId") Long clientId);

    @Query("SELECT ut FROM UserTitle ut WHERE ut.clientId = :clientId AND ut.title.id = :titleId")
    Optional<UserTitle> findByClientIdAndTitleId(@Param("clientId") Long clientId, @Param("titleId") Long titleId);
    
    @Query("SELECT COUNT(ut) FROM UserTitle ut WHERE ut.clientId = :clientId")
    Long countByClientId(@Param("clientId") Long clientId);
}
