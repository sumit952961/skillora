import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Skillzeno API is running successfully!" }));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" }
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
  tasks: [{ id: String, title: String, status: { type: String, default: "Pending" }, submissionLink: { type: String, default: "" }, feedback: { type: String, default: "" } }],
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

const User = mongoose.model("User", userSchema);
const Application = mongoose.model("Application", applicationSchema);
const QuizApplication = mongoose.model("QuizApplication", quizApplicationSchema);
const Certificate = mongoose.model("Certificate", certificateSchema);
const Internship = mongoose.model("Internship", internshipSchema);
const Quiz = mongoose.model("Quiz", quizSchema);

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skillzeno")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB failed:", err.message));

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Token Required" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token Invalid or Expired" });
    req.user = user; next();
  });
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
    const token = jwt.sign({ id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (e) { res.status(500).json({ message: "Registration failed", error: e.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Incorrect password" });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: "Login failed", error: e.message }); }
});

app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) { res.status(500).json({ message: "Failed to fetch profile" }); }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = await bcrypt.hash(req.body.newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (e) { res.status(500).json({ message: "Failed to reset password" }); }
});

app.get("/api/auth/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch users" }); }
});

// INTERNSHIP ROUTES
app.get("/api/internships", async (req, res) => {
  try {
    const internships = await Internship.find();
    res.json(internships.map(i => ({ ...i.toObject(), id: i._id.toString() })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch internships" }); }
});

app.get("/api/my-internships", authenticateToken, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user.id });
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

app.post("/api/internships/final-submit", authenticateToken, async (req, res) => {
  try {
    const app = await Application.findOne({ userId: req.user.id, internshipId: req.body.internshipId });
    if (!app) return res.status(404).json({ message: "Application not found" });
    app.finalSubmitted = true;
    app.paymentDetails = req.body.paymentDetails;
    await app.save();
    res.json({ message: "Final submit successful!", application: { ...app.toObject(), id: app._id.toString() } });
  } catch (e) { res.status(500).json({ message: "Final submit failed" }); }
});

app.post("/api/tasks/submit", authenticateToken, async (req, res) => {
  try {
    const app = await Application.findOne({ userId: req.user.id, internshipId: req.body.internshipId });
    if (!app) return res.status(404).json({ message: "Application not found" });
    const task = app.tasks.find(t => t.id === req.body.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.status = "Submitted"; task.submissionLink = req.body.submissionLink; task.feedback = "Under Review";
    await app.save();
    res.json({ message: "Task submitted!", updatedTasks: app.tasks });
  } catch (e) { res.status(500).json({ message: "Failed to submit task" }); }
});

// QUIZ ROUTES
app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes.map(q => ({ ...q.toObject(), id: q._id.toString() })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch quizzes" }); }
});

app.get("/api/my-quizzes", authenticateToken, async (req, res) => {
  try {
    const apps = await QuizApplication.find({ userId: req.user.id });
    res.json(apps.map(app => ({ ...app.toObject(), id: app._id.toString() })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch quizzes" }); }
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
    qApp.paymentSubmitted = true;
    qApp.paymentDetails = req.body.paymentDetails;
    await qApp.save();
    res.json({ message: "Payment processed!", application: { ...qApp.toObject(), id: qApp._id.toString() } });
  } catch (e) { res.status(500).json({ message: "Payment failed" }); }
});


// ADMIN ROUTES
app.get("/api/admin/applications", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const apps = await Application.find();
    const internships = await Internship.find();
    res.json(apps.map(app => ({ 
      ...app.toObject(), 
      id: app.appNumber, 
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
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (req.body.offerLetterUrl !== undefined) app.offerLetterUrl = req.body.offerLetterUrl;
    if (req.body.certificateUrl !== undefined) app.certificateUrl = req.body.certificateUrl;
    await app.save();
    res.json({ message: "Application updated", application: { ...app.toObject(), id: app._id.toString() } });
  } catch (e) { res.status(500).json({ message: "Failed to update application" }); }
});

app.put("/api/admin/tasks/verify", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const app = await Application.findById(req.body.applicationId);
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
    const apps = await QuizApplication.find();
    res.json(apps.map(app => ({ ...app.toObject(), id: app.appNumber })));
  } catch (e) { res.status(500).json({ message: "Failed to fetch applications" }); }
});

app.put("/api/admin/quiz-applications/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const app = await QuizApplication.findById(req.params.id);
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
