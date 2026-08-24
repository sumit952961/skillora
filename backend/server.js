import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendWelcomeEmail, sendLoginNotification, sendPasswordResetOTP, sendPasswordResetConfirmation, sendPasswordChangeConfirmation, sendAdminContestNotification } from "./emailService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummysecret'
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/", (req, res) => res.json({ message: "Skillzeno API is running successfully!" }));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  tokenVersion: { type: Number, default: 0 },
  course: { type: String, default: "" },
  branch: { type: String, default: "" },
  semester: { type: String, default: "" },
  college: { type: String, default: "" },
  mobileNumber: { type: String, default: "" },
  skills: { type: String, default: "" }
}, { timestamps: true });

const applicationSchema = new mongoose.Schema({
  appNumber: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  internshipId: { type: String, required: true },
  status: { type: String, default: "In Progress" },
  appliedDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
  finalSubmitted: { type: Boolean, default: false },
  paymentDetails: { type: Object, default: null },
  tasks: [{ id: String, title: String, status: { type: String, default: "Pending" }, submissionLink: { type: String, default: "" }, linkedinLink: { type: String, default: "" }, feedback: { type: String, default: "" } }],
  offerLetterUrl: { type: String, default: "" },
  certificateUrl: { type: String, default: "" }
}, { timestamps: true });

const quizApplicationSchema = new mongoose.Schema({
  appNumber: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  takenDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
  paymentSubmitted: { type: Boolean, default: false },
  paymentDetails: { type: Object, default: null },
  certificateUrl: { type: String, default: "" }
}, { timestamps: true });

const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String, internshipTitle: String, domain: String, title: String,
  issueDate: String, certificateNumber: { type: String, unique: true },
  verificationHash: String, performanceRemarks: String, applicationId: String
}, { timestamps: true });

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, default: "Skillzeno" },
  department: { type: String, required: true },
  domain: { type: String, required: true },
  duration: { type: String, required: true },
  stipend: { type: String, default: "Unpaid (Certificate + LOR)" },
  type: { type: String, required: true },
  mode: { type: String, default: "Full-Time" },
  description: { type: String, required: true },
  overview: { type: String },
  responsibilities: [String],
  requirements: [String],
  skillsLearned: [String],
  perks: [String],
  tasks: [{ id: String, title: String, description: String }]
}, { timestamps: true });

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  timeLimit: { type: Number, required: true },
  questions: [{
    question: String,
    options: [String],
    answer: Number
  }]
}, { timestamps: true });

const settingSchema = new mongoose.Schema({
  internshipPaymentLink: { type: String, default: "https://razorpay.me/@skillzeno" },
  quizPaymentLink: { type: String, default: "https://razorpay.me/@skillzeno" },
  processingFee: { type: String, default: "99" },
  quizProcessingFee: { type: String, default: "19" }
}, { timestamps: true });

const passwordResetRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  requestedDate: { type: String, default: () => new Date().toISOString() },
  status: { type: String, enum: ["pending", "resolved"], default: "pending" }
}, { timestamps: true });

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Application = mongoose.model("Application", applicationSchema);
const QuizApplication = mongoose.model("QuizApplication", quizApplicationSchema);
const Certificate = mongoose.model("Certificate", certificateSchema);
const Internship = mongoose.model("Internship", internshipSchema);
const Quiz = mongoose.model("Quiz", quizSchema);
const Setting = mongoose.model("Setting", settingSchema);
const PasswordResetRequest = mongoose.model("PasswordResetRequest", passwordResetRequestSchema);
const OTP = mongoose.model("OTP", otpSchema);

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  domains: [{ type: String, required: true }],
  startTime: { type: Date, required: true },
  registrationEndTime: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  timeLimitMinutes: { type: Number, default: 30 },
  questionsPerStudent: { type: Number, default: 25 },
  dummyLeaderboard: [{
    rank: Number,
    name: String,
    score: Number,
    timeTaken: String
  }]
}, { timestamps: true });

const questionBankSchema = new mongoose.Schema({
  domain: { type: String, required: true, index: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Difficult'], default: 'Medium' }
}, { timestamps: true });

const contestRegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
  contestTitle: { type: String },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  mobileNumber: { type: String },
  course: { type: String },
  branch: { type: String },
  semester: { type: String },
  college: { type: String, required: true },
  domain: { type: String, required: true },
  hasTakenTest: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // in seconds
  registrationDate: { type: Date, default: Date.now },
  certificateLink: { type: String, default: "" }
}, { timestamps: true });

