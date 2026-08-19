package com.ai.Resume.analyser.controller;

import com.ai.Resume.analyser.model.*;
import com.ai.Resume.analyser.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("resumeAnalyser/entry/v1")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true",
        allowedHeaders = "*",
        methods = {
                RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE,
                RequestMethod.PUT, RequestMethod.OPTIONS, RequestMethod.HEAD
        })
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/verifyEmail")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody EmailVerifyRequest request) {
        return authService.verifyEmail(request);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/resetOtpSent")
    public ResponseEntity<?> sendResetOtp(@Valid @RequestBody ResetOtpRequest request) {
        return authService.sendResetOtp(request);
    }

    @PostMapping("/verifyResetOtp")
    public ResponseEntity<?> verifyResetOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return authService.verifyResetOtp(request);
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }
}
