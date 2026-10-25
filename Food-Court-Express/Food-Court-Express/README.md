# Food Court Express

A starter full-stack food ordering project using HTML, CSS, vanilla JavaScript, Java 17, Spring Boot, Maven, and MySQL through XAMPP.

## Included features

- Responsive food court landing page and menu
- Category filters and add-to-cart quantity controls
- Checkout form and order confirmation
- Spring Boot REST API for menu items and orders
- MySQL schema and sample menu seed data
- Server-side order total calculation (prices are not trusted from the browser)

## Requirements

1. Java Development Kit (JDK) 17 or later
2. Internet connection for the first run (the included Windows `mvnw.cmd` downloads Maven automatically; no separate Maven installation is needed)
3. XAMPP with MySQL/MariaDB enabled
4. A code editor such as VS Code or IntelliJ IDEA

Check Java in PowerShell with `java -version`. If Java is not recognized, install a JDK 17 or later and ensure its `bin` folder is on `PATH`.

## 1. Set up the database in XAMPP

1. Open XAMPP Control Panel and start **MySQL**.
2. Open `http://localhost/phpmyadmin`.
3. Choose **Import**, select `database/food_court_express.sql`, and run the import.
4. Confirm the `food_court_express` database and `menu_items` table exist.

The default Spring configuration assumes MySQL is on `localhost:3306`, username `root`, and an empty password. If you configured a password or changed the port, update `src/main/resources/application.properties` or set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables.

## 2. Run the application on Windows

Open PowerShell in the project root (the folder containing `pom.xml`) and run:

```powershell
.\mvnw.cmd clean spring-boot:run
```

On the first run, `mvnw.cmd` downloads Maven 3.9.11 into `.mvn/wrapper/`. Later runs reuse that download. You still need Java 17 or later and an internet connection for the initial Maven/dependency downloads.

When the application starts, visit:

- Website: `http://localhost:8080`
- Menu API: `http://localhost:8080/api/menu`
- Orders API: `POST http://localhost:8080/api/orders`

Spring Boot serves the frontend from `src/main/resources/static`, so no separate frontend server is required. Keep the Spring Boot process running while using the website.

## 3. Test an order

Add an item to the basket, fill in the delivery form, and select **Place my order**. The API validates the submitted details, looks up menu prices in the database, calculates the total on the server, and saves the order in `customer_orders`.

## Project structure

```text
Food-Court-Express/
├── .mvn/wrapper/maven-wrapper.properties
├── database/food_court_express.sql
├── mvnw.cmd
├── pom.xml
└── src/main/
    ├── java/com/foodcourtexpress/ (application, controllers, DTOs, models, repositories)
    └── resources/ (application.properties, static frontend)
```

## REST endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/menu` | List available menu items |
| GET | `/api/menu/{id}` | Fetch one menu item |
| POST | `/api/menu` | Create a menu item (development-only endpoint) |
| POST | `/api/orders` | Validate and place an order |

## Important notes

This is a starter project, not a production-ready commerce system. Online payment, authentication, admin dashboard, email/SMS, and live delivery tracking are not configured. Before deploying publicly, add authentication/authorization, stronger validation, secrets management, HTTPS, database migrations, and tests. Restrict the menu creation endpoint to authorized administrators.
