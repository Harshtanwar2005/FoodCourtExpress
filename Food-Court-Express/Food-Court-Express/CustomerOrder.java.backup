package com.foodcourtexpress.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity @Table(name="customer_orders")
public class CustomerOrder {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(name="customer_name", nullable=false) private String customerName;
  @Column(name="customer_email", nullable=false) private String customerEmail;
  @Column(name="customer_phone", nullable=false) private String customerPhone;
  @Column(name="delivery_address", nullable=false, length=1000) private String deliveryAddress;
  @Column(nullable=false, precision=10, scale=2) private BigDecimal total;
  @Column(name="created_at", nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
  @Column(nullable=false) private String itemsJson;
  public CustomerOrder() {}
  public Long getId(){return id;} public void setId(Long v){id=v;}
  public String getCustomerName(){return customerName;} public void setCustomerName(String v){customerName=v;}
  public String getCustomerEmail(){return customerEmail;} public void setCustomerEmail(String v){customerEmail=v;}
  public String getCustomerPhone(){return customerPhone;} public void setCustomerPhone(String v){customerPhone=v;}
  public String getDeliveryAddress(){return deliveryAddress;} public void setDeliveryAddress(String v){deliveryAddress=v;}
  public BigDecimal getTotal(){return total;} public void setTotal(BigDecimal v){total=v;}
  public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
  public String getItemsJson(){return itemsJson;} public void setItemsJson(String v){itemsJson=v;}
}