const Contest = mongoose.model("Contest", contestSchema);
const QuestionBank = mongoose.model("QuestionBank", questionBankSchema);
const ContestRegistration = mongoose.model("ContestRegistration", contestRegistrationSchema);


mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skillzeno")
  .then(async () => {
    console.log("Connected to MongoDB");
    
    // Auto-update settings in database directly
    try {
      let setting = await Setting.findOne();
      if (!setting) {
        setting = new Setting();
      }
      setting.internshipPaymentLink = "https://rzp.io/rzp/ddlyQEo";
      setting.quizPaymentLink = "https://rzp.io/rzp/dzygWhL";
      await setting.save();
      console.log("Payment links updated in database automatically.");
    } catch (err) {
      console.error("Failed to update settings in DB", err);
    }
  })
  .catch(err => console.error("MongoDB failed:", err.message));

const authenticateToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Token Required" });
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(403).json({ message: "Token Invalid or Expired" });
  }
  try {
    const dbUser = await User.findById(decoded.id).select("tokenVersion role");
    if (!dbUser) return res.status(403).json({ message: "User no longer exists" });
    if (decoded.tokenVersion !== dbUser.tokenVersion) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    req.user = decoded;
    next();
  } catch (e) {
    res.status(500).json({ message: "Authentication error" });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
};

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = process.env.ADMIN_EMAIL && email.trim().toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase();
    const newUser = await User.create({ name, email: email.toLowerCase(), password: hashedPassword, role: isAdmin ? "admin" : "student" });
    const token = jwt.sign({ id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, tokenVersion: newUser.tokenVersion }, JWT_SECRET, { expiresIn: "7d" });
    
    sendWelcomeEmail(newUser.name, newUser.email);

    res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, course: newUser.course, branch: newUser.branch, semester: newUser.semester, mobileNumber: newUser.mobileNumber, skills: newUser.skills } });
  } catch (e) { res.status(500).json({ message: "Registration failed", error: e.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Incorrect password" });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role, tokenVersion: user.tokenVersion }, JWT_SECRET, { expiresIn: "7d" });
    
    sendLoginNotification(user.name, user.email);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, course: user.course, branch: user.branch, semester: user.semester, mobileNumber: user.mobileNumber, skills: user.skills } });
  } catch (e) { res.status(500).json({ message: "Login failed", error: e.message }); }
});

app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, course: user.course, branch: user.branch, semester: user.semester, mobileNumber: user.mobileNumber, skills: user.skills });
  } catch (e) { res.status(500).json({ message: "Failed to fetch profile" }); }
});

app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { name, course, branch, semester, mobileNumber, skills } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (name) user.name = name;
    user.course = course || "";
    user.branch = branch || "";
    user.semester = semester || "";
    user.mobileNumber = mobileNumber || "";
    user.skills = skills || "";
    
    await user.save();
    res.json({ message: "Profile updated successfully", user: { id: user._id, name: user.name, email: user.email, role: user.role, course: user.course, branch: user.branch, semester: user.semester, mobileNumber: user.mobileNumber, skills: user.skills } });
  } catch (e) {
    res.status(500).json({ message: "Failed to update profile", error: e.message });
  }
});

app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: "Incorrect current password" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all other sessions
    await user.save();
    // Re-issue a fresh token for the current device so it stays logged in
    const newToken = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role, tokenVersion: user.tokenVersion }, JWT_SECRET, { expiresIn: "7d" });
    
    sendPasswordChangeConfirmation(user.name, user.email);

    res.json({ message: "Password changed successfully", token: newToken });
  } catch (e) {
    res.status(500).json({ message: "Failed to change password", error: e.message });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = await bcrypt.hash(req.body.newPassword, 10);
    await user.save();
    if (req.body.requestId) {
      await PasswordResetRequest.findByIdAndUpdate(req.body.requestId, { status: "resolved" });
    }
    res.json({ message: "Password updated successfully" });
  } catch (e) { res.status(500).json({ message: "Failed to reset password" }); }
});

app.post("/api/auth/request-password-reset", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    const existing = await PasswordResetRequest.findOne({ email: user.email, status: "pending" });
    if (existing) return res.status(400).json({ message: "A request is already pending" });
    const reqDoc = await PasswordResetRequest.create({
      userId: user._id, email: user.email, name: user.name
    });
    res.json({ message: "Password reset requested", request: { ...reqDoc.toObject(), id: reqDoc._id.toString() } });
  } catch (e) { res.status(500).json({ message: "Failed to request reset" }); }
});

