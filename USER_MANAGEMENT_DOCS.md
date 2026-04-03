# User Management & Role-Based Access Control

## 🔐 Security Implementation

Only **super admins** can create, update, or delete users in the system. This prevents unauthorized user creation and maintains system security.

---

## Role Hierarchy

Three roles have been implemented with distinct permissions:

| Role | Permissions |
|------|-------------|
| **Super Admin** | • Create/Update/Delete users<br>• Assign roles to users<br>• Access User Management page<br>• Full access to all features |
| **Admin** | • Access all features<br>• Create/manage tasks<br>• View activity logs<br>• Cannot create/manage users |
| **User** | • Create/manage own tasks<br>• View assigned tasks<br>• Participate in chat<br>• View activity logs<br>• Cannot manage users |

---

## Backend API Endpoints

### Authentication & User Management

**Base URL**: `/api/users`

#### 1. Get All Users
```http
GET /api/users
Authorization: Bearer {token}
```

**Response (200)**:
```json
[
  {
    "id": 1,
    "username": "aaffeef.devstudioco@gmail.com",
    "email": "aaffeef.devstudioco@gmail.com",
    "role": "superadmin",
    "profilePicture": null
  }
]
```

---

#### 2. Get Single User
```http
GET /api/users/{id}
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "id": 1,
  "username": "aaffeef.devstudioco@gmail.com",
  "email": "aaffeef.devstudioco@gmail.com",
  "role": "superadmin",
  "profilePicture": null
}
```

---

#### 3. Create New User (SUPERADMIN ONLY)
```http
POST /api/users
Authorization: Bearer {superadmin_token}
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "user"
}
```

**Response (201)**:
```json
{
  "id": 2,
  "username": "john.doe",
  "email": "john@example.com",
  "role": "user",
  "message": "User created successfully"
}
```

**Error Cases**:
- `400` - Missing required fields or invalid role
- `409` - Username or email already exists
- `403` - Only superadmin can create users

---

#### 4. Update User (SUPERADMIN ONLY)
```http
PUT /api/users/{id}
Authorization: Bearer {superadmin_token}
Content-Type: application/json

{
  "username": "new.username",
  "email": "newemail@example.com",
  "role": "admin",
  "profilePicture": "https://example.com/pic.jpg"
}
```

**Response (200)**:
```json
{
  "id": 2,
  "username": "new.username",
  "email": "newemail@example.com",
  "role": "admin",
  "profilePicture": "https://example.com/pic.jpg",
  "message": "User updated successfully"
}
```

**Error Cases**:
- `404` - User not found
- `409` - New username/email already used by another user
- `403` - Only superadmin can update users

---

#### 5. Delete User (SUPERADMIN ONLY)
```http
DELETE /api/users/{id}
Authorization: Bearer {superadmin_token}
```

**Response (200)**:
```json
{
  "message": "User deleted successfully",
  "deletedUserId": "2"
}
```

**Error Cases**:
- `400` - Cannot delete your own account
- `404` - User not found
- `403` - Only superadmin can delete users

---

## Frontend User Management Page

**Route**: `/users`

### Features

✅ **User List**: Displays all users with their roles
✅ **Create User**: Modal form to add new users (superadmin only)
✅ **Edit User**: Update user details and roles (superadmin only)
✅ **Delete User**: Remove users from system (superadmin only)
✅ **Role Management**: Assign roles (superadmin, admin, user)
✅ **Access Control**: Non-superadmins see access denied message

### User Interface

#### User List View
- Table with Username, Email, Role columns
- Action buttons (Edit, Delete) for each user
- Color-coded role badges:
  - Purple: Super Admin
  - Blue: Admin
  - Green: User

#### Create/Edit Modal
- **Create mode**:
  - Username input
  - Email input
  - Password input (required for new users)
  - Role selector dropdown
  
- **Edit mode**:
  - Username field
  - Email field
  - Role selector
  - Password field hidden (use separate admin password change feature if needed)

### Usage Workflow

**To Create a New User**:
1. Click "Create User" button (top right)
2. Fill in Username, Email, Password
3. Select Role from dropdown
4. Click "Create User"
5. New user appears in list immediately

**To Edit User**:
1. Click Edit icon (pencil) on user row
2. Update username, email, or role
3. Click "Update User"
4. Changes saved immediately

**To Delete User**:
1. Click Delete icon (trash) on user row
2. Confirm deletion in popup
3. User removed from list and database

---

## Authorization Middleware

### Implementation

The `requireRole` middleware ensures only authorized users can access specific endpoints:

```typescript
export const requireRole = (...roles: ('superadmin' | 'admin' | 'user')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient role' });
      return;
    }
    next();
  };
};
```

### Usage in Routes

