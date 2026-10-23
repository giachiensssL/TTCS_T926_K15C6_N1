package com.ttcs.ttcsbackend.config;

import com.ttcs.ttcsbackend.entity.Account;
import com.ttcs.ttcsbackend.repository.AccountRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BootstrapAdminRunner implements ApplicationRunner {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public BootstrapAdminRunner(
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder,
            Environment environment) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        String username = environment.getProperty("TMS_BOOTSTRAP_ADMIN_USERNAME");
        String email = environment.getProperty("TMS_BOOTSTRAP_ADMIN_EMAIL");
        String password = environment.getProperty("TMS_BOOTSTRAP_ADMIN_PASSWORD");

        if (username == null && email == null && password == null) {
            return;
        }
        if (username == null || email == null || password == null || password.length() < 12) {
            throw new IllegalStateException(
                    "Cần đặt đầy đủ TMS_BOOTSTRAP_ADMIN_USERNAME, TMS_BOOTSTRAP_ADMIN_EMAIL và "
                            + "TMS_BOOTSTRAP_ADMIN_PASSWORD (tối thiểu 12 ký tự).");
        }

        if (accountRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(username, username).isPresent()) {
            return;
        }

        Account admin = new Account();
        admin.setUsername(username);
        admin.setEmail(email);
        admin.setFullName(username);
        admin.setRole("ADMIN");
        admin.setStatus("ACTIVE");
        admin.setPassword(passwordEncoder.encode(password));
        accountRepository.save(admin);
    }
}
