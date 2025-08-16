# MovieFlix - Full Stack Movie App

A Netflix-inspired movie streaming application built with React.js frontend and Express.js backend, featuring user authentication and a beautiful modern UI.

### Live Link - [MovieFlix](https://moviee-flixx.netlify.app/)

## 🚀 Tech Stack

**Frontend:**
- React.js 19+ with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Context API for state management

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

## 📸 Features

- 🎬 Beautiful landing page
- 🔐 User authentication (Sign up, Sign in, Guest mode)
- 📱 Responsive design
- 🎯 Protected routes
- 🚀 Modern UI/UX with smooth transitions
- 👤 Guest user functionality for easy testing

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Atlas)
- npm

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Movie-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Update .env with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/movieflix
# JWT_SECRET=your-super-secret-jwt-key-change-in-production
# PORT=3000

# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Database Setup

MongoDB:
- **MongoDB Atlas**: Update the connection string in `.env`

## 🚦 Running the Application

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health Check: http://localhost:3000/api/health

## 🎮 Demo Credentials

For quick testing, you can use:

**Option 1: Guest Login**
- Click "Continue as Guest" on the sign-in page

**Option 2: Demo Account**
- Email: `guest@movieflix.com`
- Password: `guest123`

## 🛡️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/guest` - Guest login
- `GET /api/health` - Health check

## 🎨 UI Components

### Pages
- **Landing Page**: Hero section with features and FAQ
- **Sign In**: User authentication with guest option
- **Sign Up**: User registration with validation
- **Dashboard**: Protected user dashboard with movie grid
- **Movies (Search)**: Protected Movie search page with multiple options
- **Statistics**: Protected Analytics page for recently searched items
- **Favorites**: Protected User specific favorites list page

### Features
- Responsive design for mobile/desktop
- Loading states and error handling
- Form validation
- Beautiful gradients and animations
- Netflix-inspired color scheme

## 🚀 Deployment

### Backend Deployment
1. MOngoDB
2. Render

### Frontend Deployment
1. Netlify

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/movieflix
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **CORS Issues**
   - Backend allows `http://localhost:5173` by default
   - Update CORS settings if using different ports

3. **JWT Token Issues**
   - Clear localStorage and try again
   - Check JWT_SECRET in backend `.env`

4. **Build Issues**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

## 🌟 Future Enhancements

- Movie database integration (TMDB API)
- Video streaming functionality
- User profiles and preferences
- Watchlist and favorites
- Movie recommendations
- Advanced search and filtering
- Payment integration
- Admin dashboard
- Movie reviews and ratings
