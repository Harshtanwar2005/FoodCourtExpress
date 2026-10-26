package com.foodcourtexpress.controller;

import com.foodcourtexpress.model.FoodCourtOrder;
import com.foodcourtexpress.model.VendorOrder;
import com.foodcourtexpress.model.VendorOrderItem;
import com.foodcourtexpress.repository.FoodCourtOrderRepository;
import com.foodcourtexpress.repository.VendorOrderItemRepository;
import com.foodcourtexpress.repository.VendorOrderRepository;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api/vendor/orders")
public class VendorDashboardController {

    private final VendorOrderRepository vendorOrders;
    private final VendorOrderItemRepository items;
    private final FoodCourtOrderRepository orders;

    public VendorDashboardController(
            VendorOrderRepository vendorOrders,
            VendorOrderItemRepository items,
            FoodCourtOrderRepository orders) {
        this.vendorOrders = vendorOrders;
        this.items = items;
        this.orders = orders;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(
            @RequestParam Long vendorId,
            @RequestParam(defaultValue = "active") String view) {

        String selectedView = view.trim().toLowerCase(Locale.ROOT);

        if (!selectedView.equals("active")
                && !selectedView.equals("history")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "View must be active or history");
        }

        Set<String> activeStatuses = Set.of(
                "PLACED", "ACCEPTED", "PREPARING", "READY");
        Set<String> historyStatuses = Set.of(
                "COMPLETED", "CANCELLED");

        Set<String> allowedStatuses = selectedView.equals("history")
                ? historyStatuses : activeStatuses;

        List<Map<String, Object>> result = new ArrayList<>();

        for (VendorOrder vendorOrder :
                vendorOrders.findByVendorIdOrderByIdDesc(vendorId)) {

            String status = vendorOrder.getStatus();

            if (status == null || !allowedStatuses.contains(
                    status.trim().toUpperCase(Locale.ROOT))) {
                continue;
            }

            FoodCourtOrder master = orders.findById(
                    vendorOrder.getFoodCourtOrderId()).orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Parent order not found"));

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("vendorOrderId", vendorOrder.getId());
            row.put("orderId", master.getId());
            row.put("orderNumber", master.getOrderNumber());
            row.put("customerName", master.getCustomerName());
            row.put("customerPhone", master.getCustomerPhone());
            row.put("orderType", master.getOrderType());
            row.put("tableNumber", master.getTableNumber());
            row.put("deliveryAddress", master.getDeliveryAddress());
            row.put("subtotal", vendorOrder.getSubtotal());
            row.put("status", status);

            List<Map<String, Object>> itemRows = new ArrayList<>();

            for (VendorOrderItem item :
                    items.findByVendorOrderId(vendorOrder.getId())) {
                Map<String, Object> itemRow = new LinkedHashMap<>();
                itemRow.put("name", item.getItemName());
                itemRow.put("quantity", item.getQuantity());
                itemRow.put("unitPrice", item.getUnitPrice());
                itemRow.put("lineTotal", item.getLineTotal());
                itemRows.add(itemRow);
            }

            row.put("items", itemRows);
            result.add(row);
        }

        return result;
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public Map<String, Object> updateStatus(
            @PathVariable Long id,
            @RequestParam Long vendorId,
            @RequestBody Map<String, String> body) {

        VendorOrder order = vendorOrders.findById(id)
                .filter(o -> Objects.equals(o.getVendorId(), vendorId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Vendor order not found"));

        String status = body == null ? "" :
                body.getOrDefault("status", "")
                        .trim().toUpperCase(Locale.ROOT);

        Set<String> allowed = Set.of(
                "ACCEPTED", "PREPARING", "READY",
                "COMPLETED", "CANCELLED");

        if (!allowed.contains(status)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid order status");
        }

        order.setStatus(status);
        vendorOrders.save(order);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("vendorOrderId", order.getId());
        response.put("status", order.getStatus());
        response.put("message", "Order status updated successfully");
        return response;
    }
}