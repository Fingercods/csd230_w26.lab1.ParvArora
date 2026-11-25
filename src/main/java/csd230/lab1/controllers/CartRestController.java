package csd230.lab1.controllers;

import csd230.lab1.entities.CartEntity;
import csd230.lab1.entities.ProductEntity;
import csd230.lab1.entities.UserEntity;
import csd230.lab1.repositories.CartEntityRepository;
import csd230.lab1.repositories.ProductEntityRepository;
import csd230.lab1.repositories.UserEntityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/rest/carts")
public class CartRestController {

    private final CartEntityRepository repository;
    private final UserEntityRepository userRepository;
    private final ProductEntityRepository productRepository;

    public CartRestController(
            CartEntityRepository repository,
            UserEntityRepository userRepository,
            ProductEntityRepository productRepository) {

        this.repository = repository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    private UserEntity currentUser(Principal principal, boolean forUpdate) {

        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        UserEntity user = forUpdate
                ? userRepository.findByUsernameForUpdate(principal.getName())
                : userRepository.findByUsername(principal.getName());

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        return user;
    }

    private Map<String, Object> cartResponse(CartEntity cart) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("id", cart == null ? null : cart.getId());

        response.put("products", cart == null
                ? List.of()
                : List.copyOf(cart.getProducts()));

        return response;
    }

    @GetMapping("/mine")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getMine(Principal principal) {

        UserEntity user = currentUser(principal, false);

        CartEntity cart = repository.findByUser(user);

        if (cart == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(cartResponse(cart));
    }

    @PostMapping("/mine/products/{productId}")
    @Transactional
    public Map<String, Object> addMine(
            @PathVariable Long productId,
            Principal principal) {

        UserEntity user = currentUser(principal, true);

        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND));

        CartEntity cart = repository.findByUser(user);

        if (cart == null) {
            cart = new CartEntity();
            cart.setUser(user);
        }

        cart.addProduct(product);

        return cartResponse(repository.save(cart));
    }

    @DeleteMapping("/mine/products/{productId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> removeMine(
            @PathVariable Long productId,
            Principal principal) {

        UserEntity user = currentUser(principal, true);

        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND));

        CartEntity cart = repository.findByUser(user);

        if (cart == null) {
            return ResponseEntity.noContent().build();
        }

        if (cart.getProducts().remove(product)) {
            product.getCarts().remove(cart);
            repository.save(cart);
        }

        return ResponseEntity.ok(cartResponse(cart));
    }
}