app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    await OTP.deleteMany({ email: user.email });
    await OTP.create({ email: user.email, otp, expiresAt });

    await sendPasswordResetOTP(user.name, user.email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (e) {
    res.status(500).json({ message: "Failed to send OTP", error: e.message });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });

    if (!otpRecord) return res.status(400).json({ message: "No OTP found or it has expired" });
    if (otpRecord.attempts >= 5) {
      await OTP.deleteMany({ email: email.toLowerCase() });
      return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." });
    }
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteMany({ email: email.toLowerCase() });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (e) {
    res.status(500).json({ message: "Verification failed", error: e.message });
  }
});

app.post("/api/auth/reset-password-otp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });

    if (!otpRecord || otpRecord.otp !== otp || new Date() > otpRecord.expiresAt || otpRecord.attempts >= 5) {
       return res.status(400).json({ message: "Invalid or expired session. Please request a new OTP." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all existing sessions
    await user.save();
    
    await OTP.deleteMany({ email: user.email });

    sendPasswordResetConfirmation(user.name, user.email);

    res.json({ message: "Password updated successfully" });
  } catch (e) {
    res.status(500).json({ message: "Failed to reset password", error: e.message });
  }
});

app.get("/api/auth/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 }).select("-password");
    res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch users" }); }
});

// INTERNSHIP ROUTES
app.get("/api/internships", async (req, res) => {
  try {
    const internships = await Internship.find().sort({ _id: -1 });
    res.json(internships.map(i => ({ ...i.toObject(), id: i._id.toString() })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch internships" }); }
});

app.get("/api/my-internships", authenticateToken, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user.id }).sort({ _id: -1 });
    const internships = await Internship.find();
    res.json(apps.map(app => ({ 
      ...app.toObject(), 
      id: app._id.toString(), 
      details: internships.find(i => i._id.toString() === app.internshipId)?.toObject() || { title: "Archived Internship" } 
    })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch internships" }); }
});

app.post("/api/internships/apply", authenticateToken, async (req, res) => {
  try {
    if (await Application.findOne({ userId: req.user.id, internshipId: req.body.internshipId }))
      return res.status(400).json({ message: "Already applied" });
    const newApp = await Application.create({ 
      appNumber: req.body.appNumber || `APP-${Date.now()}`,
      userId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      internshipId: req.body.internshipId, 
      tasks: req.body.tasks || [] 
    });
    res.status(201).json({ message: "Applied successfully!", application: { ...newApp.toObject(), id: newApp.appNumber } });
  } catch (e) { res.status(500).json({ message: "Application failed", error: e.message }); }
});

app.post("/api/payment/create-order", authenticateToken, async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: receipt
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
});

app.post("/api/internships/final-submit", authenticateToken, async (req, res) => {
  try {
    const app = await Application.findOne({ userId: req.user.id, internshipId: req.body.internshipId });
    if (!app) return res.status(404).json({ message: "Application not found" });

    // Verify Signature if provided
    if (req.body.razorpay_payment_id && req.body.razorpay_order_id && req.body.razorpay_signature) {
      const generated_signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummysecret')
        .update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id)
        .digest("hex");
      if (generated_signature !== req.body.razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
    }

    app.finalSubmitted = true;
    app.paymentDetails = req.body.paymentDetails;
    await app.save();

    try {
      const internship = await Internship.findById(app.internshipId);
      if (internship) {
        const existingCert = await Certificate.findOne({ applicationId: app.appNumber });
        if (!existingCert) {
          await Certificate.create({
            userId: req.user.id,
            userName: req.user.name || "Student",
            internshipTitle: internship.title,
            domain: internship.domain || internship.type || "N/A",
            title: internship.title,
            issueDate: new Date().toISOString().split("T")[0],
            applicationId: app.appNumber,
            certificateNumber: `PENDING-${app.appNumber}`,
            performanceRemarks: ""
          });
        }
      }
    } catch (certError) {
      console.error("Failed to create pending certificate:", certError);
    }

    res.json({ message: "Final submit successful!", application: { ...app.toObject(), id: app._id.toString() } });
  } catch (e) { res.status(500).json({ message: "Final submit failed" }); }
});

app.post("/api/tasks/submit", authenticateToken, async (req, res) => {
  try {
    const app = await Application.findOne({ userId: req.user.id, internshipId: req.body.internshipId });
    if (!app) return res.status(404).json({ message: "Application not found" });
    const task = app.tasks.find(t => t.id === req.body.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.status = "Submitted"; task.submissionLink = req.body.submissionLink; task.linkedinLink = req.body.linkedinLink || ""; task.feedback = "Under Review";
    await app.save();
    res.json({ message: "Task submitted!", updatedTasks: app.tasks });
  } catch (e) { res.status(500).json({ message: "Failed to submit task" }); }
});

// QUIZ ROUTES
app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ _id: -1 });
    res.json(quizzes.map(q => ({ ...q.toObject(), id: q._id.toString() })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch quizzes" }); }
});

