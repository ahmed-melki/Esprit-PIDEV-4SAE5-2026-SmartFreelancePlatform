package tn.esprit.projetpi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.projetpi.entities.User;
@Repository
public interface UserRepo extends JpaRepository<User,Long> {
}
