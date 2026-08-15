import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

app.use(cors());
app.use(express.json());

// In-Memory Database Fallbacks if MongoDB is not connected
let isMongoConnected = false;
let mockUsers = [
  {
    id: 'u1',
    name: 'Sumit',
    email: 'sumit@example.com',
    password: '', // will hash on boot or accept any for demo
    role: 'student'
  }
];

let mockInternships = [
  {
    id: 'int1',
    title: 'Frontend Web Developer (React)',
    company: 'TechCorp Solutions',
    duration: '3 Months',
    stipend: 'Unpaid (Certificate + Letter of Recommendation)',
    type: 'Remote',
    description: 'Work on premium user interfaces, state management, and real-world web applications.',
    requirements: ['HTML, CSS, JavaScript', 'React Basics', 'Good communication skills'],
    skillsLearned: ['React.js', 'State Management', 'CSS Flexbox/Grid', 'Git & GitHub']
  },
  {
    id: 'int2',
    title: 'Backend Developer (Node.js/Express)',
    company: 'CloudSystems Inc.',
    duration: '3 Months',
    stipend: 'Performance-based',
    type: 'Remote',
    description: 'Design robust REST APIs, integrate databases, and build scalable backend systems.',
    requirements: ['Node.js basics', 'JavaScript ES6', 'Express framework understanding'],
    skillsLearned: ['Express.js', 'MongoDB/Mongoose', 'REST API Design', 'Authentication JWT']
  },
  {
    id: 'int3',
    title: 'Full Stack Web Developer (MERN)',
    company: 'InnoLabs Tech',
    duration: '6 Months',
    stipend: 'Paid (Stipend: ₹5000/Month)',
    type: 'Hybrid',
    description: 'Build and deploy fully responsive, dynamic full-stack applications from scratch.',
    requirements: ['React basics', 'Node & MongoDB exposure', 'Self-motivated learner'],
    skillsLearned: ['MongoDB', 'Express', 'React', 'NodeJS', 'System Architecture']
  }
];

let mockUserInternships = [
  {
    id: 'ui1',
    userId: 'u1',
    internshipId: 'int1',
    status: 'In Progress',
    appliedDate: '2026-08-01',
    tasks: [
      { id: 't1', title: 'Task 1: Portfolio Website Landing Page', status: 'Approved', submissionLink: 'https://github.com/sumit/portfolio', feedback: 'Great design and clean layout!' },
      { id: 't2', title: 'Task 2: Weather Dashboard App', status: 'Submitted', submissionLink: 'https://github.com/sumit/weather-app', feedback: 'Under Review' },
      { id: 't3', title: 'Task 3: E-commerce Shopping Cart', status: 'Pending', submissionLink: '', feedback: '' }
    ]
  }
];

let mockCertificates = [
  {
    id: 'cert_sumit_123',
    userId: 'u1',
    userName: 'Sumit Kumar',
    internshipTitle: 'Frontend Web Developer (React)',
    issueDate: '2026-08-10',
    verificationHash: 'CERT-FRONTEND-SUMIT-9821'
  }
];

// Hash mock user password on load
bcrypt.hash('password123', 10).then(hashed => {
  mockUsers[0].password = hashed;
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/internship-portal')
  .then(() => {
    console.log('MongoDB Connected Successfully');
    isMongoConnected = true;
  })
  .catch(err => {
    console.warn('MongoDB connection failed. Running server with in-memory database mode for seamless demo.');
    isMongoConnected = false;
  });

// AUTHENTICATION MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Token Required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token Invalid or Expired' });
    req.user = user;
    next();
  });
};

// --- ROUTES ---

// 1. Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = process.env.ADMIN_EMAIL && email.trim().toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase();
    
    const newUser = {
      id: 'u' + (mockUsers.length + 1),
      name,
      email,
      password: hashedPassword,
      role: isAdmin ? 'admin' : 'student'
    };
    mockUsers.push(newUser);

    const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = mockUsers.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// Admin Password Reset
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const userIndex = mockUsers.findIndex(u => u.email === email);
  if (userIndex !== -1) {
    mockUsers[userIndex].password = await bcrypt.hash(newPassword, 10);
    return res.status(200).json({ message: 'Password updated successfully' });
  }
  res.status(404).json({ message: 'User not found' });
});

// 2. Internships Routes
app.get('/api/internships', (req, res) => {
  res.json(mockInternships);
});

app.post('/api/internships/apply', authenticateToken, (req, res) => {
  const { internshipId } = req.body;
  const userId = req.user.id;

  const existing = mockUserInternships.find(ui => ui.userId === userId && ui.internshipId === internshipId);
  if (existing) {
    return res.status(400).json({ message: 'Already applied for this internship' });
  }

  const newApp = {
    id: 'ui' + (mockUserInternships.length + 1),
    userId,
    internshipId,
    status: 'In Progress',
    appliedDate: new Date().toISOString().split('T')[0],
    tasks: [
      { id: 't1', title: 'Task 1: Standard Introduction Mockup', status: 'Pending', submissionLink: '', feedback: '' },
      { id: 't2', title: 'Task 2: API Integration & Logic', status: 'Pending', submissionLink: '', feedback: '' },
      { id: 't3', title: 'Task 3: Production Deployment', status: 'Pending', submissionLink: '', feedback: '' }
    ]
  };
  mockUserInternships.push(newApp);
  res.status(201).json({ message: 'Applied successfully!', application: newApp });
});

