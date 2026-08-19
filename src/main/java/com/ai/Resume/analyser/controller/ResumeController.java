package com.ai.Resume.analyser.controller;

import com.ai.Resume.analyser.service.ResumeService;
import org.apache.tika.exception.TikaException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("resumeAnalyserCore/service/v1")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true",
        allowedHeaders = "*",
        methods = {
                RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE,
                RequestMethod.PUT, RequestMethod.OPTIONS, RequestMethod.HEAD
        })
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/extract")
    public ResponseEntity<?> extract(@RequestParam String roles, @RequestParam MultipartFile file)
            throws TikaException, IOException, InterruptedException {
        return resumeService.analyseResume(roles, file);
    }

    @GetMapping("/lastReport")
    public ResponseEntity<?> getLastReport() {
        return resumeService.getLastReport();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return resumeService.logout();
    }

    @PostMapping("/deleteAccount")
    public ResponseEntity<?> deleteAccount() {
        return resumeService.deleteAccount();
    }

    @PostMapping("/isValid")
    public ResponseEntity<?> validateToken() {
        return resumeService.validateToken();
    }
}
