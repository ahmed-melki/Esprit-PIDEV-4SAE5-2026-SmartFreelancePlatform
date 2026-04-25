package tn.esprit.projetpi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;


@SpringBootApplication
@EnableDiscoveryClient
public class ProjetPiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjetPiApplication.class, args);
    }

}