// 3. User's Internships & Tasks
app.get('/api/my-internships', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userApps = mockUserInternships.filter(ui => ui.userId === userId);
  
  const detailedApps = userApps.map(app => {
    const details = mockInternships.find(i => i.id === app.internshipId);
    return { ...app, details };
  });

  res.json(detailedApps);
});

// Submit Internship Task
app.post('/api/tasks/submit', authenticateToken, (req, res) => {
  const { internshipId, taskId, submissionLink } = req.body;
  const userId = req.user.id;

  const appIndex = mockUserInternships.findIndex(ui => ui.userId === userId && ui.internshipId === internshipId);
  if (appIndex === -1) {
    return res.status(404).json({ message: 'Internship application not found' });
  }

  const taskIndex = mockUserInternships[appIndex].tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  mockUserInternships[appIndex].tasks[taskIndex].status = 'Submitted';
  mockUserInternships[appIndex].tasks[taskIndex].submissionLink = submissionLink;
  mockUserInternships[appIndex].tasks[taskIndex].feedback = 'Under Review';

  res.json({ message: 'Task submitted successfully!', updatedTasks: mockUserInternships[appIndex].tasks });
});

// 4. Certificates Routes
app.get('/api/certificates/my', authenticateToken, (req, res) => {
  const userCerts = mockCertificates.filter(c => c.userId === req.user.id);
  res.json(userCerts);
});

// Public verify route
app.get('/api/certificates/verify/:hash', (req, res) => {
  const hash = req.params.hash;
  const cert = mockCertificates.find(c => c.verificationHash.toUpperCase() === hash.toUpperCase());
  if (!cert) {
    return res.status(404).json({ message: 'Invalid Verification ID / Certificate not found.' });
  }
  res.json(cert);
});

// 5. Dashboard Summary
app.get('/api/dashboard/summary', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const myApps = mockUserInternships.filter(ui => ui.userId === userId);
  
  let totalTasks = 0;
  let completedTasks = 0;
  myApps.forEach(app => {
    app.tasks.forEach(t => {
      totalTasks++;
      if (t.status === 'Approved') {
        completedTasks++;
      }
    });
  });

  const myCertsCount = mockCertificates.filter(c => c.userId === userId).length;

  res.json({
    activeInternships: myApps.filter(app => app.status === 'In Progress').length,
    completedTasks,
    totalTasks,
    certificatesEarned: myCertsCount,
    taskProgressPercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  });
});

// ─── Email Notification Route ───────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  const { type, studentName, studentEmail, internshipTitle, internshipDomain, appliedDate, submittedDate, paymentNote } = req.body;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    return res.status(503).json({ message: 'Email service not configured.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass }
  });

  let subject, html;

  if (type === 'apply') {
    subject = `🎓 New Application: ${studentName} — ${internshipTitle}`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 24px; border-radius: 12px;">
        <h2 style="color: #4f46e5;">📋 New Internship Application</h2>
        <table style="width:100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
          <tr style="background: #4f46e5; color: white;"><th colspan="2" style="padding: 12px; text-align: left;">Student Details</th></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #eee;">Name</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee;">${studentName}</td></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #eee;">Email</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee;">${studentEmail}</td></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #eee;">Internship</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee;">${internshipTitle}</td></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #eee;">Domain</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee;">${internshipDomain || 'N/A'}</td></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold;">Applied On</td><td style="padding: 10px 16px;">${appliedDate}</td></tr>
        </table>
      </div>`;
  } else if (type === 'final_submit') {
    subject = `✅ Final Submit + Payment: ${studentName} — ${internshipTitle}`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 24px; border-radius: 12px;">
        <h2 style="color: #10b981;">✅ Final Submission Received</h2>
        <table style="width:100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
          <tr style="background: #10b981; color: white;"><th colspan="2" style="padding: 12px; text-align: left;">Submission Details</th></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #eee;">Name</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee;">${studentName}</td></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #eee;">Email</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee;">${studentEmail}</td></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #eee;">Internship</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee;">${internshipTitle}</td></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #eee;">Domain</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee;">${internshipDomain || 'N/A'}</td></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #eee;">Applied On</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee;">${appliedDate}</td></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold; border-bottom: 1px solid #eee;">Submitted On</td><td style="padding: 10px 16px; border-bottom: 1px solid #eee;">${submittedDate}</td></tr>
          <tr><td style="padding: 10px 16px; font-weight: bold;">Payment</td><td style="padding: 10px 16px; color: #10b981; font-weight: bold;">${paymentNote}</td></tr>
        </table>
      </div>`;
  } else {
    return res.status(400).json({ message: 'Invalid email type.' });
  }

  try {
    await transporter.sendMail({
      from: `"Skillora Portal" <${gmailUser}>`,
      to: gmailUser,
      subject,
      html
    });
    res.json({ success: true, message: 'Email sent successfully.' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ message: 'Failed to send email.', error: err.message });
  }
});
// ────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
