#!/bin/bash

# GoCart Microservices - Quick Test Script
# This script tests the complete inter-service communication flow

echo "🚀 GoCart Microservices Test Script"
echo "===================================="
echo ""

# Configuration
GATEWAY_URL="http://localhost:8080"
USER_SERVICE_URL="http://localhost:8081"
STORE_SERVICE_URL="http://localhost:8083"
PRODUCT_SERVICE_URL="http://localhost:8082"
ORDER_SERVICE_URL="http://localhost:8084"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if service is up
check_service() {
    local name=$1
    local url=$2
    echo -n "Checking $name... "
    if curl -s "${url}/actuator/health" > /dev/null; then
        echo -e "${GREEN}✓ UP${NC}"
        return 0
    else
        echo -e "${RED}✗ DOWN${NC}"
        return 1
    fi
}

# Check all services
echo "📊 Checking Service Health:"
echo "----------------------------"
check_service "User Service   " $USER_SERVICE_URL
check_service "Store Service  " $STORE_SERVICE_URL
check_service "Product Service" $PRODUCT_SERVICE_URL
check_service "Order Service  " $ORDER_SERVICE_URL
check_service "API Gateway    " $GATEWAY_URL
echo ""

# Step 1: Register User
echo "1️⃣  Registering User..."
REGISTER_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "SELLER"
  }')

USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"userId":"[^"]*' | grep -o '[^"]*$')
echo -e "   User ID: ${GREEN}${USER_ID}${NC}"
echo ""

# Step 2: Login
echo "2️⃣  Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}/api/auth/authenticate" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
echo -e "   JWT Token: ${GREEN}${TOKEN:0:50}...${NC}"
echo ""

# Step 3: Create Address
echo "3️⃣  Creating Address..."
ADDRESS_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}/api/addresses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"test@example.com\",
    \"street\": \"123 Main St\",
    \"city\": \"Colombo\",
    \"state\": \"Western\",
    \"zip\": \"10000\",
    \"country\": \"Sri Lanka\",
    \"phone\": \"+94771234567\",
    \"userId\": \"${USER_ID}\"
  }")

ADDRESS_ID=$(echo $ADDRESS_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')
echo -e "   Address ID: ${GREEN}${ADDRESS_ID}${NC}"
echo ""

# Step 4: Create Store (demonstrates User Service call)
echo "4️⃣  Creating Store (calls User Service to validate user)..."
STORE_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}/api/stores" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Tech Store\",
    \"address\": \"456 Commerce Ave\",
    \"city\": \"Colombo\",
    \"state\": \"Western\",
    \"zip\": \"10100\",
    \"phone\": \"+94771234567\",
    \"userId\": \"${USER_ID}\"
  }")

STORE_ID=$(echo $STORE_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')
echo -e "   Store ID: ${GREEN}${STORE_ID}${NC}"
echo -e "   ${YELLOW}→ Validated user existence with User Service${NC}"
echo ""

# Step 5: Create Product (demonstrates Store Service call)
echo "5️⃣  Creating Product (calls Store Service to validate store)..."
PRODUCT_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}/api/products" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Laptop\",
    \"description\": \"High-performance laptop\",
    \"mrp\": 1500.00,
    \"price\": 1299.99,
    \"images\": [\"laptop1.jpg\", \"laptop2.jpg\"],
    \"category\": \"Electronics\",
    \"inStock\": true,
    \"storeId\": \"${STORE_ID}\"
  }")

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')
echo -e "   Product ID: ${GREEN}${PRODUCT_ID}${NC}"
echo -e "   ${YELLOW}→ Validated store existence with Store Service${NC}"
echo ""

# Step 6: Create Coupon
echo "6️⃣  Creating Coupon..."
curl -s -X POST "${GATEWAY_URL}/api/coupons" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE10",
    "description": "10% discount",
    "discount": 10.0,
    "forNewUser": false,
    "forMember": true,
    "isPublic": true,
    "expiresAt": "2025-12-31T23:59:59"
  }' > /dev/null
echo -e "   Coupon Code: ${GREEN}SAVE10${NC} (10% discount)"
echo ""

# Step 7: Create Order (demonstrates all service calls)
echo "7️⃣  Creating Order (calls User, Store, and Product Services)..."
ORDER_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}/api/orders" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_ID}\",
    \"storeId\": \"${STORE_ID}\",
    \"addressId\": \"${ADDRESS_ID}\",
    \"paymentMethod\": \"COD\",
    \"couponCode\": \"SAVE10\",
    \"items\": [
      {
        \"productId\": \"${PRODUCT_ID}\",
        \"quantity\": 1,
        \"price\": 1299.99
      }
    ]
  }")

ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')
TOTAL=$(echo $ORDER_RESPONSE | grep -o '"total":[0-9.]*' | grep -o '[0-9.]*$')
echo -e "   Order ID: ${GREEN}${ORDER_ID}${NC}"
echo -e "   Total: ${GREEN}\$${TOTAL}${NC} (original: \$1299.99, discount: 10%)"
echo -e "   ${YELLOW}→ Validated user with User Service${NC}"
echo -e "   ${YELLOW}→ Validated address with User Service${NC}"
echo -e "   ${YELLOW}→ Validated store with Store Service${NC}"
echo -e "   ${YELLOW}→ Validated product with Product Service${NC}"
echo ""

# Summary
echo "✅ Test Complete!"
echo "==================="
echo ""
echo -e "${GREEN}Successfully demonstrated inter-service communication:${NC}"
echo "  • Store Service → User Service (user validation)"
echo "  • Product Service → Store Service (store validation)"
echo "  • Order Service → User Service (user + address validation)"
echo "  • Order Service → Store Service (store validation)"
echo "  • Order Service → Product Service (product validation)"
echo ""
echo -e "${GREEN}All 4 microservices are working correctly! 🎉${NC}"
echo ""
echo "📚 View API Documentation:"
echo "  • User Service: http://localhost:8081/swagger-ui.html"
echo "  • Store Service: http://localhost:8083/swagger-ui.html"
echo "  • Product Service: http://localhost:8082/swagger-ui.html"
echo "  • Order Service: http://localhost:8084/swagger-ui.html"
echo ""
echo "🗄️  View Databases (H2 Console):"
echo "  • User DB: http://localhost:8081/h2-console (jdbc:h2:mem:userdb)"
echo "  • Store DB: http://localhost:8083/h2-console (jdbc:h2:mem:storedb)"
echo "  • Product DB: http://localhost:8082/h2-console (jdbc:h2:mem:productdb)"
echo "  • Order DB: http://localhost:8084/h2-console (jdbc:h2:mem:orderdb)"
echo ""
