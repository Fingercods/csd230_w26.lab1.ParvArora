
package csd230.lab1.controllers;

import csd230.lab1.entities.DiscMagEntity;
import csd230.lab1.repositories.DiscMagEntityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "DiscMag REST API", description = "REST API for managing disc magazines")
@RestController
@RequestMapping("/api/rest/discmags")
public class DiscMagRestController {

    private final DiscMagEntityRepository repository;

    public DiscMagRestController(DiscMagEntityRepository repository) {
        this.repository = repository;
    }

    @Operation(summary = "Get all disc magazines")
    @ApiResponse(responseCode = "200", description = "Disc magazines returned successfully")
    @GetMapping
    public List<DiscMagEntity> all() {
        return repository.findAll();
    }

    @Operation(summary = "Get a disc magazine by ID")
    @ApiResponse(responseCode = "200", description = "Disc magazine found")
    @ApiResponse(responseCode = "404", description = "Disc magazine not found")
    @GetMapping("/{id}")
    public DiscMagEntity one(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disc magazine", id));
    }

    @Operation(summary = "Create a new disc magazine")
    @ApiResponse(responseCode = "201", description = "Disc magazine created successfully")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DiscMagEntity create(@RequestBody DiscMagEntity discMag) {
        discMag.setId(null);
        return repository.save(discMag);
    }

    @Operation(summary = "Update a disc magazine")
    @ApiResponse(responseCode = "200", description = "Disc magazine updated successfully")
    @ApiResponse(responseCode = "404", description = "Disc magazine not found")
    @PutMapping("/{id}")
    public DiscMagEntity update(@PathVariable Long id, @RequestBody DiscMagEntity newDiscMag) {
        DiscMagEntity discMag = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disc magazine", id));

        discMag.setTitle(newDiscMag.getTitle());
        discMag.setPrice(newDiscMag.getPrice());
        discMag.setCopies(newDiscMag.getCopies());
        discMag.setOrderQty(newDiscMag.getOrderQty());
        discMag.setCurrentIssue(newDiscMag.getCurrentIssue());
        discMag.setHasDisc(newDiscMag.getHasDisc());

        return repository.save(discMag);
    }

    @Operation(summary = "Delete a disc magazine")
    @ApiResponse(responseCode = "204", description = "Disc magazine deleted successfully")
    @ApiResponse(responseCode = "404", description = "Disc magazine not found")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        DiscMagEntity discMag = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disc magazine", id));

        repository.delete(discMag);
    }
}
