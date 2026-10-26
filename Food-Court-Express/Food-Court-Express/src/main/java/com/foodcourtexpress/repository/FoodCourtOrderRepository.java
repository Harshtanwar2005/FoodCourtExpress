package com.foodcourtexpress.repository;

import com.foodcourtexpress.model.FoodCourtOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FoodCourtOrderRepository
        extends JpaRepository<FoodCourtOrder, Long> {

    Optional<FoodCourtOrder> findByOrderNumberIgnoreCaseAndCustomerPhone(
            String orderNumber,
            String customerPhone
    );
}
