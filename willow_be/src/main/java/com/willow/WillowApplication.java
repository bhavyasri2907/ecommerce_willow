package com.willow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WillowApplication {
    public static void main(String[] args) {
        SpringApplication.run(WillowApplication.class, args);
    }
}
