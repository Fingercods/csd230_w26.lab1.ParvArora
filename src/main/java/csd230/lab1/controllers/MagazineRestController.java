
package csd230.lab1.controllers;

import csd230.lab1.entities.MagazineEntity;
import csd230.lab1.repositories.MagazineEntityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Magazine REST API", description = "REST API for managing magazines")
@RestController
@RequestMapping("/api/rest/magazines")
public class MagazineRestController {

    private final MagazineEntityRepository repository;

    public MagazineRestController(MagazineEntityRepository repository) {
        this.repository = repository;
    }

    @Operation(summary = "Get all magazines")
    @ApiResponse(responseCode = "200", description = "Magazines returned successfully")
    @GetMapping
    public List<MagazineEntity> all() {
        return repository.findAll();
    }

    @Operation(summary = "Get a magazine by ID")
    @ApiResponse(responseCode = "200", description = "Magazine found")
    @ApiResponse(responseCode = "404", description = "Magazine not found")
    @GetMapping("/{id}")
    public MagazineEntity one(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Magazine", id));
    }

    @Operation(summary = "Create a new magazine")
    @ApiResponse(responseCode = "201", description = "Magazine created successfully")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MagazineEntity create(@RequestBody MagazineEntity magazine) {
        magazine.setId(null);
        return repository.save(magazine);
    }

    @Operation(summary = "Update a magazine")
    @ApiResponse(responseCode = "200", description = "Magazine updated successfully")
    @ApiResponse(responseCode = "404", description = "Magazine not found")
    @PutMapping("/{id}")
    public MagazineEntity update(@PathVariable Long id, @RequestBody MagazineEntity newMagazine) {
        MagazineEntity magazine = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Magazine", id));

        magazine.setTitle(newMagazine.getTitle());
        magazine.setPrice(newMagazine.getPrice());
        magazine.setCopies(newMagazine.getCopies());
        magazine.setOrderQty(newMagazine.getOrderQty());
        magazine.setCurrentIssue(newMagazine.getCurrentIssue());

        return repository.save(magazine);
    }

    @Operation(summary = "Delete a magazine")
    @ApiResponse(responseCode = "204", description = "Magazine deleted successfully")
    @ApiResponse(responseCode = "404", description = "Magazine not found")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        MagazineEntity magazine = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Magazine", id));

        repository.delete(magazine);
    }
}
