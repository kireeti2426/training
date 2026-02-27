# 🔓 Insecure WebApp - Learning Platform

## ⚠️ DISCLAIMER

**This application is intentionally insecure and is designed FOR EDUCATIONAL PURPOSES ONLY.** It demonstrates common web application vulnerabilities to help developers understand security risks. 

**DO NOT use this code in production or for any real applications.**

---

## 📋 Project Overview

Insecure WebApp is a fully functional web application built with Node.js, Express, and MongoDB that intentionally includes various security vulnerabilities. This project helps developers and security enthusiasts understand:

- Common web application vulnerabilities
- Security best practices
- Why security measures are important
- How attacks can be executed

---

## ✨ Features

### User Management
- ✅ User Registration
- ✅ User Login
- ✅ User Profile Management
- ✅ Password Change Functionality

### Content Management
- ✅ Create Posts with Text and Images
- ✅ View All Posts
- ✅ Image Upload & Gallery
- ✅ Search Posts by Title, Content, or Username

### Intentional Vulnerabilities

This application demonstrates the following vulnerabilities for learning purposes:

1. **Plain Text Password Storage** - Passwords stored without hashing
2. **No Input Validation** - Accepts any input without validation
3. **No Authentication Checks** - Endpoints accessible without proper authentication
4. **Cross-Site Scripting (XSS)** - User content rendered without sanitization
5. **Hardcoded Credentials** - Session secrets hardcoded in source
6. **No CSRF Protection** - Forms lack CSRF tokens
7. **Unrestricted File Upload** - No file type/size validation
8. **Weak Session Management** - Simple session implementation
9. **Information Disclosure** - Error messages may reveal system info
10. **NoSQL Injection Vulnerability** - Search functionality vulnerable to injection

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **File Upload**: Multer
- **Session Management**: Express-session
- **Containerization**: Docker & Docker Compose

---

## 📦 Installation

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- MongoDB (if running locally without Docker)

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/CybersecVNRVJIET26/[your-name].git
cd insecure-webapp

# Build and run with Docker Compose
docker-compose up --build

# Application will be available at http://localhost:3000
```

### Option 2: Local Installation

```bash
# Clone the repository
git clone https://github.com/CybersecVNRVJIET26/[your-name].git
cd insecure-webapp

# Install dependencies
npm install

# Make sure MongoDB is running (locally or via Docker)
# docker run -d -p 27017:27017 mongo:latest

# Start the application
node server.js

# Access at http://localhost:3000
```

---

## 🚀 Quick Start Guide

### 1. Start the Application

```bash
docker-compose up
```

Or locally:
```bash
npm install
node server.js
```

### 2. Open in Browser

Navigate to: **http://localhost:3000**

### 3. Register a New Account

- Click "Register"
- Fill in Username, Email, and Password
- Click "Register"

### 4. Login

- Click "Login"
- Enter your credentials
- Click "Login"

### 5. Explore Features

- **Dashboard** - Create and view posts
- **Profile** - Edit profile and change password
- **Gallery** - Upload and view images
- **Search** - Search for posts by content or username

---

## 📁 Project Structure

```
insecure-webapp/
├── server.js                 # Main Express server
├── package.json             # Node.js dependencies
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose setup
├── .dockerignore            # Docker ignore file
├── public/                  # Frontend files
│   ├── index.html          # Home page
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── dashboard.html      # Main dashboard
│   ├── profile.html        # User profile
│   ├── gallery.html        # Image gallery
│   └── style.css           # Styling
├── uploads/                # User uploaded images (created at runtime)
└── README.md               # This file
```

---

## 🔑 Sample Accounts

You can create your own accounts, but here are some test credentials:

```
Username: testuser
Password: password123
Email: test@example.com

Username: admin
Password: admin123
Email: admin@example.com
```

---

## �надав Docker Usage

### Build Docker Image

```bash
# Build the image
docker build -t insecure-webapp:latest .

# Run container
docker run -p 3000:3000 --network insecure-webapp-network insecure-webapp:latest
```

### Using Docker Compose

```bash
# Start all services
docker-compose up

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images
docker-compose up --build
```

### Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag your image
docker tag insecure-webapp:latest yourusername/insecure-webapp:latest

# Push to Hub
docker push yourusername/insecure-webapp:latest
```

---

## 🔍 Understanding the Vulnerabilities

### 1. Plain Text Password Storage
**Location**: `server.js` - Registration and Login endpoints

```javascript
// ⚠️ INSECURE: Storing password as plain text
const user = new User({
  username: username,
  password: password  // NO HASHING!
});
```

