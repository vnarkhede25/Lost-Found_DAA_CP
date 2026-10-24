package com.lostfound;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LostFoundApplication {
    public static void main(String[] args) {
        SpringApplication.run(LostFoundApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" Lost & Found ADS Spring Boot Backend Running! ");
        System.out.println(" Port: 8080 | http://localhost:8080/api/items   ");
        System.out.println("=================================================");
    }
}
