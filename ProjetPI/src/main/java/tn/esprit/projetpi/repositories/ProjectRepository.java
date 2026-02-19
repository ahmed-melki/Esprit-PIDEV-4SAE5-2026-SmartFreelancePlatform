package tn.esprit.projetpi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.projetpi.entities.Project;
@Repository
public interface ProjectRepository extends JpaRepository<Project,Long> {
}
