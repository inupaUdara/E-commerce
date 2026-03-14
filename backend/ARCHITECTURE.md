# GoCart Microservices Architecture

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                          │
│                      http://localhost:3000                        │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 │ HTTP/REST
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                     API Gateway (Port 8080)                       │
│                   Spring Cloud Gateway                            │
│  - Routing to microservices                                       │
│  - CORS configuration                                             │
│  - Load balancing                                                 │
└─────┬──────────┬──────────┬──────────┬──────────────────────────┘
      │          │          │          │
      │          │          │          │
┌─────▼──────┐ ┌▼──────────┐ ┌────────▼─┐ ┌────────────────▼──────┐
│   User     │ │  Store    │ │ Product  │ │      Order            │
│  Service   │ │  Service  │ │ Service  │ │     Service           │
│ (Port 8081)│ │(Port 8083)│ │(Port 8082)│ │   (Port 8084)         │
└─────┬──────┘ └─────┬─────┘ └────┬─────┘ └──┬──────────┬─────────┘
      │              │             │           │          │
┌─────▼──────┐ ┌─────▼─────┐ ┌────▼─────┐ ┌──▼──────────▼─────────┐
│   H2 DB    │ │  H2 DB    │ │  H2 DB   │ │      H2 DB            │
│  userdb    │ │  storedb  │ │productdb │ │     orderdb           │
└────────────┘ └───────────┘ └──────────┘ └───────────────────────┘
```

## Inter-Service Communication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     Inter-Service Communication                   │
│                      (Spring Cloud OpenFeign)                     │
└──────────────────────────────────────────────────────────────────┘

1. Store → User Service
   ┌─────────────┐  Feign Client   ┌─────────────┐
   │   Store     │───────────────────▶│    User     │
   │  Service    │  Validate User    │   Service   │
   └─────────────┘  Exists           └─────────────┘

2. Product → Store Service
   ┌─────────────┐  Feign Client   ┌─────────────┐
   │  Product    │───────────────────▶│   Store     │
   │  Service    │  Validate Store   │   Service   │
   └─────────────┘  Exists           └─────────────┘

3. Order → User, Store, Product Services
   ┌─────────────┐                   ┌─────────────┐
   │   Order     │  Validate User    │    User     │
   │  Service    │───────────────────▶│   Service   │
   │             │  & Address        └─────────────┘
   │             │
   │             │  Validate Store   ┌─────────────┐
   │             │───────────────────▶│   Store     │
   │             │                   │   Service   │
   │             │                   └─────────────┘
   │             │
   │             │  Validate         ┌─────────────┐
   │             │  Products &       │  Product    │
   │             │───────Stock───────▶│   Service   │
   └─────────────┘                   └─────────────┘
```

## Service Responsibilities

### 1. User Service (8081)
**Domain**: User Management & Authentication

**Responsibilities**:
- User registration and authentication
- JWT token generation and validation
- User profile management
- Address management
- Role-based access control

**Database Tables**:
- users (id, name, email, password, role, cart, store_id)
- addresses (id, name, email, street, city, state, zip, country, phone, user_id)

**Dependencies**: None (Base service)

**Exposed to**:
- Store Service (user validation)
- Order Service (user & address validation)

---

### 2. Store Service (8083)
**Domain**: Store/Vendor Management

**Responsibilities**:
- Store registration
- Store profile management
- Store approval workflow
- Store status tracking

**Database Tables**:
- stores (id, name, address, city, state, zip, phone, logo_url, cover_image_url, user_id, is_active, status)

**Dependencies**:
- User Service (validates user exists before creating store)

**Exposed to**:
- Product Service (store validation)
- Order Service (store validation)

**Feign Clients**:
- UserServiceClient → `GET /api/users/{id}`

---

### 3. Product Service (8082)
**Domain**: Product Catalog & Ratings

**Responsibilities**:
- Product CRUD operations
- Product categorization
- Stock management
- Product search and filtering
- Product ratings and reviews

**Database Tables**:
- products (id, name, description, mrp, price, images, category, in_stock, store_id)
- ratings (id, rating, comment, user_id, product_id)

**Dependencies**:
- Store Service (validates store exists before adding products)

**Exposed to**:
- Order Service (product & stock validation)

**Feign Clients**:
- StoreServiceClient → `GET /api/stores/{id}`

---

### 4. Order Service (8084)
**Domain**: Order Processing & Payment

**Responsibilities**:
- Order creation and management
- Order status tracking (ORDER_PLACED, PROCESSING, SHIPPED, DELIVERED)
- Payment method handling (COD, STRIPE)
- Coupon/discount management
- Order history

**Database Tables**:
- orders (id, total, status, user_id, store_id, address_id, is_paid, payment_method, coupon, is_coupon_used)
- order_items (order_id, product_id, quantity, price)
- coupons (code, description, discount, for_new_user, for_member, is_public, expires_at)