app.get("/api/my-quizzes", authenticateToken, async (req, res) => {
  try {
    const apps = await QuizApplication.find({ userId: req.user.id }).sort({ _id: -1 });
    res.json(apps.map(app => ({ ...app.toObject(), id: app._id.toString() })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch quizzes" }); }
});

app.get("/api/my-contest-registrations", authenticateToken, async (req, res) => {
  try {
    const regs = await ContestRegistration.find({ userId: req.user.id })
      .populate("contestId", "title startTime endTime")
      .sort({ _id: -1 });
    res.json(regs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch contest registrations" });
  }
});

app.get("/api/contests/admin/registrations/:contestId", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    const regs = await ContestRegistration.find({ contestId: req.params.contestId })
      .populate("userId", "name email")
      .sort({ score: -1, timeTaken: 1 });
    res.json(regs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

app.put("/api/contests/admin/registrations/:registrationId/certificate", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    const { certificateLink } = req.body;
    const reg = await ContestRegistration.findByIdAndUpdate(
      req.params.registrationId,
      { certificateLink },
      { new: true }
    );
    if (!reg) return res.status(404).json({ message: "Registration not found" });
    res.json(reg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update certificate link" });
  }
});

app.post("/api/quizzes/submit", authenticateToken, async (req, res) => {
  try {
    let qApp = await QuizApplication.findOne({ userId: req.user.id, quizId: req.body.quizId });
    if (qApp) {
      qApp.score = req.body.score;
      qApp.totalQuestions = req.body.totalQuestions;
      qApp.takenDate = new Date().toISOString().split("T")[0];
      await qApp.save();
    } else {
      qApp = await QuizApplication.create({ 
        appNumber: req.body.appNumber || `QAPP-${Date.now()}`,
        userId: req.user.id,
        studentName: req.user.name,
        studentEmail: req.user.email,
        quizId: req.body.quizId, 
        quizTitle: req.body.quizTitle, 
        score: req.body.score, 
        totalQuestions: req.body.totalQuestions 
      });
    }
    res.status(201).json({ message: "Quiz submitted!", application: { ...qApp.toObject(), id: qApp.appNumber } });
  } catch (e) { res.status(500).json({ message: "Quiz submission failed", error: e.message }); }
});

app.post("/api/quizzes/payment", authenticateToken, async (req, res) => {
  try {
    const qApp = await QuizApplication.findOne({ userId: req.user.id, quizId: req.body.quizId });
    if (!qApp) return res.status(404).json({ message: "Quiz application not found" });

    // Verify Signature if provided
    if (req.body.razorpay_payment_id && req.body.razorpay_order_id && req.body.razorpay_signature) {
      const generated_signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummysecret')
        .update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id)
        .digest("hex");
      if (generated_signature !== req.body.razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
    }

    qApp.paymentSubmitted = true;
    qApp.paymentDetails = req.body.paymentDetails;
    await qApp.save();

    try {
      const existingCert = await Certificate.findOne({ applicationId: qApp.appNumber });
      if (!existingCert) {
        await Certificate.create({
          userId: req.user.id,
          userName: req.user.name || "Student",
          internshipTitle: qApp.quizTitle,
          domain: "Quiz",
          title: qApp.quizTitle,
          issueDate: new Date().toISOString().split("T")[0],
          applicationId: qApp.appNumber,
          certificateNumber: `PENDING-Q-${qApp.appNumber}`,
          performanceRemarks: `Score: ${qApp.score}/${qApp.totalQuestions}`
        });
      }
    } catch (certError) {
      console.error("Failed to create pending quiz certificate:", certError);
    }

    res.json({ message: "Payment processed!", application: { ...qApp.toObject(), id: qApp._id.toString() } });
  } catch (e) { res.status(500).json({ message: "Payment failed" }); }
});


// ADMIN ROUTES
app.get("/api/settings", async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) setting = await Setting.create({});
    res.json(setting);
  } catch (e) { res.status(500).json({ message: "Failed to fetch settings" }); }
});

app.put("/api/admin/settings", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) setting = await Setting.create({});
    setting = await Setting.findByIdAndUpdate(setting._id, req.body, { new: true });
    res.json(setting);
  } catch (e) { res.status(500).json({ message: "Failed to update settings" }); }
});

