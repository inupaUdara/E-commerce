# GoCart E-Commerce Microservices

A microservices-based e-commerce platform built with Spring Boot and Spring Cloud for SLIIT SE4010 Cloud Computing Assignment.

## 📐 Architecture Overview

This project implements a microservices architecture with 4 independent services communicating through REST APIs using OpenFeign:

```
┌─────────────────────────────────────────────────────────┐
│                     API Gateway (8080)                    │
└────────────────┬──────────┬──────────┬───────────────────┘
                 │          │          │          │
    ┌────────────┘          │          │          └──────────────┐
    │                       │          │                         │
┌───▼───────┐       ┌──────▼──────┐   │            ┌───────────▼──┐
│   User    │◄──────│   Store     │   │            │    Order      │
│  Service  │       │   Service   │   │            │   Service     │
│  (8081)   │       │   (8083)    │   │            │   (8084)      │
└───────────┘       └──────┬──────┘   │            └────┬─────┬────┘
                           │          │                 │     │
                           │    ┌─────▼─────┐          │     │
                           └────►  Product  │◄─────────┘     │
                                │  Service  │                │
                                │  (8082)   │◄───────────────┘
                                └───────────┘
```

### Service Communication Flow
- **Store Service** → **User Service**: Validates user exists before creating store
- **Product Service** → **Store Service**: Validates store exists before adding products
- **Order Service** → **User Service**: Validates user and address
- **Order Service** → **Store Service**: Validates store
- **Order Service** → **Product Service**: Validates products and stock availability

## 🚀 Services

### 1. User Service (Port 8081)
**Responsibility**: User authentication, authorization, and profile management

**Key Features**:
- JWT-based authentication
- User registration and login
- Address management
- Role-based access control

**API Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/authenticate` - Login and get JWT token
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users` - Get all users
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/addresses` - Create address
- `GET /api/addresses/{id}` - Get address by ID
- `GET /api/addresses/user/{userId}` - Get addresses by user

**Technologies**: Spring Security, JWT, H2 Database

### 2. Store Service (Port 8083)
**Responsibility**: Store/vendor management

**Key Features**:
- Store registration and management
- Store approval workflow
- Store status tracking
- Inter-service communication with User Service

**API Endpoints**:
- `POST /api/stores` - Create store
- `GET /api/stores/{id}` - Get store by ID
- `GET /api/stores` - Get all stores
- `GET /api/stores/user/{userId}` - Get stores by user
- `PUT /api/stores/{id}` - Update store
- `DELETE /api/stores/{id}` - Delete store

**Technologies**: Spring Boot, OpenFeign, H2 Database

### 3. Product Service (Port 8082)
**Responsibility**: Product catalog and rating management

**Key Features**:
- Product CRUD operations
- Product categorization
- Stock management
- Product ratings and reviews
- Inter-service communication with Store Service

**API Endpoints**:
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products` - Get all products
- `GET /api/products/store/{storeId}` - Get products by store
- `GET /api/products/category/{category}` - Get products by category
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `POST /api/ratings` - Create rating
- `GET /api/ratings/product/{productId}` - Get ratings by product

**Technologies**: Spring Boot, OpenFeign, H2 Database

### 4. Order Service (Port 8084)
**Responsibility**: Order processing and payment management

**Key Features**:
- Order creation and management
- Coupon/discount management
- Payment method support (COD, Stripe)
- Order status tracking
- Inter-service communication with User, Store, and Product services

**API Endpoints**:
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders` - Get all orders
- `GET /api/orders/user/{userId}` - Get orders by user
- `GET /api/orders/store/{storeId}` - Get orders by store
- `GET /api/orders/status/{status}` - Get orders by status
- `PATCH /api/orders/{id}` - Update order status
- `DELETE /api/orders/{id}` - Delete order
- `POST /api/coupons` - Create coupon
- `GET /api/coupons/{code}` - Get coupon by code
- `GET /api/coupons/public` - Get public coupons

**Technologies**: Spring Boot, OpenFeign, H2 Database

### 5. API Gateway (Port 8080)
**Responsibility**: Single entry point, routing, CORS handling

**Key Features**:
- Routes traffic to appropriate microservices
- CORS configuration for frontend
- OpenAPI documentation aggregation
- Health monitoring

**Technologies**: Spring Cloud Gateway

## 🛠 Technology Stack

- **Framework**: Spring Boot 3.3.6
- **Language**: Java 17
- **Service Communication**: Spring Cloud OpenFeign 2023.0.0
- **API Documentation**: SpringDoc OpenAPI 2.3.0 (Swagger)
- **Security**: Spring Security + JWT
- **Database**: H2 (Development), PostgreSQL (Production-ready)
- **Build Tool**: Maven
- **Containerization**: Docker

## 📦 Prerequisites

- Java 17 or higher
- Maven 3.9+
- Docker (for containerized deployment)
- Postman or any API testing tool (optional)

## 🚀 Running the Services

### Option 1: Local Development (Without Docker)

1. **Start services in order** (to respect dependencies):

```bash
# Terminal 1: User Service
cd user-service
mvn clean install
mvn spring-boot:run

