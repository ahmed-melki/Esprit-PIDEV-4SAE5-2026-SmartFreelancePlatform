package tn.esprit.projetpi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.projetpi.entities.Sponsorship;

@Repository
public interface SponsorshipRepository extends JpaRepository<Sponsorship, Long> {}