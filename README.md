# A Restaurant Website

A full-stack restaurant website built with the MERN stack (MongoDB, Express, React, Node.js) with TypeScript and TailwindCSS. The site allows users to view menu items, leave reviews with ratings, and includes admin functionality to manage products and content.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Menu Display**: Browse restaurant menu with categorized items
- **Rating System**: Add ratings and reviews to menu items
- **Commenting System**: Reply to reviews
- **Admin Dashboard**: Manage menu items, reviews, and users
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Switch between dark and light themes

## Tech Stack

### Frontend

- React with TypeScript
- React Router for navigation
- TailwindCSS for styling
- Context API for state management
- Axios for API calls

### Backend

- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Bcrypt for password encryption
- Nodemailer for email functionality
- Cloudinary for image storage

## Setup Instructions

### Prerequisites

- Node.js (v14 or newer)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Google Developer account (for Google Sign-In)

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=8000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173

# For email service
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email_address

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/tastehub.git
cd tastehub
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

4. Start the development servers

Backend:

```bash
cd backend
npm start
```

Frontend:

```bash
cd frontend
npm run dev
```

The frontend should be running on http://localhost:5173 and the backend on http://localhost:8000.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:token` - Reset password

### Products (Menu Items)

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Ratings and Reviews

- `POST /api/products/:id/ratings` - Add rating to product
- `PUT /api/ratings/:id` - Update rating
- `DELETE /api/ratings/:id` - Delete rating
- `POST /api/ratings/:id/replies` - Add reply to rating
- `PUT /api/replies/:id` - Update reply
- `DELETE /api/replies/:id` - Delete reply

## Deployment

The project is set up to be deployed to Vercel for both frontend and backend.

## License

MIT
