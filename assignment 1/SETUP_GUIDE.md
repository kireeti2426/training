# 🚀 Insecure WebApp - Setup & Getting Started Guide

## Quick Setup (5 minutes)

### Prerequisites
- Docker & Docker Compose installed on your system
- (Optional) Node.js 18+ for local development

### Step 1️⃣: Clone Repository

```bash
cd your-workspace
git clone https://github.com/CybersecVNRVJIET26/[your-name].git
cd insecure-webapp
```

### Step 2️⃣: Run with Docker

```bash
docker-compose up
```

Wait for the output:
```
web_1   | Server running on http://0.0.0.0:3000
```

### Step 3️⃣: Open in Browser

Navigate to: **http://localhost:3000**

---

## 📱 Features Overview & How to Use

### 1. Registration

1. Click "Register" button
2. Enter:
   - Username (e.g., `john_doe`)
   - Email (e.g., `john@example.com`)
   - Password (e.g., `password123`)
3. Click "Register"

**Test Account:**
```
Username: testuser
Email: test@example.com
Password: password123
```

### 2. Login

1. Click "Login" button
2. Enter your credentials
3. Click "Login"
4. Redirected to Dashboard

### 3. Dashboard

**Create Posts:**
- Enter Post Title
- Enter Post Content (⚠️ Try HTML/JavaScript here to see XSS!)
- Optionally add Image URL
- Click "Create Post"

**Search Posts:**
- Use search bar to find posts
- Search by title, content, or username
- (⚠️ Try MongoDB operators like `{$regex:...}`)

### 4. Profile

**Edit Profile:**
- Update Username, Email, Bio
- Click "Update Profile"

**Change Password:**
- Enter old password
- Enter new password (⚠️ No strength requirements!)
- Confirm new password
- Click "Change Password"

### 5. Gallery

**Upload Image:**
- Click "Select Image"
- Choose any file (⚠️ No file type validation!)
- Click "Upload"

**View Gallery:**
- See all uploaded images
- Images stored in `uploads/` folder

---

## 🐳 Docker Operations

### Start Application

```bash
# From project root directory
docker-compose up

# Run in background
docker-compose up -d
```

### Stop Application

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f web
```

### Rebuild Docker Image

```bash
docker-compose up --build
```

### Access MongoDB

```bash
docker-compose exec mongo mongo
```

Inside MongoDB shell:
```javascript
use insecure-webapp
db.users.find().pretty()
db.posts.find().pretty()
db.images.find().pretty()
```

---

## 💻 Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- MongoDB running locally or on cloud

### Setup

```bash
# Install dependencies
npm install

# Start development server
node server.js
```

### Configure MongoDB Connection

Edit `server.js` line 9:
```javascript
const MONGODB_URI = 'mongodb://localhost:27017/insecure-webapp';
```

---

## 🔓 Security Vulnerabilities to Explore

### Test #1: Plain Text Password

1. Register a user with password `mypassword123`
2. Open browser DevTools → Application → LocalStorage
3. See `username` stored in localStorage
4. Access MongoDB and query users:
   ```javascript
   db.users.find({ username: "your-username" }).pretty()
   ```
5. See your password stored in plain text!

### Test #2: XSS Attack

1. Create a post with content:
   ```html
   <h1>Hacked!</h1>
   <img src=x onerror="document.body.style.backgroundColor='red'">
   ```
2. View the post - see content rendered as HTML!
3. Change to:
   ```javascript
   <img src=x onerror="alert('XSS Vulnerability')">
   ```

### Test #3: Direct Database Access

1. Change post `userId` in browser LocalStorage
2. Try accessing another user's profile
3. Can view other users' data without authorization!

### Test #4: Search Injection

1. Go to Dashboard
2. Try searching:
   ```
   {$regex: ".*", $options: "i"}
   ```
3. Observe MongoDB injection vulnerability

### Test #5: File Upload Bypass

1. Upload an image
2. Try uploading non-image files
3. No file type validation!

---

## 📊 Project Structure

```
insecure-webapp/
├── server.js                      # Express server (all routes)
├── package.json                   # Dependencies
├── docker-compose.yml             # Docker orchestration
├── Dockerfile                     # Docker image config
├── .gitignore                     # Git ignore rules
├── .dockerignore                  # Docker ignore rules
├── README.md                      # Main documentation
├── SETUP_GUIDE.md                # This file
├── public/                        # Frontend files
│   ├── index.html               # Home page
│   ├── login.html               # Login page
│   ├── register.html            # Registration page
│   ├── dashboard.html           # Main dashboard
│   ├── profile.html             # User profile
│   ├── gallery.html             # Image gallery
│   └── style.css                # Global styles
└── uploads/                      # User uploads (created at runtime)
```

---

## 🔗 API Endpoints Reference

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /logout` - Logout user

