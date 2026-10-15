package com.boltpay.config;

import com.boltpay.models.Checkout;
import com.boltpay.models.User;
import com.boltpay.repositories.CheckoutRepository;
import com.boltpay.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initDatabase(
        UserRepository userRepository,
        CheckoutRepository checkoutRepository,
        PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (userRepository.count() == 0) {
                log.info("Database is empty. Seeding initial users for testing...");

                // Seed user 1: john.doe@example.com with login code 123456
                User john = new User(
                    "john.doe@example.com",
                    "John",
                    "Doe",
                    passwordEncoder.encode("123456")
                );
                userRepository.save(john);

                // Seed user 2: alex.taylor@example.com with login code 888999
                User alex = new User(
                    "alex.taylor@example.com",
                    "Alex",
                    "Taylor",
                    passwordEncoder.encode("888999")
                );
                userRepository.save(alex);

                // Seed sample checkouts
                Checkout sample1 = new Checkout(
                    john.getId(),
                    john.getEmail(),
                    "+1 (555) 234-5678",
                    "742 Evergreen Terrace, Springfield, OR 97477"
                );
                checkoutRepository.save(sample1);

                Checkout sample2 = new Checkout(
                    null,
                    "guest.shopper@example.com",
                    "+1 (555) 987-6543",
                    "100 Main Street, Apt 4B, Austin, TX 78701"
                );
                checkoutRepository.save(sample2);

                log.info("Seeding completed successfully. Test accounts: john.doe@example.com (code: 123456), alex.taylor@example.com (code: 888999).");
            }
        };
    }
}
