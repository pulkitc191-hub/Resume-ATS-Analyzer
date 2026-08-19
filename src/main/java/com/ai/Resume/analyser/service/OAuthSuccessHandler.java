package com.ai.Resume.analyser.service;

import com.ai.Resume.analyser.jwt.JwtService;
import com.ai.Resume.analyser.model.User;
import com.ai.Resume.analyser.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Locale;

@Slf4j
@Component
public class OAuthSuccessHandler implements AuthenticationSuccessHandler {

    private static final long COOKIE_MAX_AGE_SECONDS = 20L * 24 * 60 * 60;

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final boolean cookieSecure;

    public OAuthSuccessHandler(UserRepository userRepository,
                               JwtService jwtService,
                               @Value("${app.cookie.secure}") boolean cookieSecure) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.cookieSecure = cookieSecure;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        if (!(authentication.getPrincipal() instanceof OAuth2User oauthUser)) {
            log.error("OAuth2 login succeeded without an OAuth2 user principal");
            response.sendRedirect(request.getContextPath() + "/login?oauthError");
            return;
        }

        String email = oauthUser.getAttribute("email");
        if (email == null || email.isBlank()) {
            log.warn("OAuth2 provider did not return a usable email address");
            response.sendRedirect(request.getContextPath() + "/login?oauthError");
            return;
        }
        email = email.trim().toLowerCase(Locale.ROOT);

        String name = oauthUser.getAttribute("name");
        if (name == null || name.isBlank()) {
            int atIndex = email.indexOf('@');
            name = atIndex > 0 ? email.substring(0, atIndex) : email;
        }

        createUserIfMissing(email, name.trim());

        ResponseCookie cookie = ResponseCookie.from("entrypasstoken", jwtService.generateToken(email))
                .path("/")
                .httpOnly(true)
                .maxAge(COOKIE_MAX_AGE_SECONDS)
                .sameSite("Strict")
                .secure(cookieSecure)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
        response.sendRedirect(request.getContextPath() + "/");
    }

    private void createUserIfMissing(String email, String name) {
        if (userRepository.existsById(email)) {
            return;
        }

        try {
            userRepository.save(User.builder()
                    .username(name)
                    .email(email)
                    .password("")
                    .previousResults(false)
                    .build());
            log.info("New OAuth2 user registered: {}", email);
        } catch (DataIntegrityViolationException ignored) {
            // Another request created the same user concurrently; login can proceed.
            log.debug("OAuth2 user was created concurrently: {}", email);
        }
    }
}
