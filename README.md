# 🎬 Movie Review & Rating Website

[![Node.js](https://img.shields.io/badge/Node.js-v18.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![TMDB API](https://img.shields.io/badge/TMDB-API_v3-01b4e4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

A full-stack web application designed for movie enthusiasts to explore trending movies, search for titles, submit ratings and reviews, manage personal watchlists, and customize their viewing experience with light and dark mode themes.

Powered by **Node.js**, **Express**, **MongoDB**, and **TMDB (The Movie Database) API**, featuring a modern, responsive client-side interface built with Vanilla JavaScript and CSS variables.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Directory Structure](#-architecture--directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Documentation](#-api-documentation)
  - [Authentication Routes](#authentication-routes)
  - [Movie Routes](#movie-routes)
  - [Review Routes](#review-routes)
  - [Favorite Routes](#favorite-routes)
- [Frontend Overview](#-frontend-overview)
- [License](#-license)

---

## ✨ Features

### 🔐 User Authentication & Authorization
- **Secure Authentication**: User registration and login utilizing JSON Web Tokens (JWT) and `bcryptjs` password hashing.
- **Session Persistence**: JWT token stored client-side for seamless authenticated requests.
- **Protected Action Scoping**: Unauthenticated users can explore movies, while rating, reviewing, and bookmarking require login.

### 🎥 Movie Discovery & Search
- **TMDB API Integration**: Fetches real-time popular movies, details, cast, backdrops, and genres from TMDB.
- **Live Search**: Instant keyword search for any movie title.
- **Dynamic Pagination**: Sliding-window pagination allowing seamless navigation through up to 500 pages of movie data.
- **Detailed Movie Pages**: View rich movie details including release dates, runtime, plot summaries, genres, and community ratings.

### ⭐ Ratings & Review System
- **Community Reviews**: Read user-submitted ratings and reviews for individual movies.
- **User Ratings**: 1-to-5 star rating system with detailed text reviews.
- **Review Management**: Edit or delete your own reviews from the movie page or user profile.
- **Single Review Constraint**: Ensures one review per user per movie to keep rating data authentic.

### ❤️ Personal Favorites & Watchlist
- **Bookmarking**: One-click add/remove movies to your personal Favorites.
- **Watchlist Dashboard**: Access and manage saved movies directly from the User Profile page.

### 🎨 UI/UX & Dark Mode
- **Glassmorphism Design**: Modern, responsive user interface styled with pure CSS.
- **Dark/Light Mode**: Smooth theme switcher with dynamic CSS custom properties.
- **Toast Notifications**: Interactive toast alerts for instant feedback on user actions.

---

## 🛠️ Tech Stack

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js v5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ORM](https://mongoosejs.com/)
- **Authentication**: [JSON Web Token (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken) & [Bcrypt.js](https://github.com/dperroni/bcrypt.js)
- **HTTP Client**: [Axios](https://axios-http.com/) with [Axios Retry](https://github.com/softonic/axios-retry) for resilient API calls
- **Environment Management**: [dotenv](https://github.com/motdotla/dotenv)

### **Frontend**
- **Structure**: HTML5 Semantic Markup
- **Styling**: Vanilla CSS3 (CSS Variables, Flexbox, CSS Grid, Glassmorphism effects)
- **Logic**: Vanilla JavaScript (ES6 Modules, Fetch API, LocalStorage state)

---

## 📁 Architecture & Directory Structure

```
movie_review_rating_website/
├── docs/                      # Client-Side Frontend (Static Web Pages & Assets)
│   ├── css/                   # Stylesheets & Visual Themes
│   │   ├── style.css          # Main Design System & Global Styles
│   │   ├── movie.css          # Movie Details Page Styling
│   │   └── profile.css        # User Profile Dashboard Styling
│   ├── js/                    # Client-Side JavaScript Logic
│   │   ├── app.js             # Movie Grid & Pagination Handler
│   │   ├── auth.js            # Authentication Session Utilities
│   │   ├── common.js          # Theme Toggle & Toast Notification System
│   │   ├── login.js           # User Login Logic
│   │   ├── movie.js           # Movie Detail View & Review Actions
│   │   ├── profile.js         # User Profile & Favorites Manager
│   │   └── register.js        # User Registration Logic
│   ├── index.html             # Home & Popular Movies View
│   ├── login.html             # User Sign In Page
│   ├── movie.html             # Movie Detail & Reviews Page
│   ├── profile.html           # User Profile Dashboard
│   └── register.html          # User Sign Up Page
├── server/                    # Server-Side REST API (Express & Node.js)
│   ├── config/                # Database Configuration
│   │   └── db.js              # MongoDB Mongoose Connection Setup
│   ├── controllers/           # Business Logic Handlers
│   │   ├── authController.js     # User Auth (Register / Login)
│   │   ├── favoriteController.js # Favorites CRUD Operations
│   │   ├── movieController.js    # TMDB Proxy Endpoints
│   │   └── reviewController.js   # User Reviews CRUD Operations
│   ├── middleware/            # Custom Middleware
│   │   └── authMiddleware.js  # JWT Bearer Token Verification
│   ├── models/                # Database Models (Mongoose Schemas)
│   │   ├── Favorite.js        # Favorite Movie Schema
│   │   ├── Review.js          # Movie Review & Rating Schema
│   │   └── User.js            # User Schema
│   ├── routes/                # Express API Route Handlers
│   │   ├── authRoutes.js      # /api/auth Endpoints
│   │   ├── favoriteRoutes.js  # /api/favorites Endpoints
│   │   ├── movieRoutes.js     # /api/movies Endpoints
│   │   ├── reviewRoutes.js    # /api/reviews Endpoints
│   │   └── userRoutes.js      # /api/user Endpoints
│   └── server.js              # Application Entry Point & Express Setup
├── .env                       # Environment Variables Configuration
├── .gitignore                 # Files Excluded from Version Control
├── package.json               # Node Package Dependencies & Scripts
└── README.md                  # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v16.x or higher)
- **npm** (v8.x or higher)
- **MongoDB** (Local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- **TMDB API Key** (Free key available at [The Movie Database API](https://www.themoviedb.org/documentation/api))

---

### Environment Variables

Create a `.env` file in the root directory of the project and add the following variables:

```env
# Server Port
PORT=5000

# JSON Web Token Secret
JWT_SECRET=your_jwt_secret_key_here

# MongoDB Connection Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/movie_db

# TMDB API Key (v3)
TMDB_API_KEY=your_tmdb_api_key_here
```

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/movie_review_rating_website.git
   cd movie_review_rating_website
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

---

### Running the Application

1. **Start the Backend API Server**:
   - **Development mode** (with auto-reload):
     ```bash
     npm run dev
     ```
   - **Production mode**:
     ```bash
     npm start
     ```
   The backend server will run on `http://localhost:5000`.

2. **Launch the Frontend Client**:
   - Open `docs/index.html` directly in your web browser, **or**
   - Serve the `docs/` folder using any static file server (e.g., Live Server extension in VS Code or `npx serve docs`).

---

## 📡 API Documentation

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT | ❌ |

#### Example Register Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

---

### Movie Routes (`/api/movies`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/movies/popular?page=1` | Fetch popular movies list with pagination | ❌ |
| `GET` | `/api/movies/search?query=Inception` | Search movies by title query | ❌ |
| `GET` | `/api/movies/:id` | Fetch detailed information for a movie | ❌ |

---

### Review Routes (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/reviews` | Create a new movie review |  |
| `GET` | `/api/reviews/movie/:movieId` | Get all public reviews for a specific movie | ❌ |
| `GET` | `/api/reviews/my-reviews` | Get all reviews created by current user |  |
| `PUT` | `/api/reviews/:id` | Update an existing review |  |
| `DELETE` | `/api/reviews/:id` | Delete a review |  |

#### Example Review Body:
```json
{
  "movieId": "550",
  "rating": 5,
  "review": "An absolute cinematic masterpiece!"
}
```

---

### Favorite Routes (`/api/favorites`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/favorites` | Add a movie to personal favorites |  |
| `GET` | `/api/favorites` | Get list of user's favorite movies |  |
| `GET` | `/api/favorites/check/:movieId` | Check if a movie is bookmarked |  |
| `DELETE` | `/api/favorites/:movieId` | Remove a movie from favorites |  |

---

## 💻 Frontend Overview

| Page | File Path | Functionality |
| :--- | :--- | :--- |
| **Home Page** | [`docs/index.html`](file:///e:/movie_review_rating_website/docs/index.html) | Browse popular movies, live search, theme toggle, and pagination. |
| **Movie Details** | [`docs/movie.html`](file:///e:/movie_review_rating_website/docs/movie.html) | Detailed movie information, cast, average rating, community reviews, and add/edit review form. |
| **User Profile** | [`docs/profile.html`](file:///e:/movie_review_rating_website/docs/profile.html) | User overview, list of submitted reviews, and personal favorite watchlists. |
| **Sign In** | [`docs/login.html`](file:///e:/movie_review_rating_website/docs/login.html) | User login interface with client-side form validation. |
| **Sign Up** | [`docs/register.html`](file:///e:/movie_review_rating_website/docs/register.html) | User registration form with instant validation. |

---

## 📜 License

This project is licensed under the **ISC License**.