**Risk**: If database is compromised, all user passwords are exposed.

**Secure Alternative**: Use bcrypt or Argon2 for password hashing.

---

### 2. No Input Validation
**Location**: `server.js` - All endpoints

**Risk**: Allows injection attacks, stored XSS, and data manipulation.

**Secure Alternative**: Use libraries like `joi` or `express-validator`.

---

### 3. XSS Vulnerability
**Location**: `dashboard.html` - Post content rendering

```javascript
// ⚠️ INSECURE: Rendering user content as HTML
<div class="post-content">
  ${post.content}  // If content contains <script>, it will execute!
</div>
```

**Risk**: Attackers can inject malicious JavaScript.

**Secure Alternative**: Use `textContent` instead of `innerHTML`, or sanitize with libraries like `DOMPurify`.

---

### 4. NoSQL Injection
**Location**: `server.js` - Search endpoint

```javascript
// ⚠️ INSECURE: Direct regex on user input
const results = await Post.find({
  $or: [
    { title: { $regex: query, $options: 'i' } },
    { content: { $regex: query, $options: 'i' } }
  ]
});
```

**Risk**: Attackers can inject MongoDB operators and retrieve unauthorized data.

---

### 5. No Authentication
**Location**: All API endpoints

**Risk**: Any user can access any other user's profile, posts, or images.

**Secure Alternative**: Implement proper JWT or session-based authentication with authorization checks.

---

## 📚 Learning Resources

### How to Exploit These Vulnerabilities

1. **SQL/NoSQL Injection**: Try injecting `db.collection.find()` queries in search
2. **XSS**: Create a post with `<img src=x onerror="alert('XSS')">`
3. **Plain Text Passwords**: Register and check MongoDB to see passwords
4. **CSRF**: Create forms that modify data without tokens
5. **Authentication Bypass**: Modify localStorage userId to access other accounts

### Security Best Practices

1. Always hash passwords with strong algorithms (bcrypt, Argon2)
2. Validate and sanitize all user inputs
3. Implement proper authentication and authorization
4. Use HTTPS/TLS for all communications
5. Sanitize output to prevent XSS
6. Use prepared statements to prevent SQL/NoSQL injection
7. Implement CSRF protection tokens
8. Use security headers (CSP, X-Frame-Options, etc.)
9. Implement rate limiting
10. Keep dependencies updated

---

## 🐛 Known Issues & Vulnerabilities

- ⚠️ Passwords stored in plain text
- ⚠️ No email verification
- ⚠️ No rate limiting on endpoints
- ⚠️ No file upload restrictions
- ⚠️ Direct database queries without sanitization
- ⚠️ Session secrets hardcoded
- ⚠️ No HTTPS enforcement
- ⚠️ Error messages leak system information
- ⚠️ No audit logging
- ⚠️ No input length limits

---

## 🔄 Workflow

```
Local Development
    ↓
GitHub Push
    ↓
Docker Build
    ↓
Docker Hub Push
    ↓
Docker Run Locally
```

### Example Workflow:

```bash
# 1. Develop locally
npm install
node server.js

# 2. Push to GitHub
git add .
git commit -m "Add features"
git push origin main

# 3. Build Docker image
docker build -t yourusername/insecure-webapp:latest .

# 4. Push to Docker Hub
docker login
docker push yourusername/insecure-webapp:latest

# 5. Run from Docker Hub
docker run -p 3000:3000 yourusername/insecure-webapp:latest
```

---

## 📝 Submission Checklist

- [ ] Web application developed with all required features
- [ ] Code pushed to GitHub repository
- [ ] Docker image built and published to Docker Hub
- [ ] Application runs successfully in Docker container
- [ ] Screenshots of running application added to README
- [ ] All vulnerabilities documented
- [ ] README includes installation and usage instructions

---

## 🚫 What NOT To Do

1. ❌ Do not use this code in any production environment
2. ❌ Do not modify to be secure without understanding the differences
3. ❌ Do not store real user data in this application
4. ❌ Do not deploy this publicly without warning users
5. ❌ Do not use this to attack real applications or systems

---

## 📞 Support

For questions or issues:
- Check the README thoroughly
- Review the server.js code comments
- Consult the learning resources section
- Review OWASP Top 10 documentation

---

## 📄 License

This project is provided "AS IS" for educational purposes only.

---

## ⭐ Credits

Created for cybersecurity awareness and learning purposes by the CybersecVNRVJIET26 organization.

---

**Remember**: Understanding vulnerabilities is the first step to building secure applications! 🔒

