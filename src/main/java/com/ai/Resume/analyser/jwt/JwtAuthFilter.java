package com.ai.Resume.analyser.jwt;

import com.ai.Resume.analyser.configuration.UserDetailsServiceImpl;
import com.ai.Resume.analyser.model.User;
import com.ai.Resume.analyser.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String reqUri = request.getRequestURI();

            // Skip filter for public routes
            if (reqUri.startsWith("/resumeAnalyser/entry/v1")
                    || reqUri.equals("/")
                    || reqUri.equals("/login")
                    || reqUri.equals("/forgotpassword")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = extractTokenFromCookies(request);

            if (token != null) {
                String email = jwtService.extractEmail(token);
                User user = userRepository.findById(email).orElse(null);

                if (user != null && SecurityContextHolder.getContext().getAuthentication() == null
                        && jwtService.isTokenValid(token, user.getEmail())) {

                    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            filterChain.doFilter(request, response);

        } catch (RuntimeException e) {
            log.warn("JWT validation failed — possible security breach: {}", e.getMessage());
            filterChain.doFilter(request, response);
        }
    }

    private String extractTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("entrypasstoken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
