# Create Store API Integration Guide

## Overview
The create-store page is now fully integrated with the Spring Boot backend API.

## Features Implemented

### Frontend (`app/(public)/create-store/page.jsx`)
✅ **Authentication Check** - Redirects to login if user not authenticated
✅ **Store Status Check** - Checks if user already has a store
✅ **Form Validation** - Validates all required fields
✅ **API Integration** - Submits store data to backend
✅ **Status Messages** - Shows appropriate messages based on store status
✅ **Auto-redirect** - Redirects to store dashboard when approved

### Backend Endpoints
✅ `POST /api/stores` - Create new store
✅ `GET /api/stores/my-store` - Get current user's store
✅ `GET /api/stores/user/{userId}` - Get store by user ID
✅ `PATCH /api/stores/{id}/status` - Update store status (admin)
✅ `PATCH /api/stores/{id}/activate` - Activate/deactivate store (admin)

### Store Creation Flow

```
1. User logs in → JWT token stored in localStorage
2. User navigates to /create-store
3. Frontend checks authentication status
4. Frontend calls GET /api/stores/my-store
   - If store exists → Show status message
   - If no store (404) → Show creation form
5. User fills form and submits
6. Frontend validates input
7. Frontend calls POST /api/stores with data
8. Backend creates store with status="pending", isActive=false
9. Frontend shows success message
10. Admin approves store → status="approved", isActive=true
11. User redirected to store dashboard
```

## API Request/Response Examples

### 1. Create Store
**Endpoint:** `POST /api/stores`

**Request Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Awesome Store",
  "username": "my-awesome-store",
  "description": "We sell amazing products",
  "email": "store@example.com",
  "contact": "+1234567890",
  "address": "123 Main St, City, Country",
  "logo": "https://example.com/logo.png"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-here",
  "userId": "user-uuid",
  "name": "My Awesome Store",
  "username": "my-awesome-store",
  "description": "We sell amazing products",
  "email": "store@example.com",
  "contact": "+1234567890",
  "address": "123 Main St, City, Country",
  "logo": "https://example.com/logo.png",
  "status": "pending",
  "isActive": false,
  "createdAt": "2026-02-14T10:30:00",
  "updatedAt": "2026-02-14T10:30:00"
}
```

### 2. Get My Store
**Endpoint:** `GET /api/stores/my-store`

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "id": "uuid-here",
  "userId": "user-uuid",
  "name": "My Awesome Store",
  "username": "my-awesome-store",
  "status": "approved",
  "isActive": true,
  ...
}
```

**Response (404 Not Found):**
```json
{
  "message": "Store not found"
}
```

## Form Validation Rules

### Required Fields (marked with *)
- **Username**: Letters, numbers, hyphens, underscores only
- **Name**: Any text
- **Description**: Any text
- **Email**: Valid email format
- **Contact**: Phone number
- **Address**: Full address

### Optional Fields
- **Logo**: Image URL (defaults to placeholder if empty)

## Store Status States

1. **pending** - Store submitted, awaiting admin review
   - Message: "Your store application is under review..."
   
2. **approved + isActive=true** - Store approved and active
   - Message: "Your store has been approved and is now active!"
   - Auto-redirects to /store dashboard
   
3. **approved + isActive=false** - Store approved but inactive
   - Message: "Your store has been approved but is currently inactive..."
   
4. **rejected** - Store application rejected
   - Message: "Your store application was rejected..."

## Testing the Integration

### Prerequisites
1. PostgreSQL database running on localhost:5432
2. Database named `gocart` created
3. Backend application running on port 8080
4. Frontend application running on port 3000

### Step-by-Step Testing

1. **Start Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   ```

3. **Register/Login**
   - Navigate to http://localhost:3000/auth/register
   - Create an account
   - JWT token will be stored automatically

4. **Create Store**
   - Navigate to http://localhost:3000/create-store
   - Fill in all required fields
   - Submit form
   - Should see success message

5. **Verify in Database**
   ```sql
   SELECT * FROM store;
   ```
   Should show your store with status='pending' and is_active=false

6. **Test Status Check**
   - Refresh the page
   - Should see "under review" message
   - Try to create another store → Should see existing store status

7. **Approve Store (Admin)**
   Using Postman/curl:
   ```bash
   curl -X PATCH 'http://localhost:8080/api/stores/{storeId}/status?status=approved' \
     -H 'Authorization: Bearer <admin-jwt-token>'
   
   curl -X PATCH 'http://localhost:8080/api/stores/{storeId}/activate?isActive=true' \
     -H 'Authorization: Bearer <admin-jwt-token>'
   ```

8. **Verify Redirect**
   - Refresh the create-store page
   - Should see "approved" message
   - Should redirect to /store after 5 seconds

## Environment Configuration

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Backend (application.properties)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/gocart
spring.datasource.username=postgres
spring.datasource.password=password

jwt.secret=9a2f8c4e6b0d71f3e8b9c0a1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3
jwt.expiration=86400000

server.port=8080
```

## Troubleshooting

### Issue: "Please login to create a store"
**Solution:** User not authenticated. Register/login first.

### Issue: "Failed to submit store application"
**Solution:** 
- Check backend is running
- Check database connection
- Check JWT token is valid
- Check all required fields are filled

### Issue: "Username can only contain letters..."
**Solution:** Username contains invalid characters. Use only letters, numbers, hyphens, underscores.

### Issue: 404 Error when creating store
**Solution:** 
- Verify backend URL in .env.local
- Verify backend is running on port 8080
- Check CORS configuration allows localhost:3000

### Issue: Store created but returns 500 error
**Solution:**
- Check database schema is up to date
- Verify all required fields in Store entity
- Check backend logs for detailed error

## Next Steps

### Image Upload Enhancement
Currently, the form accepts image URLs. To implement file upload:

1. Add file upload endpoint to backend:
   ```java
   @PostMapping("/upload")
   public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file)
   ```

2. Integrate cloud storage (AWS S3, Cloudinary, etc.)

3. Update frontend to upload file:
   ```javascript
   const formData = new FormData();
   formData.append('file', imageFile);
   const response = await client.post('/upload', formData);
   storeInfo.logo = response.data.url;
   ```

### Admin Dashboard
Create admin panel to:
- View pending stores
- Approve/reject stores
- Activate/deactivate stores
- View all stores

### Email Notifications
- Send email when store created
- Send email when store approved/rejected
- Send email when store activated/deactivated

## Security Notes

⚠️ **Important Security Considerations:**

1. **JWT Secret**: Change the default JWT secret in production
2. **CORS**: Update CORS origins for production
3. **Validation**: All inputs are validated on backend
4. **Authorization**: Ensure only store owners can access their stores
5. **Admin Endpoints**: Protect admin endpoints with role-based auth

## API Integration Files

### Created/Modified Files
- ✅ `lib/api/storeApi.js` - Store API functions
- ✅ `app/(public)/create-store/page.jsx` - Updated with API integration
- ✅ `backend/src/main/java/com/gocart/backend/controller/StoreController.java` - Added /my-store endpoint
- ✅ `backend/src/main/java/com/gocart/backend/service/AuthenticationService.java` - Updated to use userId in JWT
- ✅ `.env.local` - Environment configuration

## Support

For issues or questions, check:
1. Backend logs in terminal
2. Frontend console in browser
3. Network tab in browser DevTools
4. Database records
