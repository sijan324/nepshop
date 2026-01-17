# Enterprise E-Commerce Backend API

## 🚀 Project Overview

This is a robust, production-grade RESTful API designed for a modern E-commerce platform ("NepShop").
Built with **Spring Boot 3** and **Java 17**, this backend demonstrates a scalable, secure, and maintainable architecture suitable for enterprise applications. It replaces a legacy Node.js implementation to provide better type safety, transactional integrity, and performance at scale.

## 🛠️ Tech Stack & Professional Architecture

*   **Core Framework**: Spring Boot 3.2.1
*   **Language**: Java 17 (LTS)
*   **Database**: PostgreSQL (Production), H2 (Test/Dev support)
*   **ORM**: Spring Data JPA / Hibernate (Entity Relationship Management)
*   **Security**: Spring Security 6 (Session-based Auth, BCrypt Hashing, CORS configuration)
*   **Deployment**: Docker & Docker Compose support
*   **Build Tool**: Maven

### 📐 Architectural Patterns Implemented

1.  **Layered Architecture**: Strict separation of concerns (Controller → Service → Repository).
2.  **DTO Pattern**: Usage of Data Transfer Objects to decouple internal database entities from external API contracts, ensuring versioning stability and data hiding.
3.  **Global Exception Handling**: Centralized `@ControllerAdvice` to provide consistent, typed error responses to the frontend.
4.  **Transaction Management**: ACID compliance for critical operations (e.g., placing orders, merging carts) using `@Transactional`.
5.  **12-Factor App methodology**: Configuration via environment variables for secure, portable deployments across Dev, Staging, and Production.

## 🔑 Key Features

### authentication & Security
*   **Secure Auth**: Custom implementation of `UserDetailsService`.
*   **Password Encryption**: Industry-standard BCrypt hashing.
*   **Session Management**: Secure, HTTP-only session cookies.
*   **Access Control**: Role-based access control (RBAC) ready (Admin vs Customer).

### Shopping Cart System
*   **Hybrid Cart Logic**: 
    *   Support for "Guest Carts" using session IDs.
    *   **Intelligent Merging**: Auto-merges guest cart items with the user's persistent cart upon login.
*   **Inventory Checks**: Real-time stock validation during add-to-cart operations.

### Product Catalog
*   **Optimized Queries**: JPA Specifications for dynamic filtering.
*   **Relational Design**: Efficient mapping of Products, Categories, and Variants.

## ⚙️ Environment Configuration

**Security Note**: Sensitive credentials are **never** committed to version control. This project uses environment variables.

To run locally or deploy, configure the following:

```properties
# Database Configuration
DATABASE_URL=jdbc:postgresql://<host>:5432/<db_name>
DB_USERNAME=<your_db_user>
DB_PASSWORD=<your_db_password>

# Server Configuration
PORT=5000
SESSION_SECRET=<secure_random_string>
```

## 🐳 Docker Deployment

The application includes a multi-stage `Dockerfile` optimized for production:

1.  **Build Stage**: Compiles the Java code creates a lightweight JAR.
2.  **Run Stage**: Uses a minimal Alpine Linux JRE image for security and small footprint.

```bash
# Build and Run
docker build -t nepshop-backend .
docker run -p 5000:5000 --env-file .env nepshop-backend
```

## 👨‍💻 Developer Notes

*   **Code Quality**: Adheres to strict Java naming conventions and SOLID principles.
*   **Scalability**: Stateless service design allows for horizontal scaling behind a load balancer (with externalized session store like Redis).

---
*Developed by Sijan. Demonstration of Full Stack Java Development capabilities.*
