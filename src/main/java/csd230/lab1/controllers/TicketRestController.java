
package csd230.lab1.controllers;

import csd230.lab1.entities.TicketEntity;
import csd230.lab1.repositories.TicketEntityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Ticket REST API", description = "REST API for managing tickets")
@RestController
@RequestMapping("/api/rest/tickets")
public class TicketRestController {

    private final TicketEntityRepository repository;

    public TicketRestController(TicketEntityRepository repository) {
        this.repository = repository;
    }

    @Operation(summary = "Get all tickets")
    @ApiResponse(responseCode = "200", description = "Tickets returned successfully")
    @GetMapping
    public List<TicketEntity> all() {
        return repository.findAll();
    }

    @Operation(summary = "Get a ticket by ID")
    @ApiResponse(responseCode = "200", description = "Ticket found")
    @ApiResponse(responseCode = "404", description = "Ticket not found")
    @GetMapping("/{id}")
    public TicketEntity one(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
    }

    @Operation(summary = "Create a new ticket")
    @ApiResponse(responseCode = "201", description = "Ticket created successfully")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketEntity create(@RequestBody TicketEntity ticket) {
        ticket.setId(null);
        return repository.save(ticket);
    }

    @Operation(summary = "Update a ticket")
    @ApiResponse(responseCode = "200", description = "Ticket updated successfully")
    @ApiResponse(responseCode = "404", description = "Ticket not found")
    @PutMapping("/{id}")
    public TicketEntity update(@PathVariable Long id, @RequestBody TicketEntity newTicket) {
        TicketEntity ticket = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        ticket.setDescription(newTicket.getDescription());
        ticket.setPrice(newTicket.getPrice());

        return repository.save(ticket);
    }

    @Operation(summary = "Delete a ticket")
    @ApiResponse(responseCode = "204", description = "Ticket deleted successfully")
    @ApiResponse(responseCode = "404", description = "Ticket not found")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        TicketEntity ticket = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        repository.delete(ticket);
    }
}
