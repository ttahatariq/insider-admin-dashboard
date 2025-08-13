# Insider Threat Detection Admin Dashboard

A modern, responsive admin dashboard for monitoring and managing insider threat detection systems. Built with React and featuring a clean, professional interface.

## ✨ Features

### 🎯 **Modern Dashboard Interface**
- **Tabbed Navigation**: Clean separation between Users, Flagged Users, and Activity Logs
- **Statistics Overview**: Real-time dashboard statistics with visual indicators
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Professional Styling**: Modern gradient backgrounds and glass-morphism effects

### 👥 **User Management**
- **User Table**: Comprehensive user listing with search and sort functionality
- **User Actions**: Block/unblock users with real-time status updates
- **User Avatars**: Visual user representation with initials
- **Role Management**: Clear role identification with color-coded badges
- **Status Tracking**: Active/blocked user status with visual indicators

### 🚨 **Flagged Users Management**
- **Risk Assessment**: Automatic risk level calculation based on activity patterns
- **Visual Risk Indicators**: Color-coded risk levels (High, Medium, Low)
- **Risk Details**: Comprehensive view of risk factors and notes
- **Quick Actions**: One-click user unblocking with processing states
- **Empty States**: Helpful messaging when no users are flagged

### 📊 **Activity Logs Viewer**
- **User-Specific Logs**: View detailed activity logs for any user
- **Advanced Filtering**: Filter by activity type and risk level
- **Search Functionality**: Search through logs by action or IP address
- **Risk Scoring**: Visual risk assessment for each activity
- **Action Icons**: Intuitive icons for different types of activities
- **Detailed Information**: IP addresses, timestamps, user agents, and more

### 🔐 **Enhanced Security**
- **Modern Login**: Professional login interface with error handling
- **Form Validation**: Client-side validation for better user experience
- **Loading States**: Visual feedback during authentication
- **Error Handling**: Comprehensive error messages and recovery options

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd insider-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── UserTable.js          # User management component
│   ├── FlaggedUsers.js       # Flagged users management
│   ├── LogsViewer.js         # Activity logs viewer
│   └── [Component].css       # Component-specific styles
├── pages/
│   ├── Dashboard.js          # Main dashboard with tabs
│   ├── Login.js              # Authentication interface
│   └── [Page].css            # Page-specific styles
├── api.js                    # API configuration
└── App.js                    # Main application component
```

### Key Features Implementation

#### **Error Handling**
- Comprehensive try-catch blocks for all API calls
- User-friendly error messages with recovery options
- Loading states to prevent multiple submissions

#### **Responsive Design**
- Mobile-first approach with breakpoints at 768px and 480px
- Flexible grid layouts that adapt to screen sizes
- Touch-friendly interface elements

#### **Performance Optimizations**
- Efficient state management with React hooks
- Optimized re-renders with proper dependency arrays
- Lazy loading of components when possible

## 🎨 Design System

### Color Palette
- **Primary**: Gradient from #667eea to #764ba2
- **Success**: #68d391 to #48bb78
- **Warning**: #f6ad55
- **Danger**: #fc8181
- **Info**: #63b3ed

### Typography
- **Font Family**: System fonts with fallbacks
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Line Heights**: Optimized for readability

### Spacing
- **Base Unit**: 0.25rem (4px)
- **Consistent Scale**: 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem

## 🔧 Configuration

### API Configuration
The dashboard connects to your backend API. Update the base URL in `src/api.js`:

```javascript
const API = axios.create({
  baseURL: "http://your-api-url/api/users",
});
```

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://your-api-url
REACT_APP_DASHBOARD_TITLE=Your Dashboard Title
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📦 Dependencies

- **React 18.2.0**: Modern React with hooks
- **Axios 1.6.2**: HTTP client for API calls
- **React Scripts 5.0.1**: Create React App scripts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Built with ❤️ for security professionals**
