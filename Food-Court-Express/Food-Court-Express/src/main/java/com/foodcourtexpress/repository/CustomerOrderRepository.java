package com.foodcourtexpress.repository;
import com.foodcourtexpress.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {}
