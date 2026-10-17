package com.ttcs.ttcsbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class EnrollmentSecurityConfig {

    /**
     * Overrides the group's permitAll chain ONLY for KNJ-71 endpoints.
     * HTTP Basic is a local/test integration bridge, not a substitute for the
     * production login / JWT/session authentication flow. Use HTTPS outside localhost.
     */
    @Bean
    @Order(1)
    SecurityFilterChain enrollmentFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/api/enrollments/**", "/api/classes/*/enrollments", "/api/classes/*/capacity")
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(requests -> requests.anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }

    /**
     * Fail closed: with no credentials supplied, no user can authenticate to the
     * enrollment endpoints. For local test use ENROLLMENT_DEMO_USERNAME/PASSWORD.
     * An authenticated login must match a real Account.username; the service
     * separately checks that the Account has the correct management role.
     */
    @Bean
    UserDetailsService enrollmentDemoUsers(
            PasswordEncoder encoder,
            @Value("${ENROLLMENT_DEMO_USERNAME:}") String username,
            @Value("${ENROLLMENT_DEMO_PASSWORD:}") String password) {
        InMemoryUserDetailsManager users = new InMemoryUserDetailsManager();
        if (!username.isBlank() && !password.isBlank()) {
            users.createUser(User.withUsername(username)
                .password(encoder.encode(password))
                .roles("ENROLLMENT_OPERATOR")
                .build());
        }
        return users;
    }
}
