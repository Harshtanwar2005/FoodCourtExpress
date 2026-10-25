
package com.foodcourtexpress.repository;

import com.foodcourtexpress.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MenuItemRepository
        extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByAvailableTrue();

    @Query("""
        SELECT m
        FROM MenuItem m
        LEFT JOIN FETCH m.vendor
        WHERE m.available = true
        ORDER BY m.id
        """)
    List<MenuItem> findAvailableWithVendor();

    @Query("""
        SELECT m
        FROM MenuItem m
        LEFT JOIN FETCH m.vendor
        WHERE m.id = :id AND m.available = true
        """)
    Optional<MenuItem> findAvailableByIdWithVendor(@Param("id") Long id);
}