app.get("/api/admin/password-resets", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const requests = await PasswordResetRequest.find({ status: "pending" }).sort({ _id: -1 });
    res.json(requests.map(r => ({ ...r.toObject(), id: r._id.toString() })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch requests" }); }
});

// CERTIFICATE ROUTES
app.get("/api/certificates", async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ _id: -1 });
    res.json(certificates.map(c => ({ ...c.toObject(), id: c._id.toString() })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch certificates" }); }
});

app.post("/api/admin/certificates", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    if (req.body.certificateNumber || req.body.applicationId) {
      const query = [];
      if (req.body.certificateNumber) query.push({ certificateNumber: req.body.certificateNumber });
      if (req.body.applicationId) query.push({ applicationId: req.body.applicationId });
      
      const existing = await Certificate.findOne({ $or: query });
      if (existing) {
        return res.status(200).json({ ...existing.toObject(), id: existing._id.toString() });
      }
    }
    const cert = await Certificate.create(req.body);
    res.status(201).json({ ...cert.toObject(), id: cert._id.toString() });
  } catch (e) { res.status(500).json({ message: "Failed to create certificate", error: e.message }); }
});

app.put("/api/admin/certificates/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...cert.toObject(), id: cert._id.toString() });
  } catch (e) { res.status(500).json({ message: "Failed to update certificate" }); }
});

app.get("/api/admin/applications", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const apps = await Application.find().sort({ _id: -1 });
    const internships = await Internship.find();
    res.json(apps.map(app => ({ 
      ...app.toObject(), 
      id: app.appNumber || app._id.toString(), 
      details: internships.find(i => i._id.toString() === app.internshipId)?.toObject() || { title: "Archived Internship" } 
    })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch applications" }); }
});

// Admin Internship CRUD
app.post("/api/admin/internships", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const internship = await Internship.create(req.body);
    res.status(201).json({ ...internship.toObject(), id: internship._id.toString() });
  } catch (e) { res.status(500).json({ message: "Failed to create internship", error: e.message }); }
});

app.put("/api/admin/internships/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...internship.toObject(), id: internship._id.toString() });
  } catch (e) { res.status(500).json({ message: "Failed to update internship" }); }
});

app.delete("/api/admin/internships/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    await Internship.findByIdAndDelete(req.params.id);
    res.json({ message: "Internship deleted" });
  } catch (e) { res.status(500).json({ message: "Failed to delete internship" }); }
});

// Admin Quiz CRUD
app.post("/api/admin/quizzes", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ ...quiz.toObject(), id: quiz._id.toString() });
  } catch (e) { res.status(500).json({ message: "Failed to create quiz", error: e.message }); }
});

app.put("/api/admin/quizzes/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...quiz.toObject(), id: quiz._id.toString() });
  } catch (e) { res.status(500).json({ message: "Failed to update quiz" }); }
});

app.delete("/api/admin/quizzes/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Quiz deleted" });
  } catch (e) { res.status(500).json({ message: "Failed to delete quiz" }); }
});

app.put("/api/admin/applications/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    let app = await Application.findOne({ appNumber: req.params.id });
    if (!app && mongoose.Types.ObjectId.isValid(req.params.id)) {
      app = await Application.findById(req.params.id);
    }
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (req.body.offerLetterUrl !== undefined) app.offerLetterUrl = req.body.offerLetterUrl;
    if (req.body.certificateUrl !== undefined) app.certificateUrl = req.body.certificateUrl;
    await app.save();
    res.json({ message: "Application updated", application: { ...app.toObject(), id: app._id.toString() } });
  } catch (e) { res.status(500).json({ message: "Failed to update application" }); }
});

app.put("/api/admin/tasks/verify", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    let app = await Application.findOne({ appNumber: req.body.applicationId });
    if (!app && mongoose.Types.ObjectId.isValid(req.body.applicationId)) {
      app = await Application.findById(req.body.applicationId);
    }
    if (!app) return res.status(404).json({ message: "Application not found" });
    const task = app.tasks.find(t => t.id === req.body.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.status = req.body.status;
    task.feedback = req.body.feedback;
    await app.save();
    res.json({ message: "Task verified", updatedTasks: app.tasks });
  } catch (e) { res.status(500).json({ message: "Failed to verify task" }); }
});

