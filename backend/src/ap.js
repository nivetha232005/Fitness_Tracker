const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// File-based database
const DB_PATH = path.join(__dirname, '../db.json');

// Initialize database if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
}

function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working with file-based storage!',
    timestamp: new Date()
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body.email);
    
    const { name, email, password, age, gender, height, weight, fitnessGoal } = req.body;
    
    const db = readDB();
    
    // Check if user exists
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      age: parseInt(age),
      gender,
      height: parseInt(height),
      weight: parseInt(weight),
      fitnessGoal,
      createdAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    writeDB(db);
    
    // Create token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      'secret123',
      { expiresIn: '7d' }
    );
    
    console.log('User registered successfully:', email);
    
    res.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        fitnessGoal: newUser.fitnessGoal
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email);
    
    const { email, password } = req.body;
    const db = readDB();
    
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      'secret123',
      { expiresIn: '7d' }
    );
    
    console.log('User logged in successfully:', email);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        fitnessGoal: user.fitnessGoal
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, 'secret123');
    const db = readDB();
    const user = db.users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Calculate BMI
    let bmi = null;
    if (user.height && user.weight) {
      const heightInMeters = user.height / 100;
      bmi = (user.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    
    res.json({
      success: true,
      data: {
        ...user,
        password: undefined,
        bmi
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// Health check
app.get('/health', (req, res) => {
  const db = readDB();
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    users: db.users.length,
    storage: 'file-based'
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
  console.log('Test API: http://localhost:' + PORT + '/api/test');
  console.log('Register API: http://localhost:' + PORT + '/api/auth/register');
  console.log('Login API: http://localhost:' + PORT + '/api/auth/login');
  console.log('Database: File-based (db.json)');
  console.log('');
  console.log('Ready to accept requests!');
});
