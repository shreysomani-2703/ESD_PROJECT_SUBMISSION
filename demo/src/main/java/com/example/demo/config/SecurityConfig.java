package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(Customizer.withDefaults())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/", "/index", "/error", "/public/**", "/oauth2/**",
                                                                "/login/**", "/api/**")
                                                .permitAll()
                                                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**",
                                                                "/swagger-ui.html")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                // Add other specific matchers from reference if needed, or keep generic
                                                // /api/** permitAll for now as per reference structure
                                                .anyRequest().permitAll())
                                .oauth2Login(o -> o
                                                .redirectionEndpoint(r -> r.baseUri("/oauth2/callback/*"))
                                                .failureUrl("http://localhost:5173/login?error=unauthorized_email")
                                                .successHandler((request, response, authentication) -> {
                                                        org.springframework.security.oauth2.core.user.OAuth2User oauthUser = (org.springframework.security.oauth2.core.user.OAuth2User) authentication
                                                                        .getPrincipal();
                                                        String email = oauthUser.getAttribute("email");
                                                        if ("sdsomani27@gmail.com".equals(email)) {
                                                                response.sendRedirect(
                                                                                "http://localhost:5173/oauth2/redirect");
                                                        } else {
                                                                new org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler()
                                                                                .logout(request, response,
                                                                                                authentication);
                                                                response.sendRedirect(
                                                                                "http://localhost:5173/unauthorized");
                                                        }
                                                }))
                                .logout(logout -> logout.logoutSuccessUrl("/").permitAll());

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:5173"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
