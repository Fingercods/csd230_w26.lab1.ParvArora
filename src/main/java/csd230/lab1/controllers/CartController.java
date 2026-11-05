
package csd230.lab1.controllers;

import csd230.lab1.entities.*;
import csd230.lab1.repositories.BookEntityRepository;
import csd230.lab1.repositories.CartEntityRepository;
import csd230.lab1.repositories.OrderEntityRepository;
import csd230.lab1.repositories.UserEntityRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Controller
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartEntityRepository cartRepository;

    @Autowired
    private BookEntityRepository bookRepository;

    @Autowired
    private OrderEntityRepository orderRepository;

    @Autowired
    private UserEntityRepository userRepository;

    private CartEntity getUserCart(Authentication authentication) {
        String username = authentication.getName();

        CartEntity cart = cartRepository.findByUserUsername(username);

        if (cart == null) {
            UserEntity user = userRepository.findByUsername(username);

            if (user == null) {
                throw new IllegalStateException("User not found");
            }

            cart = new CartEntity();
            cart.setUser(user);
            cart = cartRepository.save(cart);
        }

        return cart;
    }

    @GetMapping
    @Transactional
    public String viewCart(Model model, Authentication authentication) {
        CartEntity cart = getUserCart(authentication);
        model.addAttribute("cart", cart);
        return "cartDetails";
    }

    @GetMapping("/add/{bookId}")
    @Transactional
    public String addToCart(@PathVariable Long bookId,
                            Authentication authentication) {

        CartEntity cart = getUserCart(authentication);
        BookEntity book = bookRepository.findById(bookId).orElse(null);

        if (book != null) {
            cart.addProduct(book);
            cartRepository.save(cart);
        }

        return "redirect:/books";
    }

    @GetMapping("/remove/{bookId}")
    @Transactional
    public String removeFromCart(@PathVariable Long bookId,
                                 Authentication authentication) {

        CartEntity cart = getUserCart(authentication);
        BookEntity book = bookRepository.findById(bookId).orElse(null);

        if (book != null) {
            cart.getProducts().remove(book);
            book.getCarts().remove(cart);
            cartRepository.save(cart);
        }

        return "redirect:/cart";
    }

    @PostMapping("/checkout")
    @Transactional
    public String checkout(Authentication authentication) {

        CartEntity cart = getUserCart(authentication);

        if (cart.getProducts().isEmpty()) {
            return "redirect:/cart";
        }

        Set<ProductEntity> purchasedProducts =
                new LinkedHashSet<>(cart.getProducts());

        double total = 0;

        for (ProductEntity product : purchasedProducts) {

            if (product instanceof PublicationEntity publication) {
                if (publication.getCopies() <= 0) {
                    return "redirect:/cart";
                }

                publication.setCopies(publication.getCopies() - 1);

                if (publication instanceof BookEntity book) {
                    bookRepository.save(book);
                }
            }

            total += product.getPrice();
        }

        OrderEntity order = new OrderEntity();
        order.setOrderDate(LocalDateTime.now());
        order.setTotalAmount(total);
        order.setProducts(purchasedProducts);

        orderRepository.save(order);

        for (ProductEntity product : purchasedProducts) {
            product.getCarts().remove(cart);
        }

        cart.getProducts().clear();
        cartRepository.save(cart);

        return "redirect:/orders/" + order.getId();
    }
}
