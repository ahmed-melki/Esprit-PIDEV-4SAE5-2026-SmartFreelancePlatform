package tn.esprit.projetpi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ProjetPiApplicationTests {

    @Test
    void contextLoads() {
        // Le test passe car JPA est désactivé
    }
}