# Terminal 2: Store Service
cd store-service
mvn clean install
mvn spring-boot:run

# Terminal 3: Product Service
cd product-service
mvn clean install
mvn spring-boot:run

# Terminal 4: Order Service
cd order-service
mvn clean install
mvn spring-boot:run

# Terminal 5: API Gateway
cd api-gateway
mvn clean install
mvn spring-boot:run
```

2. **Verify services are running**:
   - User Service: http://localhost:8081/actuator/health
   - Product Service: http://localhost:8082/actuator/health
   - Store Service: http://localhost:8083/actuator/health
   - Order Service: http://localhost:8084/actuator/health
   - API Gateway: http://localhost:8080/actuator/health

### Option 2: Docker Compose (Recommended)

1. **Build and start all services**:

```bash
cd backend
docker-compose up --build
```

2. **Stop all services**:

```bash
docker-compose down
```

3. **View logs**:

```bash
docker-compose logs -f [service-name]
```

## 📚 API Documentation

Each service provides Swagger UI for interactive API documentation:

- User Service: http://localhost:8081/swagger-ui.html
- Product Service: http://localhost:8082/swagger-ui.html
- Store Service: http://localhost:8083/swagger-ui.html
- Order Service: http://localhost:8084/swagger-ui.html

**OpenAPI JSON specs**:
- User Service: http://localhost:8081/api-docs
- Product Service: http://localhost:8082/api-docs
- Store Service: http://localhost:8083/api-docs
- Order Service: http://localhost:8084/api-docs

### Via API Gateway:
- http://localhost:8080/api-docs/user
- http://localhost:8080/api-docs/product
- http://localhost:8080/api-docs/store
- http://localhost:8080/api-docs/order

## 🔐 Authentication Flow

1. **Register a new user**:
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}
```

2. **Login to get JWT token**:
```bash
POST http://localhost:8080/api/auth/authenticate
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "userId": "ca5f4f63-...",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

3. **Use the token for authenticated requests**:
```bash
GET http://localhost:8080/api/users/{userId}
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

## 🧪 Testing Inter-Service Communication

### Example: Create an Order (Demonstrates all service calls)

1. **Register a user** (User Service)
2. **Create an address** (User Service)
3. **Create a store** (Store Service → validates with User Service)
4. **Create products** (Product Service → validates with Store Service)
5. **Create an order** (Order Service → validates with User, Store, Product services)

```bash
# Step 5: Create Order
POST http://localhost:8080/api/orders
Content-Type: application/json

{
  "userId": "ca5f4f63-...",
  "storeId": "b2a3c4d5-...",
  "addressId": "d3e4f5g6-...",
  "paymentMethod": "COD",
  "items": [
    {
      "productId": "e4f5g6h7-...",
      "quantity": 2,
      "price": 29.99
    }
  ]
}
```

This single API call internally:
- Calls User Service to validate user exists
- Calls User Service to validate address exists
- Calls Store Service to validate store exists
- Calls Product Service to validate each product exists and is in stock
- Applies coupon discount if provided
- Creates order with all items

## 🗄 Database Schema

Each service has its own isolated database (H2 in-memory for development):

- **userdb**: Users, Addresses
- **storedb**: Stores
- **productdb**: Products, Ratings
- **orderdb**: Orders, OrderItems, Coupons

