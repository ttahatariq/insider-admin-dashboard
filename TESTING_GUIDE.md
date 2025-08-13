# 🧪 Dashboard Testing Guide

## 🚀 Quick Start

Your dashboard is now running at **http://localhost:3000**

## 🔐 Login Credentials

Use these credentials to log in:

- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: Admin

## 📋 Testing Steps

### 1. **Access the Dashboard**
- Open your browser and go to `http://localhost:3000`
- You should see the login page with a beautiful interface

### 2. **Login Process**
- Enter the credentials above
- Click "Sign In"
- You should be redirected to the dashboard

### 3. **Dashboard Features to Test**

#### **Users Tab** 👥
- View all users in the system
- Search for specific users
- Sort users by different columns
- Block/unblock users
- See user avatars and role badges

#### **Flagged Users Tab** 🚨
- View users flagged for suspicious activity
- See risk levels (High, Medium, Low)
- Unblock flagged users
- View risk factors and notes

#### **Activity Logs Tab** 📊
- Enter a User ID to view logs
- Search through activity logs
- Filter by activity type
- View risk scores and timestamps

### 4. **Test Data**

The system now has:
- 1 Admin user (you)
- Sample activity logs (if any exist)
- Risk assessment system ready

## 🔧 Troubleshooting

### **If you see "Failed to fetch users" error:**
1. Make sure your backend server is running on port 5500
2. Check that you're logged in with a valid token
3. Verify the API endpoints are accessible

### **If the dashboard doesn't load:**
1. Check the browser console for errors
2. Ensure both frontend (port 3000) and backend (port 5500) are running
3. Try refreshing the page

### **If login fails:**
1. Verify the credentials are correct
2. Check that the backend server is running
3. Look for any error messages in the console

## 🌐 API Endpoints

Your backend provides these endpoints:
- `POST /api/users/register` - Create new users
- `POST /api/users/login` - Authenticate users
- `GET /api/users/all-users` - Get all users (Admin only)
- `GET /api/users/flagged-users` - Get flagged users (Admin only)
- `GET /api/users/logs/:userId` - Get user logs (Admin only)
- `POST /api/users/unblock/:userId` - Unblock users (Admin only)

## 📱 Responsive Testing

Test the dashboard on different screen sizes:
- **Desktop**: Full functionality
- **Tablet**: Responsive layout
- **Mobile**: Touch-optimized interface

## 🎯 Expected Behavior

### **Login Success:**
- Redirect to dashboard
- Show user statistics
- Display navigation tabs
- Show logout button

### **Dashboard Features:**
- Clean, modern interface
- Smooth animations
- Professional styling
- Error handling
- Loading states

### **User Management:**
- Search and filter users
- Sort by different columns
- Block/unblock actions
- Visual status indicators

## 🚨 Security Features

- **Authentication Required**: All dashboard features require login
- **Role-Based Access**: Admin role required for all operations
- **Token Management**: JWT tokens for secure authentication
- **Input Validation**: Client and server-side validation

## 📊 Performance

- **Fast Loading**: Optimized React components
- **Smooth Interactions**: CSS transitions and animations
- **Responsive Design**: Works on all devices
- **Error Recovery**: Graceful error handling

---

## 🎉 You're All Set!

Your insider threat detection dashboard is now fully functional with:
- ✅ Modern, professional interface
- ✅ Secure authentication system
- ✅ Comprehensive user management
- ✅ Risk assessment features
- ✅ Activity monitoring
- ✅ Responsive design
- ✅ Error handling

Enjoy your new dashboard! 🚀
