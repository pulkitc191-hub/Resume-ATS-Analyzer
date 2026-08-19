package com.ai.Resume.analyser.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Username must not be empty")
    private String username;

    @Email(message = "Enter a valid email")
    @NotBlank(message = "Email must not be empty")
    private String email;

    @Size(min = 6, max = 16, message = "Password must be at least 6 and at most 16 characters")
    private String password;

    @Size(min = 6, max = 6, message = "OTP must be exactly 6 characters")
    @NotBlank(message = "OTP must not be empty")
    private String verifyotp;
}
