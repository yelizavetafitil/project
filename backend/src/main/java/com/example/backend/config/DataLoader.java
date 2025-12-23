package com.example.backend.config;

import com.example.backend.model.Category;
import com.example.backend.model.Service;
import com.example.backend.model.User;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ServiceRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@Slf4j
@RequiredArgsConstructor
public class DataLoader {

    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile("!prod") 
    public CommandLineRunner initDatabase(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            ServiceRepository serviceRepository) {
        return args -> {
            log.info("DataLoader started");
        
            String forceLoadProp = System.getProperty("data.load.force");
            String forceLoadEnv = System.getenv("DATA_LOAD_FORCE");
            boolean forceLoad = Boolean.parseBoolean(
                    forceLoadProp != null ? forceLoadProp : 
                    (forceLoadEnv != null ? forceLoadEnv : "false")
            );
            
            log.info("Force load flag: {}", forceLoad);
            
            try {
                long userCount = userRepository.count();
                log.info("Current user count in database: {}", userCount);
                
                if (!forceLoad && userCount > 0) {
                    log.info("Database already initialized, skipping data loading");
                    log.info("To force reload data, restart with: -Ddata.load.force=true or DATA_LOAD_FORCE=true");
                    return;
                }
                
                if (forceLoad) {
                    log.warn("Force loading data - clearing existing data...");
                    serviceRepository.deleteAll();
                    categoryRepository.deleteAll();
                    userRepository.deleteAll();
                    log.info("Existing data cleared");
                }
            } catch (Exception e) {
                log.error("Error checking database state, proceeding with data load: ", e);
            }

            try {
                log.info("Initializing database with test data...");

                User admin = createUser(
                    "admin",
                    "admin@example.com",
                    "admin123",
                    "Администратор",
                    "Системы",
                    "+7 (999) 000-00-01",
                    User.Role.ADMIN
            );

                User provider1 = createUser(
                        "provider1",
                        "provider1@example.com",
                        "provider123",
                        "Иван",
                        "Иванов",
                        "+7 (999) 111-11-11",
                        User.Role.PROVIDER
                );

                User provider2 = createUser(
                        "provider2",
                        "provider2@example.com",
                        "provider123",
                        "Мария",
                        "Петрова",
                        "+7 (999) 222-22-22",
                        User.Role.PROVIDER
                );

                User customer1 = createUser(
                        "customer1",
                        "customer1@example.com",
                        "customer123",
                        "Алексей",
                        "Сидоров",
                        "+7 (999) 333-33-33",
                        User.Role.CUSTOMER
                );

                User customer2 = createUser(
                        "customer2",
                        "customer2@example.com",
                        "customer123",
                        "Елена",
                        "Козлова",
                        "+7 (999) 444-44-44",
                        User.Role.CUSTOMER
                );

                List<User> users = userRepository.saveAll(List.of(admin, provider1, provider2, customer1, customer2));
                log.info("Created {} users", users.size());


                Category cleaning = createCategory(
                        "Уборка",
                        "Профессиональная уборка квартир, домов и офисов",
                         "*"
                );

                Category beauty = createCategory(
                        "Красота",
                        "Услуги красоты и ухода за собой",
                              "*"
                );

                Category repair = createCategory(
                        "Ремонт",
                        "Ремонтные работы и техническое обслуживание",
                              "*"
                );

                Category delivery = createCategory(
                        "Доставка",
                        "Доставка товаров и продуктов",
                             "*"
                );

                Category tutoring = createCategory(
                        "Обучение",
                        "Репетиторство и обучение",
                        "*"
                );

                Category gardening = createCategory(
                        "Сад и огород",
                        "Услуги по уходу за садом и огородом",
                           "*"
                );

                List<Category> categories = categoryRepository.saveAll(
                        List.of(cleaning, beauty, repair, delivery, tutoring, gardening)
                );
                log.info("Created {} categories", categories.size());

    
                List<Service> services = List.of(
                
                    createService(
                            "Генеральная уборка квартиры",
                            "Полная уборка всех помещений с использованием профессиональных средств",
                            new BigDecimal("3000"),
                            240,
                            cleaning,
                            provider1,
                            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800"
                    ),
                    createService(
                            "Уборка после ремонта",
                            "Тщательная уборка после строительных работ",
                            new BigDecimal("5000"),
                            360,
                            cleaning,
                            provider1,
                            "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800"
                    ),
                    createService(
                            "Еженедельная уборка",
                            "Регулярная уборка квартиры или дома",
                            new BigDecimal("2000"),
                            180,
                            cleaning,
                            provider2,
                            null
                    ),

        
                    createService(
                            "Маникюр",
                            "Классический маникюр с покрытием",
                            new BigDecimal("1500"),
                            90,
                            beauty,
                            provider2,
                            "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800"
                    ),
                    createService(
                            "Педикюр",
                            "Классический педикюр с покрытием",
                            new BigDecimal("1800"),
                            90,
                            beauty,
                            provider2,
                            null
                    ),
                    createService(
                            "Стрижка и укладка",
                            "Стрижка волос и укладка",
                            new BigDecimal("2000"),
                            60,
                            beauty,
                            provider1,
                            "https://images.unsplash.com/photo-1560869713-7d985b6880d0?w=800"
                    ),


                    createService(
                            "Установка сантехники",
                            "Установка и подключение сантехнического оборудования",
                            new BigDecimal("5000"),
                            180,
                            repair,
                            provider1,
                            null
                    ),
                    createService(
                            "Электромонтажные работы",
                            "Установка розеток, выключателей, светильников",
                            new BigDecimal("3000"),
                            120,
                            repair,
                            provider2,
                            null
                    ),
                    createService(
                            "Покраска стен",
                            "Подготовка и покраска стен",
                            new BigDecimal("4000"),
                            240,
                            repair,
                            provider1,
                            "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800"
                    ),

      
                    createService(
                            "Доставка продуктов",
                            "Доставка продуктов из магазина",
                            new BigDecimal("500"),
                            60,
                            delivery,
                            provider2,
                            null
                    ),
                    createService(
                            "Доставка товаров",
                            "Доставка товаров из интернет-магазинов",
                            new BigDecimal("800"),
                            90,
                            delivery,
                            provider1,
                            null
                    ),

      
                    createService(
                            "Репетитор по математике",
                            "Индивидуальные занятия по математике",
                            new BigDecimal("1500"),
                            60,
                            tutoring,
                            provider2,
                            null
                    ),
                    createService(
                            "Репетитор по английскому",
                            "Индивидуальные занятия по английскому языку",
                            new BigDecimal("2000"),
                            60,
                            tutoring,
                            provider1,
                            null
                    ),


                    createService(
                            "Стрижка газона",
                            "Стрижка газона и уход за травой",
                            new BigDecimal("2000"),
                            120,
                            gardening,
                            provider2,
                            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800"
                    ),
                    createService(
                            "Обрезка деревьев",
                            "Профессиональная обрезка плодовых и декоративных деревьев",
                            new BigDecimal("4000"),
                            180,
                            gardening,
                            provider1,
                            null
                    )
                );

                List<Service> savedServices = serviceRepository.saveAll(services);
                log.info("Created {} services", savedServices.size());

                log.info("Database initialization completed successfully!");
                log.info("Test users:");
                log.info("  Admin: username=admin, password=admin123");
                log.info("  Provider 1: username=provider1, password=provider123");
                log.info("  Provider 2: username=provider2, password=provider123");
                log.info("  Customer 1: username=customer1, password=customer123");
                log.info("  Customer 2: username=customer2, password=customer123");
            } catch (Exception e) {
                log.error("Error during database initialization: ", e);
                throw e;
            }
        };
    }

    private User createUser(String username, String email, String password,
                           String firstName, String lastName, String phone, User.Role role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);
        user.setRole(role);
        user.setActive(true);
        return user;
    }

    private Category createCategory(String name, String description, String icon) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setIcon(icon);
        return category;
    }

    private Service createService(String name, String description, BigDecimal price,
                                 Integer durationMinutes, Category category, User provider, String imageUrl) {
        Service service = new Service();
        service.setName(name);
        service.setDescription(description);
        service.setPrice(price);
        service.setDurationMinutes(durationMinutes);
        service.setCategory(category);
        service.setProvider(provider);
        service.setImageUrl(imageUrl);
        service.setActive(true);
        return service;
    }
}

