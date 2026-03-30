package tn.esprit.joboffre.clients;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import tn.esprit.joboffre.clients.UserModel;
import java.util.List;

@FeignClient(name = "ProjetPI")  // ← Le nom doit correspondre à spring.application.name du microservice 1
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserModel getUserById(@PathVariable("id") Long id);

    @GetMapping("/api/users")
    List<UserModel> getAllUsers();

    @GetMapping("/api/users/role/{role}")
    List<UserModel> getUsersByRole(@PathVariable("role") String role);

    @GetMapping("/api/users/clients")
    List<UserModel> getClients();

    @GetMapping("/api/users/freelancers")
    List<UserModel> getFreelancers();
}