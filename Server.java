import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

public class Server {
    public static void main(String[] args) throws IOException {
        int port = 7000;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // 1. Get All Outlets API
        server.createContext("/api/outlets", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                addCorsHeaders(exchange);
                if (handlePreflight(exchange)) return;

                StringBuilder jsonBuilder = new StringBuilder("[");
                
                try (Connection conn = Database.connect()) {
                    if (conn != null) {
                        try (Statement stmt = conn.createStatement();
                             ResultSet rs = stmt.executeQuery("SELECT * FROM outlets")) {
                            
                            boolean first = true;
                            while (rs.next()) {
                                if (!first) jsonBuilder.append(",");
                                jsonBuilder.append("{")
                                        .append("\"id\":\"").append(rs.getString("id")).append("\",")
                                        .append("\"name\":\"").append(rs.getString("name")).append("\",")
                                        .append("\"category\":\"").append(rs.getString("category")).append("\",")
                                        .append("\"isOpen\":").append(rs.getInt("isOpen") == 1)
                                        .append("}");
                                first = false;
                            }
                        }
                    } else {
                        System.out.println("Outlets API Error: Database connection is null");
                    }
                } catch (Exception e) {
                    System.out.println("Outlets API Error: " + e.getMessage());
                }
                
                jsonBuilder.append("]");
                sendJsonResponse(exchange, jsonBuilder.toString());
            }
        });

        server.setExecutor(null);
        server.start();
        System.out.println("Professional FoodCourt Server started on http://localhost:" + port);
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static boolean handlePreflight(HttpExchange exchange) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return true;
        }
        return false;
    }

    private static void sendJsonResponse(HttpExchange exchange, String jsonResponse) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = jsonResponse.getBytes("UTF-8");
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}