**Dependencies**:
- User Service (validates user and address)
- Store Service (validates store)
- Product Service (validates products and checks stock)

**Exposed to**: Frontend via API Gateway

**Feign Clients**:
- UserServiceClient → `GET /api/users/{id}`, `GET /api/addresses/{id}`
- StoreServiceClient → `GET /api/stores/{id}`
- ProductServiceClient → `GET /api/products/{id}`

---

### 5. API Gateway (8080)
**Domain**: Routing & Gateway

**Responsibilities**:
- Single entry point for all client requests
- Route requests to appropriate microservices
- CORS configuration
- Load balancing
- API documentation aggregation

**Routes**:
- `/api/auth/**` → User Service
- `/api/users/**` → User Service
- `/api/addresses/**` → User Service
- `/api/stores/**` → Store Service
- `/api/products/**` → Product Service
- `/api/ratings/**` → Product Service
- `/api/orders/**` → Order Service
- `/api/coupons/**` → Order Service

**Dependencies**: All microservices

---

## Request Flow Example: Create Order

```
1. Client Request
   POST http://localhost:8080/api/orders
   {
     "userId": "user-123",
     "storeId": "store-456",
     "addressId": "addr-789",
     "items": [{"productId": "prod-111", "quantity": 2, "price": 29.99}],
     "couponCode": "SAVE10"
   }

2. API Gateway → Order Service
   POST http://localhost:8084/api/orders

3. Order Service → User Service (Validate User)
   GET http://localhost:8081/api/users/user-123
   ✓ User exists

4. Order Service → User Service (Validate Address)
   GET http://localhost:8081/api/addresses/addr-789
   ✓ Address exists and belongs to user

5. Order Service → Store Service (Validate Store)
   GET http://localhost:8083/api/stores/store-456
   ✓ Store exists and is active

6. Order Service → Product Service (Validate Product)
   GET http://localhost:8082/api/products/prod-111
   ✓ Product exists and is in stock

7. Order Service processes:
   - Calculate subtotal: 2 × $29.99 = $59.98
   - Apply coupon: 10% off = $5.998
   - Total: $53.98
   - Create order with status: ORDER_PLACED
   - Create order items

8. Response to Client
   {
     "id": "order-999",
     "total": 53.98,
     "status": "ORDER_PLACED",
     "userId": "user-123",
     "storeId": "store-456",
     ...
   }
```

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Spring Boot | 3.3.6 |
| Language | Java | 17 |
| Service Communication | Spring Cloud OpenFeign | 2023.0.0 |
| API Gateway | Spring Cloud Gateway | 2023.0.0 |
| Security | Spring Security + JWT | 3.3.6 |
| Database (Dev) | H2 In-Memory | Latest |
| Database (Prod) | PostgreSQL | Ready |
| API Docs | SpringDoc OpenAPI | 2.3.0 |
| Build Tool | Maven | 3.9+ |
| Container | Docker | Latest |
| Orchestration | Docker Compose | Latest |

## Database Schema Per Service

### User Service Database (userdb)
```sql
users
├── id (VARCHAR PRIMARY KEY)
├── name (VARCHAR)
├── email (VARCHAR UNIQUE)
├── password (VARCHAR)
├── role (VARCHAR)
├── cart (TEXT/JSON)
└── store_id (VARCHAR)

addresses
├── id (VARCHAR PRIMARY KEY)
├── name (VARCHAR)
├── email (VARCHAR)
├── street (VARCHAR)
├── city (VARCHAR)
├── state (VARCHAR)
├── zip (VARCHAR)
├── country (VARCHAR)
├── phone (VARCHAR)
└── user_id (VARCHAR FK → users.id)
```

### Store Service Database (storedb)
```sql
stores
├── id (VARCHAR PRIMARY KEY)
├── name (VARCHAR)
├── address (VARCHAR)
├── city (VARCHAR)
├── state (VARCHAR)
├── zip (VARCHAR)
├── phone (VARCHAR)
├── logo_url (VARCHAR)
├── cover_image_url (VARCHAR)
├── user_id (VARCHAR) -- Reference only, no FK
├── is_active (BOOLEAN)
├── status (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Product Service Database (productdb)
```sql
products
├── id (VARCHAR PRIMARY KEY)
├── name (VARCHAR)
├── description (TEXT)
├── mrp (DECIMAL)
├── price (DECIMAL)
├── images (TEXT/JSON)
├── category (VARCHAR)
├── in_stock (BOOLEAN)
├── store_id (VARCHAR) -- Reference only
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

