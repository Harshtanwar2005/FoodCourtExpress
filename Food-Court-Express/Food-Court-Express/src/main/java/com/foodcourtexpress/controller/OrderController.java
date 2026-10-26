
package com.foodcourtexpress.controller;

import com.foodcourtexpress.dto.OrderRequest;
import com.foodcourtexpress.model.FoodCourtOrder;
import com.foodcourtexpress.model.MenuItem;
import com.foodcourtexpress.model.Vendor;
import com.foodcourtexpress.model.VendorOrder;
import com.foodcourtexpress.model.VendorOrderItem;
import com.foodcourtexpress.repository.FoodCourtOrderRepository;
import com.foodcourtexpress.repository.MenuItemRepository;
import com.foodcourtexpress.repository.VendorOrderItemRepository;
import com.foodcourtexpress.repository.VendorOrderRepository;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final FoodCourtOrderRepository orders;
    private final MenuItemRepository menu;
    private final VendorOrderRepository vendorOrders;
    private final VendorOrderItemRepository vendorOrderItems;

    public OrderController(
            FoodCourtOrderRepository orders,
            MenuItemRepository menu,
            VendorOrderRepository vendorOrders,
            VendorOrderItemRepository vendorOrderItems) {
        this.orders = orders;
        this.menu = menu;
        this.vendorOrders = vendorOrders;
        this.vendorOrderItems = vendorOrderItems;
    }

    @PostMapping
    @Transactional
    public Map<String, Object> create(
            @Valid @RequestBody OrderRequest request) {

        String orderType = request.getOrderType() == null
                ? "DINE_IN"
                : request.getOrderType().trim().toUpperCase(Locale.ROOT);

        if (!orderType.equals("DINE_IN") && !orderType.equals("DELIVERY")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Choose DINE_IN or DELIVERY");
        }

        String tableNumber = clean(request.getTableNumber());
        String address = clean(request.getDeliveryAddress());

        if (orderType.equals("DINE_IN") &&
                (tableNumber == null || tableNumber.isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Table number is required for dine-in");
        }

        if (orderType.equals("DELIVERY") &&
                (address == null || address.isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Delivery address is required");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Your cart is empty");
        }

        // Load menu items and calculate all prices on the server.
        Map<Long, List<ConfirmedLine>> byVendor = new LinkedHashMap<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.OrderItem line : request.getItems()) {
            if (line.getMenuItemId() == null ||
                    line.getQuantity() < 1 ||
                    line.getQuantity() > 99) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid cart item");
            }

            MenuItem item = menu.findAvailableByIdWithVendor(
                    line.getMenuItemId()).orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Menu item unavailable: " + line.getMenuItemId()));

            Vendor vendor = item.getVendor();

            if (vendor == null || !vendor.isActive()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "The vendor for " + item.getName() + " is unavailable");
            }

            BigDecimal lineTotal = item.getPrice().multiply(
                    BigDecimal.valueOf(line.getQuantity()));

            total = total.add(lineTotal);

            ConfirmedLine confirmed = new ConfirmedLine(
                    item.getId(),
                    item.getName(),
                    item.getPrice(),
                    line.getQuantity(),
                    lineTotal);

            byVendor.computeIfAbsent(
                    vendor.getId(), key -> new ArrayList<>()).add(confirmed);
        }

        // Create the master order first.
        FoodCourtOrder order = new FoodCourtOrder();
        order.setOrderNumber("FCE-" +
                UUID.randomUUID().toString()
                        .substring(0, 8).toUpperCase(Locale.ROOT));
        order.setOrderType(orderType);
        order.setTableNumber(
                orderType.equals("DINE_IN") ? tableNumber : null);
        order.setDeliveryAddress(
                orderType.equals("DELIVERY") ? address : null);
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerPhone(request.getCustomerPhone().trim());
        order.setTotalAmount(total);
        order.setPaymentStatus("PENDING");
        order.setOrderStatus("PLACED");

        orders.saveAndFlush(order);

        // Create one vendor order per vendor, with its own item rows.
        List<Map<String, Object>> vendorResults = new ArrayList<>();

        for (Map.Entry<Long, List<ConfirmedLine>> entry
                : byVendor.entrySet()) {

            BigDecimal subtotal = entry.getValue().stream()
                    .map(ConfirmedLine::lineTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            VendorOrder vendorOrder = new VendorOrder();
            vendorOrder.setFoodCourtOrderId(order.getId());
            vendorOrder.setVendorId(entry.getKey());
            vendorOrder.setSubtotal(subtotal);
            vendorOrder.setStatus("PLACED");

            vendorOrders.saveAndFlush(vendorOrder);

            List<VendorOrderItem> itemRows = new ArrayList<>();

            for (ConfirmedLine line : entry.getValue()) {
                VendorOrderItem row = new VendorOrderItem();
                row.setVendorOrderId(vendorOrder.getId());
                row.setMenuItemId(line.menuItemId());
                row.setItemName(line.name().length() > 150
                        ? line.name().substring(0, 150) : line.name());
                row.setUnitPrice(line.unitPrice());
                row.setQuantity(line.quantity());
                row.setLineTotal(line.lineTotal());
                itemRows.add(row);
            }

            vendorOrderItems.saveAll(itemRows);

            Map<String, Object> vendorResult = new LinkedHashMap<>();
            vendorResult.put("vendorOrderId", vendorOrder.getId());
            vendorResult.put("vendorId", entry.getKey());
            vendorResult.put("subtotal", subtotal);
            vendorResult.put("status", "PLACED");
            vendorResults.add(vendorResult);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("orderId", order.getId());
        response.put("orderNumber", order.getOrderNumber());
        response.put("total", total);
        response.put("vendorOrders", vendorResults);
        response.put("message", "Order placed successfully");
        return response;
    }

    private static String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private record ConfirmedLine(
            Long menuItemId,
            String name,
            BigDecimal unitPrice,
            int quantity,
            BigDecimal lineTotal) {
    }
}
