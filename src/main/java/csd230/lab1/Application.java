package csd230.lab1;

import csd230.lab1.entities.BookEntity;
import csd230.lab1.entities.CartEntity;
import csd230.lab1.repositories.BookEntityRepository;
import csd230.lab1.repositories.CartEntityRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application implements CommandLineRunner {

    private final BookEntityRepository bookRepository;
    private final CartEntityRepository cartRepository;

    public Application(BookEntityRepository bookRepository,
                       CartEntityRepository cartRepository) {
        this.bookRepository = bookRepository;
        this.cartRepository = cartRepository;
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    public void run(String... args) {

        if (bookRepository.count() == 0) {
            BookEntity first = new BookEntity();
            first.setTitle("Spring MVC Basics");
            first.setPrice(29.99);
            first.setCopies(5);
            first.setAuthor("Course Example");
            first.setIsbn("ISBN-1001");
            bookRepository.save(first);

            BookEntity second = new BookEntity();
            second.setTitle("Thymeleaf in Practice");
            second.setPrice(34.99);
            second.setCopies(4);
            second.setAuthor("Course Example");
            second.setIsbn("ISBN-1002");
            bookRepository.save(second);
        }

        cartRepository.findById(1L)
                .orElseGet(() -> cartRepository.save(new CartEntity()));
    }
}