ratings
├── id (VARCHAR PRIMARY KEY)
├── rating (INTEGER)
├── comment (TEXT)
├── user_id (VARCHAR) -- Reference only
├── product_id (VARCHAR FK → products.id)
└── created_at (TIMESTAMP)
```

### Order Service Database (orderdb)
```sql
orders
├── id (VARCHAR PRIMARY KEY)
├── total (DECIMAL)
├── status (VARCHAR)
├── user_id (VARCHAR) -- Reference only
├── store_id (VARCHAR) -- Reference only
├── address_id (VARCHAR) -- Reference only
├── is_paid (BOOLEAN)
├── payment_method (VARCHAR)
├── coupon (TEXT/JSON)
├── is_coupon_used (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

order_items
├── order_id (VARCHAR FK → orders.id)
├── product_id (VARCHAR) -- Reference only
├── quantity (INTEGER)
├── price (DECIMAL)
└── PRIMARY KEY (order_id, product_id)

coupons
├── code (VARCHAR PRIMARY KEY)
├── description (VARCHAR)
├── discount (DECIMAL)
├── for_new_user (BOOLEAN)
├── for_member (BOOLEAN)
├── is_public (BOOLEAN)
├── expires_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

## Deployment Architecture

### Local Development
```
Docker Compose Network
├── user-service:8081
├── product-service:8082
├── store-service:8083
├── order-service:8084
└── api-gateway:8080
```

### Cloud Deployment (AWS ECS Example)
```
VPC
├── Application Load Balancer (Public)
│   └── Target: API Gateway
├── ECS Cluster
│   ├── User Service Task (Private Subnet)
│   ├── Store Service Task (Private Subnet)
│   ├── Product Service Task (Private Subnet)
│   ├── Order Service Task (Private Subnet)
│   └── API Gateway Task (Public Subnet)
├── RDS PostgreSQL (Private Subnet)
│   ├── userdb
│   ├── storedb
│   ├── productdb
│   └── orderdb
└── CloudWatch Logs & Metrics
```

## Security Considerations

1. **Authentication**: JWT tokens issued by User Service
2 **Authorization**: Role-based access (USER, SELLER, ADMIN)
3. **Service-to-Service**: Internal network communication (no external exposure except gateway)
4. **CORS**: Configured to allow frontend origin
5. **Environment Variables**: Sensitive data in environment variables
6. **Docker Secrets**: Production credentials managed via Docker secrets
7. **HTTPS**: TLS termination at load balancer in production

## Monitoring & Observability

### Health Checks
All services expose: `/actuator/health`

### Metrics
All services expose: `/actuator/metrics`

### Logging
- Structured logging with SLF4J
- Centralized logging with ELK Stack (recommended)

### Distributed Tracing
- Spring Cloud Sleuth integration ready
- Zipkin/Jaeger compatible

## CI/CD Pipeline Flow

```
GitHub Push
    ↓
GitHub Actions Triggered
    ↓
├── Checkout Code
├── Setup Java 17
├── Maven Build
├── Run Unit Tests
├── SonarCloud SAST Scan
├── Snyk Security Scan
├── Build Docker Image
├── Push to Docker Hub/ECR
└── Deploy to Cloud (ECS/AKS/GKE)
    ↓
Service Running in Cloud
```

## Assignment Requirements Checklist

✅ **4 Microservices** - User, Store, Product, Order
✅ **Inter-Service Communication** - OpenFeign REST clients with validation
✅ **API Gateway** - Spring Cloud Gateway routing all requests
✅ **Database Per Service** - Separate H2/PostgreSQL for each service
✅ **Docker Containerization** - Dockerfiles for all services
✅ **Docker Compose** - Local multi-container orchestration
✅ **CI/CD Pipelines** - GitHub Actions with build, test, security scan, deploy
✅ **OpenAPI Documentation** - Swagger UI on all services
✅ **Cloud Deployment Ready** - Docker images compatible with ECS/Azure/GCP
✅ **Security** - JWT authentication & authorization
✅ **DevSecOps** - SonarCloud SAST + Snyk vulnerability scanning
✅ **Actuator** - Health checks and metrics for all services
✅ **CORS** - Configured for frontend integration
✅ **Comprehensive README** - Setup, deployment, and testing instructions

## Performance Considerations

1. **Caching**: Redis can be added for frequently accessed data
2. **Database Optimization**: Connection pooling configured
3. **Asynchronous Communication**: Can migrate to Kafka/RabbitMQ for events
4. **Circuit Breaker**: Resilience4j ready for fault tolerance
5. **Rate Limiting**: Can be added at API Gateway level
6. **Horizontal Scaling**: All services are stateless and scalable

## Future Enhancements

- [ ] Service mesh (Istio) for advanced traffic management
- [ ] Event-driven architecture with Kafka
- [ ] Redis caching layer
- [ ] Elasticsearch for product search
- [ ] Payment gateway integration (Stripe)
- [ ] Email notification service
- [ ] Admin dashboard service
- [ ] Analytics service
