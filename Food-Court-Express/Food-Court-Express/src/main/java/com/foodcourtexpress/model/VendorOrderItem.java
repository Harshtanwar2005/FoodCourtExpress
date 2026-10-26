
package com.foodcourtexpress.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vendor_order_items")
public class VendorOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vendor_order_id", nullable = false)
    private Long vendorOrderId;

    @Column(name = "menu_item_id")
    private Long menuItemId;

    @Column(name = "item_name", nullable = false, length = 150)
    private String itemName;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "line_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal lineTotal;

    public Long getId() { return id; }
    public Long getVendorOrderId() { return vendorOrderId; }
    public void setVendorOrderId(Long v) { vendorOrderId = v; }
    public Long getMenuItemId() { return menuItemId; }
    public void setMenuItemId(Long v) { menuItemId = v; }
    public String getItemName() { return itemName; }
    public void setItemName(String v) { itemName = v; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal v) { unitPrice = v; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int v) { quantity = v; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal v) { lineTotal = v; }
}
