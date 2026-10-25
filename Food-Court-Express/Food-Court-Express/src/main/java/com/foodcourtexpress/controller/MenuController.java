
package com.foodcourtexpress.controller;

import com.foodcourtexpress.dto.MenuItemResponse;
import com.foodcourtexpress.model.MenuItem;
import com.foodcourtexpress.repository.MenuItemRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuItemRepository repository;

    public MenuController(MenuItemRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<MenuItemResponse> all() {
        return repository.findAvailableWithVendor()
                .stream()
                .map(MenuItemResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public MenuItemResponse one(@PathVariable Long id) {
        MenuItem item = repository
                .findAvailableByIdWithVendor(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Menu item not found"
                        )
                );

        return MenuItemResponse.from(item);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MenuItemResponse create(@RequestBody MenuItem item) {
        MenuItem saved = repository.save(item);

        MenuItem result = repository
                .findAvailableByIdWithVendor(saved.getId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Could not load the saved menu item"
                        )
                );

        return MenuItemResponse.from(result);
    }
}
