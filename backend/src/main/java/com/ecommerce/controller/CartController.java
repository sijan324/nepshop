package com.ecommerce.controller;

import com.ecommerce.dto.AddToCartRequest;
import com.ecommerce.dto.CartDto;
import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    private String getUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
             String email = auth.getName();
             return userRepository.findByEmail(email)
                     .map(User::getId)
                     .orElse(null);
        }
        return null;
    }

    private String getSessionId(HttpServletRequest request) {
        // Ensure session exists
        HttpSession session = request.getSession(true);
        return session.getId();
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart(HttpServletRequest request) {
        String userId = getUserId();
        String sessionId = getSessionId(request);
        return ResponseEntity.ok(cartService.getCart(userId, sessionId));
    }

    @PostMapping
    public ResponseEntity<CartDto> addToCart(@RequestBody AddToCartRequest addToCartRequest, HttpServletRequest request) {
        String userId = getUserId();
        String sessionId = getSessionId(request);
        return ResponseEntity.ok(cartService.addToCart(userId, sessionId, addToCartRequest));
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateCartItem(
            @PathVariable String itemId,
            @RequestBody Map<String, Integer> body,
            HttpServletRequest request
    ) {
        String userId = getUserId();
        String sessionId = getSessionId(request);
        Integer quantity = body.get("quantity");
        if (quantity == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cartService.updateCartItem(userId, sessionId, itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeFromCart(@PathVariable String itemId, HttpServletRequest request) {
        String userId = getUserId();
        String sessionId = getSessionId(request);
        return ResponseEntity.ok(cartService.removeFromCart(userId, sessionId, itemId));
    }
}
