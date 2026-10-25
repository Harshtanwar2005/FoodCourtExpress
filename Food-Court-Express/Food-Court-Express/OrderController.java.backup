package com.foodcourtexpress.controller;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodcourtexpress.dto.OrderRequest;
import com.foodcourtexpress.model.CustomerOrder;
import com.foodcourtexpress.model.MenuItem;
import com.foodcourtexpress.repository.CustomerOrderRepository;
import com.foodcourtexpress.repository.MenuItemRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.*;
@RestController @RequestMapping("/api/orders")
public class OrderController {
 private final CustomerOrderRepository orders; private final MenuItemRepository menu; private final ObjectMapper mapper;
 public OrderController(CustomerOrderRepository orders, MenuItemRepository menu, ObjectMapper mapper){this.orders=orders;this.menu=menu;this.mapper=mapper;}
 @PostMapping public Map<String,Object> create(@Valid @RequestBody OrderRequest request){
  BigDecimal total=BigDecimal.ZERO; List<Map<String,Object>> confirmed=new ArrayList<>();
  for(OrderRequest.OrderItem line:request.getItems()){
   MenuItem item=menu.findById(line.getMenuItemId()).filter(MenuItem::isAvailable).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Menu item unavailable: "+line.getMenuItemId()));
   BigDecimal lineTotal=item.getPrice().multiply(BigDecimal.valueOf(line.getQuantity())); total=total.add(lineTotal);
   Map<String,Object> row=new LinkedHashMap<>(); row.put("menuItemId",item.getId());row.put("name",item.getName());row.put("quantity",line.getQuantity());row.put("unitPrice",item.getPrice());row.put("lineTotal",lineTotal);confirmed.add(row);
  }
  CustomerOrder order=new CustomerOrder(); order.setCustomerName(request.getCustomerName().trim());order.setCustomerEmail(request.getCustomerEmail().trim());order.setCustomerPhone(request.getCustomerPhone().trim());order.setDeliveryAddress(request.getDeliveryAddress().trim());order.setTotal(total);
  try{order.setItemsJson(mapper.writeValueAsString(confirmed));}catch(JsonProcessingException e){throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Could not save order details");}
  orders.save(order); Map<String,Object> response=new LinkedHashMap<>();response.put("orderId",order.getId());response.put("total",total);response.put("message","Order placed successfully");return response;
 }
}
