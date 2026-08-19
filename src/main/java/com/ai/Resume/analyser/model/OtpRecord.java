package com.ai.Resume.analyser.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "otp_verify")
public class OtpRecord {

    @Id
    private String email;

    private String verifyOtp;

    private Date verifyExpiration;
}
