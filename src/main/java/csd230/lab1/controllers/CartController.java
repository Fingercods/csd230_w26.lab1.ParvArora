package csd230.lab1.controllers;

import csd230.lab1.entities.*;
import csd230.lab1.repositories.BookEntityRepository;
import csd230.lab1.repositories.CartEntityRepository;
import csd230.lab1.repositories.OrderEntityRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping
    public String viewCart(Model model) {
        Long defaultCartId = 1L;

        CartEntity cart = cartRepository.findById(defaultCartId)
                .orElseGet(() -> cartRepository.save(new CartEntity()));

        model.addAttribute("cart", cart);
        return "cartDetails";
    }

    @GetMapping("/add/{bookId}")
    public String addToCart(@PathVariable Long bookId) {

        CartEntity cart = cartRepository.findById(1L).orElse(null);
        BookEntity book = bookRepository.findById(bookId).orElse(null);

        if (cart != null && book != null) {
            cart.addProduct(book);
            cartRepository.save(cart);
        }

        return "redirect:/books";
    }

    @GetMapping("/remove/{bookId}")
    public String removeFromCart(@PathVariable Long bookId) {

        CartEntity cart = cartRepository.findById(1L).orElse(null);
        BookEntity book = bookRepository.findById(bookId).orElse(null);

        if (cart != null && book != null) {
            cart.getProducts().remove(book);
            cartRepository.save(cart);
        }

        return "redirect:/cart";
    }

    @PostMapping("/checkout")
    @Transactional
    public String checkout() {

        CartEntity cart = cartRepository.findById(1L).orElse(null);

        if (cart == null || cart.getProducts().isEmpty()) {
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

        cart.getProducts().clear();
        cartRepository.save(cart);

        return "redirect:/orders/" + order.getId();
    }
}