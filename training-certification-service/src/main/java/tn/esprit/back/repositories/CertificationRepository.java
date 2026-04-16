package tn.esprit.back.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.back.entities.Certification;

import java.util.List;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {

    List<Certification> findByClientId(Long clientId);

    List<Certification> findByTrainingId(Long trainingId);

    boolean existsByCertificateNumber(String certificateNumber);

    boolean existsByCertificateNumberAndIdNot(String certificateNumber, Long id);

    long countByTrainingId(Long trainingId);
}
