package com.ayursutra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;

@SpringBootApplication
@EnableScheduling // ← activates @Scheduled cron jobs in AIVoiceService
public class AyurSutraApplication {

    public static void main(String[] args) {
        SpringApplication.run(AyurSutraApplication.class, args);
    }

    @Bean
    public CommandLineRunner cleanUp(com.ayursutra.repository.UserRepository userRepository,
            com.ayursutra.repository.DoctorRepository doctorRepository,
            com.ayursutra.repository.PatientRepository patientRepository,
            com.ayursutra.repository.ChatHistoryRepository chatHistoryRepository) {
        return args -> {
            // SYSTEM: PERSISTENCE MODE ENABLED
            // Nanba, deleteAll() lines-ah remove pannittaen.
            // Ippo server restart aanaalum neenga add panna Protocols/Patients delete
            // aagaadhu.

            System.out.println("====== SYSTEM: STARTING WITH PERSISTENT DATA (DATA SAFE) ======");

            // Check if default doctor already exists to avoid duplicate entry errors
            if (userRepository.findByUsername("doctor1").isEmpty()) {
                com.ayursutra.model.User docUser = com.ayursutra.model.User.builder()
                        .username("doctor1")
                        .password("$2a$10$xyz") // dummy hash
                        .name("Dr. Default")
                        .email("doc1@example.com")
                        .phone("1234567890")
                        .role(com.ayursutra.model.Role.DOCTOR)
                        .build();
                userRepository.save(docUser);

                com.ayursutra.model.Doctor doctor = com.ayursutra.model.Doctor.builder()
                        .user(docUser)
                        .specialization("General Ayurveda")
                        .build();
                doctorRepository.save(doctor);
                System.out.println("====== SYSTEM: SEEDED DEFAULT DOCTOR (doctor1) ======");
            } else {
                System.out.println("====== SYSTEM: DEFAULT DOCTOR ALREADY EXISTS ======");
            }
        };
    }
}