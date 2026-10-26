
package com.foodcourtexpress.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public class OrderRequest {

    @NotBlank
    @Size(max = 120)
    private String customerName;

    @Email
    @Size(max = 255)
    private String customerEmail;

    @NotBlank
    @Size(max = 30)
    private String customerPhone;

    private String orderType = "DINE_IN";

    @Size(max = 30)
    private String tableNumber;

    @Size(max = 1000)
    private String deliveryAddress;

    @NotEmpty
    @Valid
    private List<OrderItem> items;

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String v) { customerName = v; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String v) { customerEmail = v; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String v) { customerPhone = v; }

    public String getOrderType() { return orderType; }
    public void setOrderType(String v) { orderType = v; }

    public String getTableNumber() { return tableNumber; }
    public void setTableNumber(String v) { tableNumber = v; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String v) { deliveryAddress = v; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> v) { items = v; }

    public static class OrderItem {

        @NotNull
        @Positive
        private Long menuItemId;

        @Min(1)
        @Max(99)
        private int quantity;

        public Long getMenuItemId() { return menuItemId; }
        public void setMenuItemId(Long v) { menuItemId = v; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int v) { quantity = v; }
    }
}
