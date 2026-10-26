package com.foodcourtexpress.repository;

import com.foodcourtexpress.model.VendorOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorOrderItemRepository
        extends JpaRepository<VendorOrderItem, Long> {

    List<VendorOrderItem> findByVendorOrderId(Long vendorOrderId);
}