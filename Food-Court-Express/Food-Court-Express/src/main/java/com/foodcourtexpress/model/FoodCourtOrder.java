
package com.foodcourtexpress.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "food_court_orders")
public class FoodCourtOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, length = 40)
    private String orderNumber;

    @Column(name = "table_number", length = 30)
    private String tableNumber;

    @Column(name = "customer_name", length = 120)
    private String customerName;

    @Column(name = "customer_phone", length = 30)
    private String customerPhone;

    @Column(name = "order_type", nullable = false, length = 20)
    private String orderType;

    @Column(name = "delivery_address", length = 1000)
    private String deliveryAddress;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus = "PENDING";

    @Column(name = "order_status", nullable = false, length = 30)
    private String orderStatus = "PLACED";

    public Long getId() { return id; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String v) { orderNumber = v; }
    public String getTableNumber() { return tableNumber; }
    public void setTableNumber(String v) { tableNumber = v; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String v) { customerName = v; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String v) { customerPhone = v; }
    public String getOrderType() { return orderType; }
    public void setOrderType(String v) { orderType = v; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String v) { deliveryAddress = v; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal v) { totalAmount = v; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String v) { paymentStatus = v; }
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String v) { orderStatus = v; }
}
