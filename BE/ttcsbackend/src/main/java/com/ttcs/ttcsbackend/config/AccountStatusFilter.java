package com.ttcs.ttcsbackend.config;

import com.ttcs.ttcsbackend.repository.AccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AccountStatusFilter extends OncePerRequestFilter {

    private final AccountRepository accountRepository;

    public AccountStatusFilter(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            boolean active = accountRepository
                    .findByUsernameIgnoreCaseOrEmailIgnoreCase(
                            authentication.getName(),
                            authentication.getName())
                    .map(account -> "ACTIVE".equalsIgnoreCase(account.getStatus()))
                    .orElse(false);

            if (!active) {
                SecurityContextHolder.clearContext();
                if (request.getSession(false) != null) {
                    request.getSession(false).invalidate();
                }
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Tài khoản đã bị khóa hoặc vô hiệu hóa.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
