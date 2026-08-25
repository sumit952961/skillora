import mongoose from 'mongoose';

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
  status: { type: String, default: 'active' },
  tasks: [{ id: String, title: String, description: String }]
}, { timestamps: true });

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

const Internship = mongoose.model("Internship", internshipSchema);
const Contest = mongoose.model("Contest", contestSchema);

const MONGODB_URI = "mongodb+srv://sumitkumarpatel81814481_db_user:ZdGYdLobMikFX4Vr@cluster0.yoa8duy.mongodb.net/internship-portal?appName=Cluster0";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const internships = [
      {
        title: "Full Stack Web Development",
        department: "Engineering",
        domain: "Web Development",
        duration: "4",
        type: "Internship",
        description: "Build full stack applications using React and Node.js",
        status: "active"
      },
      {
        title: "Machine Learning & AI",
        department: "Data Science",
        domain: "Artificial Intelligence",
        duration: "6",
        type: "Internship",
        description: "Work on cutting-edge ML models and computer vision tasks",
        status: "active"
      }
    ];

    const contests = [
      {
        title: "SkillZeno Codefest 2026",
        description: "A 24-hour hackathon for all SkillZeno interns. Solve complex algorithmic challenges and win exciting prizes!",
        domains: ["Web Development", "Data Structures"],
        startTime: new Date(Date.now() + 86400000), // starts tomorrow
        registrationEndTime: new Date(Date.now() + 43200000), // ends in 12 hours
        isActive: true,
        timeLimitMinutes: 120,
        questionsPerStudent: 5
      }
    ];

    // Clear existing (if any) and insert new
    await Internship.deleteMany({});
    await Contest.deleteMany({});

    await Internship.insertMany(internships);
    await Contest.insertMany(contests);

    console.log("Successfully seeded database with sample data!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed", error);
    process.exit(1);
  }
}

seed();
