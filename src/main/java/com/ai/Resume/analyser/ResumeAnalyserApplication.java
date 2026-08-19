package com.ai.Resume.analyser;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication
public class ResumeAnalyserApplication {
    public static void main(String[] args) {
        // Load .env variables for Spring Boot
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
        SpringApplication.run(ResumeAnalyserApplication.class, args);
    }
}