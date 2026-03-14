# Quick Start: Testing Create Store Integration

## 🚀 Start the Applications

### 1. Start PostgreSQL Database
Make sure PostgreSQL is running with a database named `gocart`:
```sql
CREATE DATABASE gocart;
```

### 2. Start Backend (Terminal 1)
```bash
cd backend
mvn spring-boot:run
```
Wait for: `Started GocartBackendApplication`

### 3. Start Frontend (Terminal 2)
```bash
npm run dev
```
Open: http://localhost:3000

## ✅ Test the Flow

### Step 1: Register a New User
1. Go to http://localhost:3000/auth/register
2. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
3. Click Register
4. Should see success message and be logged in

### Step 2: Create Store
1. Go to http://localhost:3000/create-store
2. Fill in the form:
   ```
   Username: my-test-store
   Store Name: My Test Store
   Description: This is a test store for selling products
   Email: mystore@example.com
   Contact: +1234567890
   Address: 123 Main Street, Test City, TC 12345
   Logo URL: (optional - leave blank for default)
   ```
3. Click Submit
4. Should see: "Store application submitted successfully!"
5. Should see: "Your store application is under review..."

### Step 3: Verify in Database
Open PostgreSQL and run:
```sql
SELECT * FROM store;
```
Should see your store with:
- `status` = `pending`
- `is_active` = `false`

### Step 4: Refresh Page
1. Refresh http://localhost:3000/create-store
2. Should still see the "under review" message
3. Should NOT see the form again

### Step 5: Approve Store (Manual - for testing)
Use Postman or curl to approve:

```bash
# Get the store ID from database
# Replace {storeId} with your actual store ID
# Replace {token} with JWT token from localStorage

# Approve the store
curl -X PATCH 'http://localhost:8080/api/stores/{storeId}/status?status=approved' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json'

# Activate the store
curl -X PATCH 'http://localhost:8080/api/stores/{storeId}/activate?isActive=true' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json'
```

**Get JWT Token from Browser:**
1. Open DevTools (F12)
2. Go to Console
3. Type: `localStorage.getItem('token')`
4. Copy the token value

### Step 6: Verify Approval
1. Refresh http://localhost:3000/create-store
2. Should see: "Your store has been approved and is now active!"
3. Should redirect to /store after 5 seconds

## 🧪 Additional Tests

### Test: Try to Create Another Store
1. After creating a store, try to access /create-store again
2. Should see status message, not the form

### Test: Logout and Try to Create Store
1. Logout from the app
2. Go to /create-store
3. Should redirect to login page

### Test: Invalid Username
1. Try username with spaces: `my store`
2. Should see validation error
3. Try special chars: `my@store`
4. Should see validation error

### Test: Missing Required Fields
1. Leave Name empty
2. Try to submit
3. Should see error message

## 📊 Check API Responses

### Using Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Submit the form
4. Look for POST request to `/api/stores`
5. Check:
   - Request payload
   - Response data
   - Status code (200 for success)

## 🐛 Common Issues

### Issue: "Please login to create a store"
- **Cause:** Not logged in
- **Fix:** Register or login first

### Issue: Backend returns 500 error
- **Cause:** Database connection issue
- **Fix:** 
  1. Check PostgreSQL is running
  2. Check database credentials in application.properties
  3. Check database exists

### Issue: "Username already exists"
- **Cause:** Username taken
- **Fix:** Use a different username

### Issue: Page shows form even after submitting
- **Cause:** API error or auth issue
- **Fix:** 
  1. Check browser console for errors
  2. Check backend logs
  3. Verify JWT token exists in localStorage

### Issue: 401 Unauthorized
- **Cause:** Invalid or expired JWT token
- **Fix:** 
  1. Logout and login again
  2. Check token in localStorage
  3. Verify backend JWT secret is consistent

## 📝 Database Queries

### Check all stores
```sql
SELECT id, user_id, username, name, status, is_active, created_at 
FROM store;
```

### Check users
```sql
SELECT id, name, email, role 
FROM _user;
```

### Check store with user info
```sql
SELECT s.*, u.name as user_name, u.email as user_email
FROM store s
JOIN _user u ON s.user_id = u.id;
```

## 🎯 Success Indicators

✅ Backend starts without errors
✅ Frontend compiles successfully
✅ Can register new user
✅ Can login with created user
✅ JWT token stored in localStorage
✅ Can access create-store page
✅ Form validation works
✅ Can submit store application
✅ Store created in database with pending status
✅ Status message shows after creation
✅ Cannot create duplicate store
✅ Approval/activation works

## 📞 Need Help?

Check these resources:
1. Backend logs in Terminal 1
2. Frontend console in Browser DevTools
3. Network tab for API requests/responses
4. CREATE_STORE_INTEGRATION.md for detailed docs
5. Backend README.md for API documentation
