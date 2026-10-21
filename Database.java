import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class Database {
    private static final String URL = "jdbc:sqlite:foodcourt.db";

   public static Connection connect() {
    Connection conn = null;
    try {
        Class.forName("org.sqlite.JDBC"); 
        conn = DriverManager.getConnection(URL);
        createTables(conn);
        insertSampleData(conn);
    } catch (Exception e) {
        System.out.println("Database Connection Error: " + e.getMessage());
    }
    return conn;
}

    public static void createTables(Connection conn) {
        String outletTable = "CREATE TABLE IF NOT EXISTS outlets (" +
                "id TEXT PRIMARY KEY, " +
                "name TEXT, " +
                "category TEXT, " +
                "isOpen INTEGER);";

        String menuTable = "CREATE TABLE IF NOT EXISTS menu_items (" +
                "id TEXT PRIMARY KEY, " +
                "outletId TEXT, " +
                "name TEXT, " +
                "price REAL, " +
                "category TEXT);";

        String orderTable = "CREATE TABLE IF NOT EXISTS orders (" +
                "tokenNumber TEXT PRIMARY KEY, " +
                "outletId TEXT, " +
                "itemsSummary TEXT, " +
                "totalAmount REAL, " +
                "status TEXT);";

        try (Statement stmt = conn.createStatement()) {
            stmt.execute(outletTable);
            stmt.execute(menuTable);
            stmt.execute(orderTable);
        } catch (Exception e) {
            System.out.println("Table Creation Error: " + e.getMessage());
        }
    }

    public static void insertSampleData(Connection conn) {
        try (Statement stmt = conn.createStatement()) {
            // Mall Outlets Sample Data
            stmt.execute("INSERT OR IGNORE INTO outlets VALUES ('1', 'South Dosa Corner', 'South Indian', 1);");
            stmt.execute("INSERT OR IGNORE INTO outlets VALUES ('2', 'Fresh Juice Hub', 'Beverages', 1);");
            stmt.execute("INSERT OR IGNORE INTO outlets VALUES ('3', 'Burger & Fast Food', 'Fast Food', 1);");

            // Menu Items Sample Data
            stmt.execute("INSERT OR IGNORE INTO menu_items VALUES ('m1', '1', 'Masala Dosa', 120.0, 'Main Course');");
            stmt.execute("INSERT OR IGNORE INTO menu_items VALUES ('m2', '1', 'Paneer Dosa', 150.0, 'Main Course');");
            stmt.execute("INSERT OR IGNORE INTO menu_items VALUES ('m3', '2', 'Cold Coffee', 80.0, 'Beverages');");
            stmt.execute("INSERT OR IGNORE INTO menu_items VALUES ('m4', '2', 'Mango Shake', 100.0, 'Beverages');");
            stmt.execute("INSERT OR IGNORE INTO menu_items VALUES ('m5', '3', 'Veg Burger', 90.0, 'Fast Food');");
        } catch (Exception e) {
            System.out.println("Sample Data Error: " + e.getMessage());
        }
    }
}