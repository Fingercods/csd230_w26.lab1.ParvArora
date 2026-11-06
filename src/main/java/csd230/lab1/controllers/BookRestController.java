
package csd230.lab1.controllers;

import csd230.lab1.entities.BookEntity;
import csd230.lab1.repositories.BookEntityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Book REST API", description = "REST API for managing books")
@RestController
@RequestMapping("/api/rest/books")
public class BookRestController {

    private final BookEntityRepository repository;

    public BookRestController(BookEntityRepository repository) {
        this.repository = repository;
    }

    @Operation(summary = "Get all books")
    @ApiResponse(responseCode = "200", description = "Books returned successfully")
    @GetMapping
    public List<BookEntity> all() {
        return repository.findAll();
    }

    @Operation(summary = "Get a book by ID")
    @ApiResponse(responseCode = "200", description = "Book found")
    @ApiResponse(responseCode = "404", description = "Book not found")
    @GetMapping("/{id}")
    public BookEntity one(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new BookNotFoundException(id));
    }

    @Operation(summary = "Create a new book")
    @ApiResponse(responseCode = "200", description = "Book created successfully")
    @PostMapping
    public BookEntity create(@RequestBody BookEntity book) {
        book.setId(null);
        return repository.save(book);
    }

    @Operation(summary = "Update a book")
    @ApiResponse(responseCode = "200", description = "Book updated successfully")
    @ApiResponse(responseCode = "404", description = "Book not found")
    @PutMapping("/{id}")
    public BookEntity update(@PathVariable Long id, @RequestBody BookEntity newBook) {
        BookEntity book = repository.findById(id)
                .orElseThrow(() -> new BookNotFoundException(id));

        book.setTitle(newBook.getTitle());
        book.setAuthor(newBook.getAuthor());
        book.setIsbn(newBook.getIsbn());
        book.setPrice(newBook.getPrice());
        book.setCopies(newBook.getCopies());

        return repository.save(book);
    }

    @Operation(summary = "Delete a book")
    @ApiResponse(responseCode = "204", description = "Book deleted successfully")
    @ApiResponse(responseCode = "404", description = "Book not found")
    @DeleteMapping("/{id}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        BookEntity book = repository.findById(id)
                .orElseThrow(() -> new BookNotFoundException(id));

        repository.delete(book);
    }
}
