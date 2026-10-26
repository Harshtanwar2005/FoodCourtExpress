
package com.foodcourtexpress.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vendor_orders")
public class VendorOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "food_court_order_id", nullable = false)
    private Long foodCourtOrderId;

    @Column(name = "vendor_id", nullable = false)
    private Long vendorId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, length = 30)
    private String status = "PLACED";

    public Long getId() { return id; }
    public Long getFoodCourtOrderId() { return foodCourtOrderId; }
    public void setFoodCourtOrderId(Long v) { foodCourtOrderId = v; }
    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long v) { vendorId = v; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal v) { subtotal = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
}