app.get("/api/admin/quiz-applications", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const apps = await QuizApplication.find().sort({ _id: -1 });
    res.json(apps.map(app => ({ ...app.toObject(), id: app.appNumber || app._id.toString() })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch applications" }); }
});

app.put("/api/admin/quiz-applications/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    let app = await QuizApplication.findOne({ appNumber: req.params.id });
    if (!app && mongoose.Types.ObjectId.isValid(req.params.id)) {
      app = await QuizApplication.findById(req.params.id);
    }
    if (!app) return res.status(404).json({ message: "Quiz application not found" });
    app.certificateUrl = req.body.certificateUrl;
    await app.save();
    res.json({ message: "Quiz certificate updated", application: { ...app.toObject(), id: app._id.toString() } });
  } catch (e) { res.status(500).json({ message: "Failed to update quiz application" }); }
});


app.get("/api/dashboard/summary", authenticateToken, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user.id });
    let totalTasks = 0, completedTasks = 0;
    apps.forEach(app => app.tasks.forEach(t => { totalTasks++; if (t.status === "Approved") completedTasks++; }));
    res.json({ activeInternships: apps.filter(a => a.status === "In Progress").length, completedTasks, totalTasks, certificatesEarned: await Certificate.countDocuments({ userId: req.user.id }), taskProgressPercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 });
  } catch (e) { res.status(500).json({ message: "Failed to fetch dashboard" }); }
});

app.post("/api/send-email", async (req, res) => {
  const { type, studentName, studentEmail, internshipTitle, internshipDomain, appliedDate, submittedDate, paymentNote } = req.body;
  const gmailUser = process.env.GMAIL_USER, gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) return res.status(503).json({ message: "Email not configured." });
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: gmailUser, pass: gmailPass } });
  let subject, html;
  if (type === "apply") {
    subject = `New Application: ${studentName}`;
    html = `<div style="font-family:Arial;padding:24px"><h2>New Internship Application</h2><p><b>Name:</b> ${studentName}</p><p><b>Email:</b> ${studentEmail}</p><p><b>Internship:</b> ${internshipTitle}</p><p><b>Applied On:</b> ${appliedDate}</p></div>`;
  } else if (type === "final_submit") {
    subject = `Final Submit: ${studentName}`;
    html = `<div style="font-family:Arial;padding:24px"><h2>Final Submission Received</h2><p><b>Name:</b> ${studentName}</p><p><b>Internship:</b> ${internshipTitle}</p><p><b>Payment:</b> ${paymentNote}</p></div>`;
  } else return res.status(400).json({ message: "Invalid type." });
  try {
    await transporter.sendMail({ from: `"Skillzeno" <${gmailUser}>`, to: gmailUser, subject, html });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: "Email failed", error: err.message }); }
});

// --- Contest API Endpoints ---

// Get all contests (Admin)
app.get("/api/contests", async (req, res) => {
  try {
    const contests = await Contest.find().sort({ createdAt: -1 });
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contests", error: error.message });
  }
});

// Create new contest
app.post("/api/contests", async (req, res) => {
  try {
    const newContest = new Contest(req.body);
    await newContest.save();
    res.status(201).json({ message: "Contest created successfully!", contest: newContest });
  } catch (error) {
    res.status(500).json({ message: "Error creating contest", error: error.message });
  }
});

// Update contest
app.put("/api/contests/:id", async (req, res) => {
  try {
    const updatedContest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Contest updated successfully!", contest: updatedContest });
  } catch (error) {
    res.status(500).json({ message: "Error updating contest", error: error.message });
  }
});

// Delete contest
app.delete("/api/contests/:id", async (req, res) => {
  try {
    await Contest.findByIdAndDelete(req.params.id);
    res.json({ message: "Contest deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting contest", error: error.message });
  }
});

// Get active contests (Student)
app.get("/api/contests/active", async (req, res) => {
  try {
    const contests = await Contest.find({ isActive: true }).sort({ startTime: 1 });
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contests", error: error.message });
  }
});

