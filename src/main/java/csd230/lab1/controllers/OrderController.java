package csd230.lab1.controllers;

import csd230.lab1.entities.OrderEntity;
import csd230.lab1.repositories.OrderEntityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderEntityRepository orderRepository;

    @GetMapping("/{id}")
    public String getOrder(@PathVariable Long id, Model model) {

        OrderEntity order = orderRepository.findById(id).orElse(null);

        if (order == null) {
            return "redirect:/books";
        }

        model.addAttribute("order", order);
        return "orderDetails";
    }
}
