package tn.esprit.projetpi;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Test désactivé pour la CI - les tests unitaires suffisent")
class ProjetPiApplicationTests {

    @Test
    @Disabled
    void contextLoads() {
        // Test ignoré car nécessite une base de données
    }
}