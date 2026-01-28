# Event Management System

A full-stack Event Management application built with the MERN stack (MongoDB, Express, React, Node.js) and Vite.

##  Features
- **Authentication**: JWT-based login and registration.
- **Event Management**: Create, view, update, and delete events.
- **Bookings**: Users can book tickets for events.
- **Responsive UI**: Built with React and Tailwind CSS.

## Project Structure
- `/backend`: Express.js server, MongoDB models, and API routes.
- `/frontend`: React + Vite application with Tailwind CSS.

---

## Local Development

### Prerequisites
- Node.js installed.
- MongoDB Atlas account or local MongoDB instance.

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---