```typescript
// Only superadmin can create users
router.post('/', authenticate, requireRole('superadmin'), async (req, res) => {
  // Create user logic
});

// Only superadmin can update users
router.put('/:id', authenticate, requireRole('superadmin'), async (req, res) => {
  // Update user logic
});

// Only superadmin can delete users
router.delete('/:id', authenticate, requireRole('superadmin'), async (req, res) => {
  // Delete user logic
});

// Any authenticated user can view users
router.get('/', authenticate, async (req, res) => {
  // Get users logic
});
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role role NOT NULL DEFAULT 'user',
  reporting_manager_id INTEGER REFERENCES users(id),
  profile_picture TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Role enum
CREATE TYPE role AS ENUM ('superadmin', 'admin', 'user');
```

---

## Error Handling

### Common Error Responses

**401 - Unauthorized (Invalid/Missing Token)**:
```json
{ "error": "Unauthorized: No token provided" }
```

**403 - Forbidden (Insufficient Role)**:
```json
{ "error": "Forbidden: Insufficient role" }
```

**400 - Bad Request (Validation Error)**:
```json
{ "error": "Username, email, and password are required" }
```

**409 - Conflict (Duplicate)**:
```json
{ "error": "Username already exists" }
```

**500 - Server Error**:
```json
{
  "error": "Failed to create user",
  "details": "error message"
}
```

---

## Integration with Existing Features

### Activity Logging
User creation, updates, and deletions are now tracked in the system and appear in the Activity Log with:
- User who performed the action
- Action type (created, updated, deleted)
- Timestamp
- Affected user details

### Dashboard
Dashboard does not show user management controls (intentionally restricted to superadmin page)

### Tasks
Tasks can be assigned to specific users from the user list. When creating/editing tasks:
1. Click user assignment dropdown
2. Select from populated user list
3. Task assigned to selected user

---

## Default Superadmin Account

**Email**: `superadmin@123`  
**Password**: `admin@123`  
**Role**: `superadmin`

This account is automatically seeded to the database and has full access to user management.

---

## Best Practices

✅ **Always** use strong passwords when creating user accounts  
✅ **Regularly** audit user roles and access permissions  
✅ **Never** share superadmin credentials  
✅ **Verify** email addresses before user creation  
✅ **Document** reason when deleting users (add note in ActivityLog)  
✅ **Monitor** user activity in Activity Log for suspicious behavior  

❌ **Never** create multiple superadmin accounts unnecessarily  
❌ **Don't** grant admin role to unverified users  
❌ **Avoid** sharing user credentials via email or chat  
❌ **Don't** delete active users without backup/migration plan  

---

## File Structure

```
Task-Manager-DS/
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   └── users.ts          [NEW] - User management endpoints
│   │   ├── middleware/
│   │   │   └── auth.ts           [UPDATED] - Added requireRole middleware
│   │   ├── db/
│   │   │   └── schema.ts         [EXISTING] - Role enum already defined
│   │   └── index.ts              [UPDATED] - Registered /api/users route
│   └── package.json              [EXISTING]
├── src/
│   ├── pages/
│   │   └── Users.jsx             [NEW] - User management UI page
│   ├── components/
│   │   └── Layout.jsx            [UPDATED] - Added Users nav item for superadmin
│   └── App.jsx                   [UPDATED] - Added /users route
└── USER_MANAGEMENT_DOCS.md       [THIS FILE]
```

---

## Testing User Management

### Test Scenario 1: Create User as Superadmin
1. Login with superadmin account
2. Navigate to "User Management" page
3. Click "Create User" button
4. Fill in form: `testuser`, `test@example.com`, `TestPass123!`, role: `user`
5. Click "Create User"
6. **Expected**: User created and appears in list

### Test Scenario 2: Non-Superadmin Access
1. Create a regular user (via superadmin)
2. Login with regular user account
3. Try to access `/users` page directly
4. **Expected**: Access Denied message displayed

### Test Scenario 3: Update User Role
1. Login as superadmin
2. Go to User Management
3. Click Edit on any user
4. Change role to `admin`
5. Click "Update User"
6. **Expected**: User role changes in list and database

### Test Scenario 4: Delete User
1. Login as superadmin
2. Go to User Management
3. Click Delete on any user
4. Confirm deletion
5. **Expected**: User removed from list and database

---

## API Testing with cURL

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "Password123!",
    "role": "user"
  }'
```

### Update User Role
```bash
curl -X PUT http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN"
```

---

## Summary

✅ **Role-based access control** implemented  
✅ **Only superadmin** can create/update/delete users  
✅ **User management UI** for superadmin portal  
✅ **Comprehensive error handling** for all scenarios  
✅ **Database schema** supports role hierarchy  
✅ **Default superadmin account** seeded and ready  
✅ **Security best practices** enforced throughout  

**The system now prevents unauthorized user creation and maintains proper access control!**
