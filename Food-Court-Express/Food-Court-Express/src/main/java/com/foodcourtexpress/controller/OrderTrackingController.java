
package com.foodcourtexpress.controller;

import com.foodcourtexpress.model.FoodCourtOrder;
import com.foodcourtexpress.model.VendorOrder;
import com.foodcourtexpress.repository.FoodCourtOrderRepository;
import com.foodcourtexpress.repository.VendorOrderRepository;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderTrackingController {

    private final FoodCourtOrderRepository orders;
    private final VendorOrderRepository vendorOrders;

    public OrderTrackingController(
            FoodCourtOrderRepository orders,
            VendorOrderRepository vendorOrders) {
        this.orders = orders;
        this.vendorOrders = vendorOrders;
    }

    @GetMapping("/track")
    @Transactional(readOnly = true)
    public Map<String, Object> track(
            @RequestParam String orderNumber,
            @RequestParam String phone) {

        String number = orderNumber.trim();
        String customerPhone = phone.trim();

        if (number.isBlank() || customerPhone.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order number and phone number are required");
        }

        FoodCourtOrder order = orders
                .findByOrderNumberIgnoreCaseAndCustomerPhone(
                        number, customerPhone)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No order found. Check your order number and phone number."));

        List<VendorOrder> parts = vendorOrders.findAll().stream()
                .filter(v -> Objects.equals(
                        v.getFoodCourtOrderId(), order.getId()))
                .toList();

        List<Map<String, Object>> vendorResults = new ArrayList<>();

        for (VendorOrder part : parts) {
            Map<String, Object> vendor = new LinkedHashMap<>();
            vendor.put("vendorOrderId", part.getId());
            vendor.put("status", part.getStatus());
            vendor.put("subtotal", part.getSubtotal());
            vendorResults.add(vendor);
        }

        List<String> statuses = parts.stream()
                .map(VendorOrder::getStatus)
                .filter(Objects::nonNull)
                .map(s -> s.trim().toUpperCase(Locale.ROOT))
                .toList();

        String overallStatus;

        if (statuses.isEmpty()) {
            overallStatus = order.getOrderStatus();
        } else if (statuses.stream().allMatch(
                s -> s.equals("CANCELLED"))) {
            overallStatus = "CANCELLED";
        } else if (statuses.stream().allMatch(
                s -> s.equals("COMPLETED") || s.equals("CANCELLED"))
                && statuses.stream().anyMatch(
                s -> s.equals("COMPLETED"))) {
            overallStatus = "COMPLETED";
        } else if (statuses.stream().anyMatch(
                s -> s.equals("PREPARING"))) {
            overallStatus = "PREPARING";
        } else if (statuses.stream().anyMatch(
                s -> s.equals("ACCEPTED"))) {
            overallStatus = "ACCEPTED";
        } else if (statuses.stream().anyMatch(
                s -> s.equals("READY"))) {
            overallStatus = "READY";
        } else {
            overallStatus = "PLACED";
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderNumber", order.getOrderNumber());
        result.put("customerName", order.getCustomerName());
        result.put("orderType", order.getOrderType());
        result.put("tableNumber", order.getTableNumber());
        result.put("deliveryAddress", order.getDeliveryAddress());
        result.put("total", order.getTotalAmount());
        result.put("paymentStatus", order.getPaymentStatus());
        result.put("status", overallStatus);
        result.put("vendorOrders", vendorResults);

        return result;
    }
}
