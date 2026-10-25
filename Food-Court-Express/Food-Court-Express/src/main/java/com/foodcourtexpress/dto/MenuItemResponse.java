
package com.foodcourtexpress.dto;

import com.foodcourtexpress.model.MenuItem;
import com.foodcourtexpress.model.Vendor;

import java.math.BigDecimal;

public class MenuItemResponse {

    private Long id;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private String imageUrl;
    private boolean available;

    private Long vendorId;
    private String vendorName;
    private String vendorSlug;
    private String vendorLogoUrl;

    public MenuItemResponse() {
    }

    public static MenuItemResponse from(MenuItem item) {
        MenuItemResponse response = new MenuItemResponse();

        response.setId(item.getId());
        response.setName(item.getName());
        response.setDescription(item.getDescription());
        response.setCategory(item.getCategory());
        response.setPrice(item.getPrice());
        response.setImageUrl(item.getImageUrl());
        response.setAvailable(item.isAvailable());

        Vendor vendor = item.getVendor();

        if (vendor != null) {
            response.setVendorId(vendor.getId());
            response.setVendorName(vendor.getName());
            response.setVendorSlug(vendor.getSlug());
            response.setVendorLogoUrl(vendor.getLogoUrl());
        }

        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorSlug() { return vendorSlug; }
    public void setVendorSlug(String vendorSlug) { this.vendorSlug = vendorSlug; }

    public String getVendorLogoUrl() { return vendorLogoUrl; }
    public void setVendorLogoUrl(String vendorLogoUrl) { this.vendorLogoUrl = vendorLogoUrl; }
}
