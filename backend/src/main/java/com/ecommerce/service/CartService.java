package com.ecommerce.service;

import com.ecommerce.dto.AddToCartRequest;
import com.ecommerce.dto.CartDto;
import com.ecommerce.dto.CartItemDto;
import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public CartDto getCart(String userId, String sessionId) {
        Cart cart = findOrCreateCart(userId, sessionId);
        return mapToDto(cart);
    }

    @Transactional
    public CartDto addToCart(String userId, String sessionId, AddToCartRequest request) {
        Cart cart = findOrCreateCart(userId, sessionId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        Optional<CartItem> existingItem = items.stream()
                .filter(item -> item.getProduct().getId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            newItem.setPrice(product.getPrice());
            // Variant logic can be added here if needed
            cartItemRepository.save(newItem);
        }

        return mapToDto(cart);
    }

    @Transactional
    public CartDto updateCartItem(String userId, String sessionId, String itemId, Integer quantity) {
        Cart cart = findOrCreateCart(userId, sessionId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        if (!item.getCart().getId().equals(cart.getId())) {
             throw new RuntimeException("Item does not belong to this cart");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return mapToDto(cart);
    }

    @Transactional
    public CartDto removeFromCart(String userId, String sessionId, String itemId) {
        Cart cart = findOrCreateCart(userId, sessionId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Item does not belong to this cart");
        }

        cartItemRepository.delete(item);
        return mapToDto(cart);
    }

    @Transactional
    public void clearCart(String userId, String sessionId) {
        Cart cart = findOrCreateCart(userId, sessionId);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    public void mergeCarts(String sessionId, String userId) {
        Optional<Cart> sessionCart = cartRepository.findBySessionId(sessionId);
        if (sessionCart.isPresent()) {
             Cart userCart = findOrCreateCart(userId, null);
             List<CartItem> sessionItems = cartItemRepository.findByCartId(sessionCart.get().getId());
             
             for (CartItem sessionItem : sessionItems) {
                 // Check if user cart already has this product
                 List<CartItem> userItems = cartItemRepository.findByCartId(userCart.getId());
                 Optional<CartItem> existingUserItem = userItems.stream()
                         .filter(ui -> ui.getProduct().getId().equals(sessionItem.getProduct().getId()))
                         .findFirst();

                 if (existingUserItem.isPresent()) {
                     CartItem ui = existingUserItem.get();
                     ui.setQuantity(ui.getQuantity() + sessionItem.getQuantity());
                     cartItemRepository.save(ui);
                 } else {
                     sessionItem.setCart(userCart);
                     cartItemRepository.save(sessionItem);
                 }
             }
             // Delete session cart after merge
             cartRepository.delete(sessionCart.get());
        }
    }

    private Cart findOrCreateCart(String userId, String sessionId) {
        if (userId != null) {
            return cartRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        Cart cart = new Cart();
                        cart.setUser(userRepository.findById(userId).orElseThrow());
                        cart.setUpdatedAt(LocalDateTime.now());
                        return cartRepository.save(cart);
                    });
        } else {
            return cartRepository.findBySessionId(sessionId)
                    .orElseGet(() -> {
                        Cart cart = new Cart();
                        cart.setSessionId(sessionId);
                        cart.setUpdatedAt(LocalDateTime.now());
                        return cartRepository.save(cart);
                    });
        }
    }

    private CartDto mapToDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setSessionId(cart.getSessionId());
        if (cart.getUser() != null) {
            dto.setUserId(cart.getUser().getId());
        }

        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        List<CartItemDto> itemDtos = items.stream().map(this::mapItemToDto).collect(Collectors.toList());
        dto.setItems(itemDtos);

        BigDecimal total = items.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotal(total);

        return dto;
    }

    private CartItemDto mapItemToDto(CartItem item) {
        CartItemDto dto = new CartItemDto();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        if (!item.getProduct().getImages().isEmpty()) {
            dto.setProductImage(item.getProduct().getImages().get(0));
        }
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        dto.setTotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        return dto;
    }
}