### Profile
- `GET /profile/:userId` - Get user profile
- `POST /profile/update` - Update profile
- `POST /change-password` - Change password

### Posts
- `POST /create-post` - Create new post
- `GET /posts` - Get all posts
- `GET /user-posts/:userId` - Get user's posts
- `GET /search?q=query` - Search posts

### Gallery
- `POST /upload` - Upload image
- `GET /gallery/:userId` - Get user's gallery

---

## 🔧 Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

### MongoDB Connection Failed

```bash
# Make sure MongoDB container is running
docker-compose exec mongo mongo

# Or run MongoDB locally
mongod
```

### Cannot Upload Image

- Check `uploads/` folder exists (created automatically)
- Check Docker volume mapping in docker-compose.yml
- Check file permissions

### Posts Not Saving

- Verify MongoDB is running
- Check connection string in server.js
- View Docker logs: `docker-compose logs mongo`

---

## 📝 Making Changes

### Add New Route

Edit `server.js`:
```javascript
app.get('/new-route', (req, res) => {
  res.json({ message: 'Hello' });
});
```

### Update Frontend

Edit files in `public/` folder. Changes reflect immediately (refresh browser).

### Rebuild Docker

```bash
docker-compose down
docker-compose up --build
```

---

## 📤 Deployment Process

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit - insecure webapp"
git push origin main
```

### 2. Build Docker Image

```bash
docker build -t [docker-username]/insecure-webapp:latest .
```

### 3. Push to Docker Hub

```bash
docker login
docker push [docker-username]/insecure-webapp:latest
```

### 4. Run from Docker Hub

```bash
docker run -p 3000:3000 -e MONGODB_URI=mongodb://mongo:27017/insecure-webapp [docker-username]/insecure-webapp:latest
```

---

## ✅ Checklist for Submission

- [ ] Application runs successfully without errors
- [ ] All pages accessible (Home, Register, Login, Dashboard, Profile, Gallery)
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can create posts with content and images
- [ ] Can search posts
- [ ] Can upload images to gallery
- [ ] Can change password
- [ ] Can update profile
- [ ] MongoDB data persisting (posts saved after restart)
- [ ] Docker image built and working
- [ ] Code pushed to GitHub
- [ ] Docker image pushed to Docker Hub
- [ ] README documentation complete
- [ ] Screenshots added to GitHub repository

---

## 🎓 Learning Outcomes

After working with this application, you should understand:

1. ✅ How web applications work (frontend, backend, database)
2. ✅ Common security vulnerabilities
3. ✅ Why security practices matter
4. ✅ How to containerize applications with Docker
5. ✅ How to use version control with GitHub
6. ✅ Full-stack development fundamentals
7. ✅ REST API design basics
8. ✅ MongoDB database operations
9. ✅ Node.js/Express development
10. ✅ File upload handling

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Documentation](https://docs.github.com/)

---

## ⚠️ Important Reminders

- ❌ **DO NOT** use this code in production
- ❌ **DO NOT** store real user data in this application
- ❌ **DO NOT** deploy this publicly without proper warnings
- ✅ **DO** use this to learn about security
- ✅ **DO** understand why each vulnerability is a problem
- ✅ **DO** apply these lessons to secure applications

---

**Good luck with your learning! Happy hacking (ethically)! 🔒**

