package com.ai.Resume.analyser.service;

import com.ai.Resume.analyser.jwt.JwtService;
import com.ai.Resume.analyser.mail.EmailService;
import com.ai.Resume.analyser.model.*;
import com.ai.Resume.analyser.repository.OtpRecordRepository;
import com.ai.Resume.analyser.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Date;

@Slf4j
@Service
public class AuthService {

    private static final long OTP_VALIDITY_MS = 10 * 60 * 1000L;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationProvider authenticationProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpRecordRepository otpRecordRepository;

    public ResponseEntity<?> verifyEmail(@Valid EmailVerifyRequest request) {
        if (!userRepository.existsById(request.getEmail())) {
            String otp = generateOtp();
            OtpRecord otpRecord = new OtpRecord(
                    request.getEmail(), otp,
                    new Date(System.currentTimeMillis() + OTP_VALIDITY_MS));
            try {
                emailService.sendVerificationOtp(request.getUsername(), request.getEmail(), otp);
                otpRecordRepository.save(otpRecord);
                return new ResponseEntity<>("OTP sent successfully", HttpStatus.OK);
            } catch (Exception e) {
                log.error("Failed to send verification OTP to {}: {}", request.getEmail(), e.getMessage());
                return new ResponseEntity<>("Unable to send OTP. Please try again later.", HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
        return new ResponseEntity<>("Email already registered", HttpStatus.CONFLICT);
    }

    public ResponseEntity<?> register(@Valid RegisterRequest request) {
        OtpRecord otpRecord = otpRecordRepository.findById(request.getEmail()).orElse(null);

        if (otpRecord == null) {
            return new ResponseEntity<>("Unauthorised request", HttpStatus.UNAUTHORIZED);
        }
        if (otpRecord.getVerifyOtp() == null || isExpired(otpRecord.getVerifyExpiration())) {
            otpRecordRepository.deleteById(request.getEmail());
            return new ResponseEntity<>("OTP expired", HttpStatus.NOT_ACCEPTABLE);
        }
        if (!otpRecord.getVerifyOtp().equals(request.getVerifyotp())) {
            return new ResponseEntity<>("Invalid OTP", HttpStatus.NOT_ACCEPTABLE);
        }

        if (!userRepository.existsById(request.getEmail())) {
            User newUser = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .previousResults(false)
                    .resetOtp(null)
                    .resetExpiration(null)
                    .build();
            userRepository.save(newUser);
            otpRecordRepository.deleteById(request.getEmail());
            return new ResponseEntity<>("Successfully created for " + newUser.getUsername(), HttpStatus.CREATED);
        }

        return new ResponseEntity<>("User already exists", HttpStatus.NOT_ACCEPTABLE);
    }

    public ResponseEntity<?> login(@Valid LoginRequest request) {
        try {
            authenticationProvider.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            String token = jwtService.generateToken(request.getEmail());
            User user = userRepository.findById(request.getEmail()).orElseThrow();

            HttpHeaders headers = new HttpHeaders();
            ResponseCookie cookie = ResponseCookie.from("entrypasstoken", token)
                    .path("/")
                    .httpOnly(true)
                    .maxAge(20L * 24 * 60 * 60)
                    .sameSite("Strict")
                    .secure(cookieSecure)
                    .build();
            headers.add(HttpHeaders.SET_COOKIE, cookie.toString());

            LoginResponse loginResponse = new LoginResponse(user.getUsername(), user.getPreviousResults());
            return new ResponseEntity<>(loginResponse, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.warn("Login failed for {}: {}", request.getEmail(), e.getMessage());
            return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
    }

    public ResponseEntity<?> sendResetOtp(@Valid ResetOtpRequest request) {
        User user = userRepository.findById(request.getEmail()).orElse(null);
        if (user == null) {
            return new ResponseEntity<>("Invalid email address", HttpStatus.UNAUTHORIZED);
        }
        try {
            String otp = generateOtp();
            emailService.sendPasswordResetOtp(user.getUsername(), request.getEmail(), otp);
            user.setResetOtp(otp);
            user.setResetExpiration(new Date(System.currentTimeMillis() + OTP_VALIDITY_MS));
            userRepository.save(user);
            return new ResponseEntity<>("OTP sent successfully", HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to send reset OTP to {}: {}", request.getEmail(), e.getMessage());
            return new ResponseEntity<>("Unable to send OTP. Please try again later.", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    public ResponseEntity<?> verifyResetOtp(@Valid VerifyOtpRequest request) {
        User user = userRepository.findById(request.getEmail()).orElse(null);
        if (user == null) {
            return new ResponseEntity<>("Unauthorised request", HttpStatus.UNAUTHORIZED);
        }
        if (user.getResetOtp() == null || isExpired(user.getResetExpiration())) {
            clearResetOtp(user);
            return new ResponseEntity<>("OTP expired", HttpStatus.NOT_ACCEPTABLE);
        }
        if (!user.getResetOtp().equals(request.getOtp())) {
            return new ResponseEntity<>("Invalid OTP", HttpStatus.NOT_ACCEPTABLE);
        }
        return new ResponseEntity<>("OTP verified", HttpStatus.OK);
    }

    public ResponseEntity<?> resetPassword(@Valid ResetPasswordRequest request) {
        User user = userRepository.findById(request.getEmail()).orElse(null);
        if (user == null) {
            return new ResponseEntity<>("Unauthorised request", HttpStatus.UNAUTHORIZED);
        }
        if (user.getResetOtp() == null || isExpired(user.getResetExpiration())) {
            clearResetOtp(user);
            return new ResponseEntity<>("OTP expired", HttpStatus.NOT_ACCEPTABLE);
        }
        if (!user.getResetOtp().equals(request.getOtp())) {
            return new ResponseEntity<>("Invalid OTP", HttpStatus.NOT_ACCEPTABLE);
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setResetOtp(null);
        user.setResetExpiration(null);
        userRepository.save(user);
        return new ResponseEntity<>("Password changed successfully", HttpStatus.OK);
    }

    // ── Private helpers ─────────────────────────────────────────────────────────

    private String generateOtp() {
        return String.valueOf(new SecureRandom().nextInt(900000) + 100000);
    }

    private boolean isExpired(Date expiration) {
        return expiration == null || !expiration.after(new Date());
    }

    private void clearResetOtp(User user) {
        user.setResetOtp(null);
        user.setResetExpiration(null);
        userRepository.save(user);
    }
}
