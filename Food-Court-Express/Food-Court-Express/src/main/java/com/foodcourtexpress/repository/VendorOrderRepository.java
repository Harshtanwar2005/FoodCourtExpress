package com.foodcourtexpress.repository;

import com.foodcourtexpress.model.VendorOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorOrderRepository
        extends JpaRepository<VendorOrder, Long> {

    List<VendorOrder> findByVendorIdOrderByIdDesc(Long vendorId);
}