require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const connectDB = require("./config/db");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdfParse = require("pdf-parse");

// Routes
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { protect } = require("./middlewares/authMiddleware");

// Controllers
const {
  generateConceptExplanation,
  generateInterviewQuestions,
} = require("./controllers/aiController");

// Resume analysis prompts & utils
const { analyzePrompt, improvePrompt, matchPrompt } = require("./utils/prompts");
const { pdfFirstPageToBase64 } = require("./utils/pdf");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));

// DB Connection
connectDB();

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer for file upload
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Google Gemini API initialization
if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ Missing GOOGLE_API_KEY in .env");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Helper: call Gemini (text + image)
async function getGeminiResponse({ prompt, jobDesc, imageBase64DataUrl }) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const parts = [
    { text: jobDesc || "" },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64DataUrl.split(",")[1], // Remove prefix
      },
    },
    { text: prompt },
  ];
  const result = await model.generateContent(parts);
  return result.response.text();
}

// Extract "Match Percentage: XX%"
function extractMatchPercentage(text) {
  const patterns = [
    /Match Percentage:\s*(\d+)%/i,
    /Match Percentage\s*:\s*(\d+)%/i,
    /(\d+)%\s*(?:match|Match)/,
    /Match:\s*(\d+)%/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return Math.max(0, Math.min(100, parseInt(m[1], 10)));
  }
  const num = (text.match(/\b(\d{1,2}|100)\b/) || [])[1];
  if (num) return Math.max(0, Math.min(100, parseInt(num, 10)));
  return 0;
}

// -------------------- Routes --------------------

// Existing Routes
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/ai/questions", questionRoutes);
app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);

app.use('/api/questions', require('./routes/questions'));
app.use('/api/test-results', require('./routes/testResults'));

app.get('/', (req, res) => {
  res.json({ message: 'Adaptive Testing API is running!' });
});


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- Resume Analysis Routes --------------------

async function extractPdfText(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parsed = await pdfParse(dataBuffer);
    return parsed && parsed.text ? parsed.text.trim() : "";
  } catch (err) {
    console.error("PDF parse error:", err);
    return "";
  }
}

async function analyzeResumeRoute(req, res, promptType, isMatchRoute = false) {
  try {
    const jobDescription = req.body.jobDescription || "";
    if (!req.file) return res.status(400).json({ error: "Resume PDF is required." });

    const pdfPath = req.file.path;

    // Extract text from PDF
    const resumeText = await extractPdfText(pdfPath);
   // console.log(resumeText);
    // Generate preview image
    const { dataUrl, generatedPath } = await pdfFirstPageToBase64(pdfPath);

    // Decide prompt content
    const promptContent = resumeText && resumeText.length > 0
      ? jobDescription + "\nResume:\n" + resumeText
      : jobDescription;
    //console.log(promptContent);
    const response = await getGeminiResponse({
      prompt: promptType,
      jobDesc: promptContent,
      imageBase64DataUrl: dataUrl,
    });
    let matchPercentage = null;
    if (isMatchRoute) {
      matchPercentage = extractMatchPercentage(response);
    
    }

    // Cleanup
    try { fs.unlinkSync(pdfPath); } catch {}
    try { fs.unlinkSync(generatedPath); } catch {}

    // Construct response
    const resultObj = {
      result: response,
      previewImage: dataUrl,
    };
    if (isMatchRoute && matchPercentage !== null) {
      resultObj.matchPercentage = matchPercentage; // include 0 if match
    }

    res.json(resultObj);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Internal server error" });
  }
}

// POST /analyze
app.post("/analyze", upload.single("resume"), (req, res) =>
  analyzeResumeRoute(req, res, analyzePrompt)
);

// POST /improve
app.post("/improve", upload.single("resume"), (req, res) =>
  analyzeResumeRoute(req, res, improvePrompt)
);

// POST /match
app.post("/match", upload.single("resume"), (req, res) =>
  analyzeResumeRoute(req, res, matchPrompt, true) // <--- pass true
);

// Health Check
app.get("/", (_req, res) => res.send("Interview Prep AI API is running."));

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
