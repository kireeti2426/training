# 🚀 QUICK START REFERENCE CARD

## ⚡ 30-Second Setup

```bash
cd c:\Users\Kiree\OneDrive\Desktop\insecure-webapp
docker-compose up
```

Then visit: **http://localhost:3000**

---

## 📲 Test Credentials

```
Username: testuser
Password: password123
Email: test@example.com
```

Or create your own via Registration page.

---

## 🎯 What You Have

✅ **19 Files**
- 1 Backend server (server.js)
- 6 Frontend pages (HTML)
- 1 Stylesheet (CSS)
- 7 Configuration files
- 4 Documentation files

✅ **Complete Features**
- User registration & login
- User profiles
- Post creation & search
- Image uploads & gallery
- Password management

✅ **10 Security Vulnerabilities**
- All intentionally implemented for learning
- All documented in VULNERABILITIES_GUIDE.md
- All exploitable for security testing

✅ **Docker Ready**
- Dockerfile configured
- Docker Compose orchestration
- Ready to push to Docker Hub

---

## 📖 Essential Commands

### Docker Operations
```bash
# Start application
docker-compose up

# Stop application
docker-compose down

# View logs
docker-compose logs -f

# Access MongoDB
docker-compose exec mongo mongosh

# Rebuild images
docker-compose up --build
```

### NPM Operations
```bash
# Install dependencies
npm install

# Start server
npm start

# Check syntax
node -c server.js
```

### Git Operations
```bash
# Initialize
git init

# Commit
git add .
git commit -m "message"

# Push
git push origin main

# Create repository
# https://github.com/CybersecVNRVJIET26/[your-name]
```

---

## 🔍 Test Each Feature

| Feature | How to Test |
|---------|---|
| Registration | Navigate to `/register.html`, fill form, click Register |
| Login | Use registered credentials, click Login |
| Dashboard | After login, create posts and view feed |
| Search | Use search bar, try special characters |
| Profile | Edit username/bio, click Update |
| Password | Enter old password, new password, save |
| Gallery | Upload image file, view in gallery |
| XSS | Create post with `<img src=x onerror="alert()">` |

---

## 📂 Important File Locations

| File | Purpose | Path |
|------|---------|------|
| **server.js** | All backend routes | Root |
| **Dashboard** | Post feed & search | `/public/dashboard.html` |
| **Profile** | User settings | `/public/profile.html` |
| **Gallery** | Image upload | `/public/gallery.html` |
| **Vulnerabilities** | Security details | `VULNERABILITIES_GUIDE.md` |
| **Setup** | Installation guide | `SETUP_GUIDE.md` |
| **Deployment** | Docker guide | `DEPLOYMENT_GUIDE.md` |

---

## 🌐 URLs Reference

| Page | URL |
|------|-----|
| Home | http://localhost:3000/ |
| Register | http://localhost:3000/public/register.html |
| Login | http://localhost:3000/public/login.html |
| Dashboard | http://localhost:3000/public/dashboard.html |
| Profile | http://localhost:3000/public/profile.html |
| Gallery | http://localhost:3000/public/gallery.html |

---

## 🔐 Vulnerability Quick Ref

| # | Vulnerability | Test Case |
|---|---|---|
| 1 | Plain Text Password | Query MongoDB: `db.users.find()` |
| 2 | No Validation | Register with empty username |
| 3 | XSS | Create post: `<script>alert(1)</script>` |
| 4 | No Auth | Change localStorage userId, access profile |
| 5 | NoSQL Injection | Search: `{$regex: ".*"}` |
| 6 | Bad Sessions | Hardcoded secret in server.js:22 |
| 7 | File Upload | Upload .exe or 1GB file |
| 8 | Error Messages | Trigger error, see MongoDB details |
| 9 | No CSRF | Cross-site form submission |
| 10 | Hardcoded Creds | Read server.js source code |

---

## 🎯 Learning Path

1. **Run the app**: `docker-compose up`
2. **Create an account**: Register & login
3. **Explore features**: Try all functionality
4. **Read guide**: VULNERABILITIES_GUIDE.md
5. **Test exploits**: Attempt each vulnerability
6. **Understand fixes**: See secure alternatives
7. **Deploy to Docker Hub**: `docker push` your image

---

## ✅ Submission Checklist

Before submitting:

- [ ] Run `docker-compose up` successfully
- [ ] Access http://localhost:3000 in browser
- [ ] Register new user account
- [ ] Login with account
- [ ] Create a post
- [ ] Search for posts
- [ ] Upload image
- [ ] View gallery
- [ ] Update profile
- [ ] Change password
- [ ] Take screenshots of all pages
- [ ] Push code to GitHub
- [ ] Build Docker image: `docker build -t username/insecure-webapp .`
- [ ] Push to Docker Hub: `docker push username/insecure-webapp`
- [ ] Collect all links for submission

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change PORT in server.js or kill process |
| Docker not running | Start Docker Desktop or `systemctl start docker` |
| MongoDB connection error | Restart: `docker-compose restart` |
| Module not found | Run: `npm install` |
| Syntax error | Check: `node -c server.js` |

---

## 📞 Quick Links

- **Project Docs**: README.md
- **Setup Help**: SETUP_GUIDE.md
- **Security Details**: VULNERABILITIES_GUIDE.md
- **Deployment**: DEPLOYMENT_GUIDE.md
- **Summary**: PROJECT_COMPLETION_SUMMARY.md

---

## 🏁 You're Ready!

Everything is installed and configured. Just run:

```bash
docker-compose up
```

Visit: **http://localhost:3000**

Enjoy learning! 🎓