Access H2 consoles (when running locally):
- http://localhost:8081/h2-console (JDBC URL: jdbc:h2:mem:userdb)
- http://localhost:8082/h2-console (JDBC URL: jdbc:h2:mem:productdb)
- http://localhost:8083/h2-console (JDBC URL: jdbc:h2:mem:storedb)
- http://localhost:8084/h2-console (JDBC URL: jdbc:h2:mem:orderdb)

## 🔧 Configuration

### Service URLs (application.properties)

Each service defines URLs for services it communicates with:

**Store Service**:
```properties
user.service.url=http://localhost:8081
```

**Product Service**:
```properties
store.service.url=http://localhost:8083
```

**Order Service**:
```properties
user.service.url=http://localhost:8081
store.service.url=http://localhost:8083
product.service.url=http://localhost:8082
```

### JWT Configuration (User Service)

```properties
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

## 🐳 Docker Deployment

### Build individual service image:
```bash
cd user-service
docker build -t gocart/user-service:latest .
```

### Push to Docker Hub:
```bash
docker tag gocart/user-service:latest yourdockerhub/user-service:latest
docker push yourdockerhub/user-service:latest
```

### Run single service:
```bash
docker run -p 8081:8081 gocart/user-service:latest
```

## ☁️ Cloud Deployment

### AWS ECS Deployment

1. Push Docker images to Amazon ECR
2. Create ECS Task Definitions for each service
3. Create ECS Service with desired count
4. Configure Application Load Balancer for API Gateway
5. Set up service discovery with AWS Cloud Map

### Azure Container Apps Deployment

1. Push Docker images to Azure Container Registry
2. Create Container Apps for each service
3. Configure ingress for API Gateway
4. Set up service-to-service communication
5. Configure Azure Application Insights for monitoring

### Google Cloud Run Deployment

1. Push Docker images to Google Container Registry
2. Deploy each service to Cloud Run
3. Configure Cloud Load Balancing for API Gateway
4. Set up VPC connector for inter-service communication
5. Configure Cloud Monitoring and Logging

## 📊 Monitoring & Observability

### Health Checks
All services expose actuator endpoints:
- `/actuator/health` - Service health status
- `/actuator/info` - Service information
- `/actuator/metrics` - Service metrics

### Logging
Services use Spring Boot default logging with formatted SQL output for debugging.

## 🔒 DevSecOps Integration

### SonarCloud (SAST)
Add to GitHub Actions workflow:
```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Snyk (Vulnerability Scanning)
Add to GitHub Actions workflow:
```yaml
- name: Snyk Security Scan
  uses: snyk/actions/maven@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## 📝 Assignment Requirements Mapping

| Requirement | Implementation |
|------------|----------------|
| 4 Microservices | ✅ User, Store, Product, Order services |
| Inter-service Communication | ✅ OpenFeign REST clients |
| API Gateway | ✅ Spring Cloud Gateway on port 8080 |
| Database per Service | ✅ H2 in-memory, PostgreSQL production-ready |
| Docker Containerization | ✅ Dockerfiles + docker-compose.yml |
| CI/CD Pipeline | ✅ Ready for GitHub Actions |
| OpenAPI Documentation | ✅ Swagger UI on all services |
| Cloud Deployment Ready | ✅ Docker images ready for ECS/Azure/GCP |
| Security | ✅ JWT authentication |
| DevSecOps | ✅ Ready for SonarCloud + Snyk |

## 👥 Contributors

- **Student 1** - User Service
- **Student 2** - Store Service  
- **Student 3** - Product Service
- **Student 4** - Order Service

## 📄 License

This project is created for educational purposes as part of SLIIT SE4010 Cloud Computing Assignment.

## 🆘 Troubleshooting

### Service won't start
- Check if port is already in use: `lsof -i :<port>`
- Verify Java version: `java -version` (should be 17+)
- Check logs for specific errors

### Feign client errors
- Ensure dependent services are running first
- Verify service URLs in application.properties
- Check network connectivity between services

### Database errors
- H2 console credentials: username=sa, password=(empty)
- For PostgreSQL, ensure database exists and credentials are correct
- Check hibernate ddl-auto setting

### Docker issues
- Ensure Docker daemon is running
- Clean up old containers: `docker system prune -a`
- Rebuild images: `docker-compose build --no-cache`

## 📞 Support

For issues and questions, please contact the development team or refer to the comprehensive Swagger documentation available on each service.