// Register student for a contest
app.post("/api/contests/register", async (req, res) => {
  try {
    const { userId, contestId, studentName, studentEmail, mobileNumber, course, branch, semester, college, domain } = req.body;
    
    // Check if already registered
    const existingReg = await ContestRegistration.findOne({ userId, contestId });
    if (existingReg) {
      return res.status(400).json({ message: "You are already registered for this contest." });
    }
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found." });
    
    if (new Date() > new Date(contest.registrationEndTime)) {
      return res.status(400).json({ message: "Registration for this contest has already ended." });
    }

    const contestTitle = contest.title;

    const newReg = new ContestRegistration({
      userId, contestId, contestTitle, studentName, studentEmail, mobileNumber, course, branch, semester, college, domain
    });
    
    await newReg.save();
    
    // Update user profile with college if missing
    await User.findByIdAndUpdate(userId, { college });
    
    res.status(201).json({ message: "Successfully registered for the contest!", registration: newReg });
  } catch (error) {
    console.error("Contest Registration Error:", error);
    res.status(500).json({ 
      message: "Error registering for contest", 
      error: error.message 
    });
  }
});

// Get user's contest registrations
app.get("/api/contests/user-registrations/:userId", async (req, res) => {
  try {
    const registrations = await ContestRegistration.find({ userId: req.params.userId }).populate('contestId');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching registrations", error: error.message });
  }
});

