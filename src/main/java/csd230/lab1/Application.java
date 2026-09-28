package csd230.lab1;

import com.github.javafaker.Faker;
import csd230.lab1.entities.*;
import csd230.lab1.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@SpringBootApplication
public class Application implements CommandLineRunner {

    private final ProductEntityRepository productRepository;
    private final BookEntityRepository bookRepository;
    private final MagazineEntityRepository magazineRepository;
    private final DiscMagEntityRepository discMagRepository;
    private final TicketEntityRepository ticketRepository;
    private final CartEntityRepository cartRepository;

    public Application(
            ProductEntityRepository productRepository,
            BookEntityRepository bookRepository,
            MagazineEntityRepository magazineRepository,
            DiscMagEntityRepository discMagRepository,
            TicketEntityRepository ticketRepository,
            CartEntityRepository cartRepository) {

        this.productRepository = productRepository;
        this.bookRepository = bookRepository;
        this.magazineRepository = magazineRepository;
        this.discMagRepository = discMagRepository;
        this.ticketRepository = ticketRepository;
        this.cartRepository = cartRepository;
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    @Transactional
    public void run(String... args) {

        Faker faker = new Faker();

        // CREATE
        BookEntity book1 = new BookEntity(
                faker.book().title(),
                29.99,
                10,
                faker.book().author(),
                "ISBN-1001"
        );

        BookEntity book2 = new BookEntity(
                "Java Programming",
                49.99,
                8,
                "John Smith",
                "ISBN-1002"
        );

        MagazineEntity magazine = new MagazineEntity(
                "Technology Magazine",
                12.99,
                20,
                50,
                LocalDateTime.now()
        );

        DiscMagEntity discMag = new DiscMagEntity(
                "Computer Disc Magazine",
                19.99,
                15,
                25,
                LocalDateTime.now(),
                true
        );

        TicketEntity ticket = new TicketEntity(
                "Concert Ticket",
                75.00
        );

        bookRepository.save(book1);
        bookRepository.save(book2);
        magazineRepository.save(magazine);
        discMagRepository.save(discMag);
        ticketRepository.save(ticket);

        // CREATE CARTS
        CartEntity cart1 = new CartEntity();
        cart1.addProduct(book1);
        cart1.addProduct(magazine);
        cart1.addProduct(ticket);
        cartRepository.save(cart1);

        CartEntity cart2 = new CartEntity();
        cart2.addProduct(book1);
        cart2.addProduct(book2);
        cart2.addProduct(discMag);
        cartRepository.save(cart2);

        // READ
        System.out.println("\n--- ALL PRODUCTS ---");

        List<ProductEntity> products = productRepository.findAll();

        for (ProductEntity product : products) {
            System.out.println(product);
        }

        // READ CARTS
        System.out.println("\n--- ALL CARTS ---");

        List<CartEntity> carts = cartRepository.findAll();

        for (CartEntity cart : carts) {
            System.out.println("Cart ID: " + cart.getId());

            for (ProductEntity product : cart.getProducts()) {
                System.out.println(product);
            }
        }

        // UPDATE
        System.out.println("\n--- UPDATE BOOK ---");

        book2.setTitle("Advanced Java Programming");
        book2.setPrice(59.99);
        bookRepository.save(book2);

        System.out.println(book2);

        // DERIVED QUERY - ISBN
        System.out.println("\n--- FIND BY ISBN ---");

        List<BookEntity> isbnBooks =
                bookRepository.findByIsbn("ISBN-1001");

        for (BookEntity book : isbnBooks) {
            System.out.println(book);
        }

        // DERIVED QUERY - TITLE
        System.out.println("\n--- FIND BY TITLE ---");

        List<BookEntity> titleBooks =
                bookRepository.findByTitle("Advanced Java Programming");

        for (BookEntity book : titleBooks) {
            System.out.println(book);
        }

        // LIKE QUERY
        System.out.println("\n--- TITLE LIKE QUERY ---");

        List<BookEntity> likeBooks =
                bookRepository.findByTitleLike("%Java%");

        for (BookEntity book : likeBooks) {
            System.out.println(book);
        }

        // CUSTOM JPQL QUERY
        System.out.println("\n--- PRICE RANGE QUERY ---");

        List<BookEntity> priceBooks =
                bookRepository.findByPriceRange(20.00, 70.00);

        for (BookEntity book : priceBooks) {
            System.out.println(book);
        }

        // FIND BY ID
        System.out.println("\n--- FIND BY ID ---");

        Optional<BookEntity> foundBook =
                bookRepository.findById(book1.getId());

        foundBook.ifPresent(System.out::println);

        // DELETE
        System.out.println("\n--- DELETE DEMONSTRATION ---");

        TicketEntity deleteTicket =
                new TicketEntity("Temporary Ticket", 10.00);

        ticketRepository.save(deleteTicket);

        System.out.println(
                "Ticket created with ID: " + deleteTicket.getId()
        );

        ticketRepository.delete(deleteTicket);

        System.out.println("Temporary ticket deleted.");

        System.out.println("\n--- LAB 1 COMPLETE ---");
    }
}