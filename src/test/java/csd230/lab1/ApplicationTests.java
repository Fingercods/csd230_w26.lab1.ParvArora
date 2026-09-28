package csd230.lab1;

import csd230.lab1.entities.BookEntity;
import csd230.lab1.entities.CartEntity;
import csd230.lab1.repositories.BookEntityRepository;
import csd230.lab1.repositories.CartEntityRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ApplicationTests {

    @Autowired
    private BookEntityRepository bookRepository;

    @Autowired
    private CartEntityRepository cartRepository;

    @Test
    void crudTest() {
        BookEntity book = new BookEntity(
                "Test Book",
                25.99,
                10,
                "Parv Arora",
                "TEST-ISBN-001"
        );

        BookEntity savedBook = bookRepository.save(book);

        assertNotNull(savedBook.getId());

        BookEntity foundBook =
                bookRepository.findById(savedBook.getId()).orElseThrow();

        assertEquals("Test Book", foundBook.getTitle());

        foundBook.setTitle("Updated Test Book");
        bookRepository.save(foundBook);

        BookEntity updatedBook =
                bookRepository.findById(savedBook.getId()).orElseThrow();

        assertEquals("Updated Test Book", updatedBook.getTitle());

        bookRepository.delete(updatedBook);

        assertFalse(bookRepository.existsById(savedBook.getId()));
    }

    @Test
    void derivedQueryTest() {
        BookEntity book = new BookEntity(
                "Repository Test Book",
                35.99,
                5,
                "Test Author",
                "DERIVED-ISBN-001"
        );

        bookRepository.save(book);

        List<BookEntity> results =
                bookRepository.findByIsbn("DERIVED-ISBN-001");

        assertFalse(results.isEmpty());

        assertEquals(
                "DERIVED-ISBN-001",
                results.get(0).getIsbn()
        );
    }

    @Test
    void cartProductRelationshipTest() {
        BookEntity book = new BookEntity(
                "Cart Test Book",
                45.99,
                7,
                "Cart Author",
                "CART-ISBN-001"
        );

        CartEntity cart = new CartEntity();
        cart.addProduct(book);

        CartEntity savedCart =
                cartRepository.saveAndFlush(cart);

        CartEntity foundCart =
                cartRepository.findById(savedCart.getId()).orElseThrow();

        assertFalse(foundCart.getProducts().isEmpty());

        BookEntity foundBook =
                (BookEntity) foundCart.getProducts()
                        .iterator()
                        .next();

        assertEquals(
                "CART-ISBN-001",
                foundBook.getIsbn()
        );

        assertTrue(
                foundBook.getCarts().contains(foundCart)
        );
    }
}