// Get contest questions (Arena)
app.get("/api/contests/arena/:contestId/:userId", async (req, res) => {
  try {
    const { contestId, userId } = req.params;
    
    const registration = await ContestRegistration.findOne({ contestId, userId }).populate('contestId');
    if (!registration) return res.status(403).json({ message: "Not registered for this contest." });
    if (registration.hasTakenTest) return res.status(403).json({ message: "You have already completed this test." });
    if (!registration.contestId.isActive) return res.status(403).json({ message: "Contest is not active." });

    const numQuestions = registration.contestId.questionsPerStudent || 25;
    const domain = registration.domain;

    // Fetch random questions using $sample
    const questions = await QuestionBank.aggregate([
      { $match: { domain: { $regex: new RegExp(`^${domain}$`, 'i') } } },
      { $sample: { size: numQuestions } },
      { $project: { correctOptionIndex: 0 } } // Do not send correct answers to frontend
    ]);

    res.json({
      contest: registration.contestId,
      registration: registration,
      questions: questions
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching arena data", error: error.message });
  }
});

// Submit contest test
app.post("/api/contests/submit", async (req, res) => {
  try {
    const { userId, contestId, answers, timeTaken } = req.body;
    
    const registration = await ContestRegistration.findOne({ contestId, userId });
    if (!registration) return res.status(400).json({ message: "Registration not found." });
    if (registration.hasTakenTest) return res.status(400).json({ message: "Test already submitted." });

    let score = 0;
    // Calculate score server-side
    for (const [qId, selectedIndex] of Object.entries(answers)) {
      const q = await QuestionBank.findById(qId);
      if (q && q.correctOptionIndex === selectedIndex) {
        score += 1;
      }
    }

    registration.score = score;
    registration.timeTaken = timeTaken; // in seconds
    registration.hasTakenTest = true;
    await registration.save();
    
    // Send email to admin
    await sendAdminContestNotification(
      registration.studentName, 
      registration.studentEmail, 
      registration.contestTitle || "Contest", 
      registration.domain, 
      score
    );

    res.json({ message: "Test submitted successfully!", score });
  } catch (error) {
    res.status(500).json({ message: "Error submitting test", error: error.message });
  }
});

// Get contest leaderboard
app.get("/api/contests/leaderboard/:contestId", async (req, res) => {
  try {
    const { contestId } = req.params;
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const contestEndTime = new Date(new Date(contest.startTime).getTime() + contest.timeLimitMinutes * 60000);
    if (new Date() < contestEndTime) {
      return res.status(403).json({ 
        message: "Leaderboard will be generated after the contest ends.", 
        contestEndTime: contestEndTime.toISOString() 
      });
    }

    // Fetch all completed registrations, sorted by score (desc), then timeTaken (asc)
    const realStudents = await ContestRegistration.find({ contestId, hasTakenTest: true })
      .sort({ score: -1, timeTaken: 1 })
      .limit(3);

    const maxQ = contest.questionsPerStudent || 25;
    const maxT = (contest.timeLimitMinutes || 30) * 60;

    const baseDummyNames = [
      "Rahul Sharma", "Priya Singh", "Amit Kumar", "Neha Gupta", 
      "Rohan Verma", "Kavita Reddy", "Sanjay Das", "Vikram Singh", "Pooja Mehta"
    ];

    const upColleges = [
      "Rajkiya Engineering College, Azamgarh",
      "Rajkiya Engineering College, Banda",
      "Rajkiya Engineering College, Bijnor",
      "Rajkiya Engineering College, Kannauj",
      "Government Polytechnic, Lucknow",
      "Government Polytechnic, Kanpur",
      "JSS Academy of Technical Education, Noida",
      "KIET Group of Institutions, Ghaziabad",
      "Ajay Kumar Garg Engineering College, Ghaziabad",
      "ABES Engineering College, Ghaziabad",
      "GL Bajaj Institute of Technology, Greater Noida",
      "PSIT, Kanpur",
      "SRMS College of Engineering, Bareilly"
    ];

    const finalLeaderboard = [];
    let dummyIndex = 0;
    let realIndex = 0;
    const targetRanks = [3, 5, 8]; // Ranks where real students go (1-based)

    const totalSize = 7 + realStudents.length;

    for (let i = 1; i <= totalSize; i++) {
      if (targetRanks.includes(i) && realIndex < realStudents.length) {
        // --- REAL STUDENT SLOT ---
        const student = realStudents[realIndex];
        finalLeaderboard.push({
          rank: i,
          userId: student.userId.toString(),
          name: student.studentName,
          college: student.college,
          score: student.score,
          timeTaken: student.timeTaken,
          domain: student.domain,
          date: new Date(student.createdAt).toLocaleDateString(),
          registrationId: student._id.toString().substring(0, 8).toUpperCase(),
          isReal: true
        });
        realIndex++;
      } else {
        // --- DUMMY STUDENT SLOT ---
        let dummyScore, dummyTime;
        
        if (realStudents.length === 0) {
          // No real students at all, generate a believable descending list
          dummyScore = Math.max(0, maxQ - Math.floor(i / 2));
          dummyTime = 120 + (i * 25);
        } else if (realIndex < realStudents.length) {
          // Dummy is ABOVE the next real student
          const nextReal = realStudents[realIndex];
          const gap = targetRanks[realIndex] - i; // How many slots above the real student are we?
          
          dummyScore = nextReal.score;
          dummyTime = nextReal.timeTaken - (gap * 25);
          
          if (dummyTime < 30) {
            if (dummyScore < maxQ) {
              dummyScore += 1;
              dummyTime = nextReal.timeTaken + (gap * 15); // Higher score, so slower time is fine
            } else {
              dummyTime = Math.max(10, dummyTime); // Absolute minimum 10s if they both have max score
            }
          }
        } else {
          // Dummy is BELOW the last real student
          const lastReal = realStudents[realStudents.length - 1];
          const gap = i - targetRanks[realStudents.length - 1]; // How many slots below the real student?
          
          dummyScore = Math.max(0, lastReal.score - Math.floor((gap + 1) / 2));
          dummyTime = lastReal.timeTaken + (gap * 35);
        }

        const dummyName = baseDummyNames[dummyIndex % baseDummyNames.length];
        const dummyCollege = upColleges[Math.floor(Math.random() * upColleges.length)];
        
        finalLeaderboard.push({
          rank: i,
          userId: null,
          name: dummyName,
          college: dummyCollege,
          score: dummyScore,
          timeTaken: dummyTime,
          domain: "General",
          date: new Date().toLocaleDateString(),
          registrationId: "DUMMY" + Math.floor(Math.random() * 10000),
          isReal: false
        });
        dummyIndex++;
      }
    }

    // Guarantee strictly correct ordering based on actual score and time
    finalLeaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    });

    // Re-assign ranks
    finalLeaderboard.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    res.json(finalLeaderboard);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
  }
});

// Delete all questions for a specific domain
app.delete("/api/contests/questions/:domain", async (req, res) => {
  try {
    const { domain } = req.params;
    const result = await QuestionBank.deleteMany({ domain });
    res.json({ message: `Successfully deleted ${result.deletedCount} questions for domain: ${domain}` });
  } catch (error) {
    console.error("Delete Questions Error:", error);
    res.status(500).json({ message: "Error deleting questions", error: error.message });
  }
});

// Bulk upload questions (JSON parsed from Excel on Frontend)
app.post("/api/contests/upload-questions", async (req, res) => {
  try {
    const { questions, domain } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid questions format" });
    }
    
    // Validate format before inserting
    const formattedQuestions = questions.map(q => ({
      domain: domain || q.domain,
      question: q.question,
      options: q.options || [q.option1, q.option2, q.option3, q.option4].filter(Boolean),
      correctOptionIndex: parseInt(q.correctOptionIndex) || 0,
      difficulty: q.difficulty || 'Medium'
    }));
    
    await QuestionBank.insertMany(formattedQuestions);
    res.json({ message: `${formattedQuestions.length} questions uploaded successfully for ${domain || 'mixed domains'}` });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ 
      message: `Error uploading questions: ${error.message}`, 
      error: error.message 
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
