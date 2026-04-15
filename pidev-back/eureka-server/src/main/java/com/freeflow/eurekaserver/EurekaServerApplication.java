package com.freeflow.eurekaserver;  // ← Correction : "eurekaserver" (sans underscore)

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;  // ← IMPORTANT

@SpringBootApplication
@EnableEurekaServer  // ← Active le serveur Eureka
public class EurekaServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}