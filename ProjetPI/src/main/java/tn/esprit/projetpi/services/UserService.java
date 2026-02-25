package tn.esprit.projetpi.services;

import org.springframework.stereotype.Service;
import tn.esprit.projetpi.entities.User;
import tn.esprit.projetpi.repositories.UserRepo;

@Service
public class UserService {
    private final UserRepo userRepo;

    public UserService(UserRepo userRepository) {
        this.userRepo = userRepository;
    }
    public User getUserById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
}
