package tn.esprit.joboffre.clients;

import lombok.Data;
import java.util.List;

@Data
public class UserModel {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;  // CLIENT, FREELANCER, ADMIN
    private List<String> skills;
}