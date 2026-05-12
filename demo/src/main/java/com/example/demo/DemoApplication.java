package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling; // 1. Bu importu ekledik

@SpringBootApplication
@EnableScheduling // 2. Bu notasyon, Scheduler'ın (zamanlayıcının) çalışmasını sağlar
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}