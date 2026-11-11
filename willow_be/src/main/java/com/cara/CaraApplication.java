package com.cara;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CaraApplication {
    public static void main(String[] args) {
        SpringApplication.run(CaraApplication.class, args);
    }
}
