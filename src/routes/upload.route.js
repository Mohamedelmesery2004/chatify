import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { arjectProtect } from "../lib/arcjet.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (_req, file, cb) => {
 
    cb(null, true);
  }
});

router.use(arjectProtect, protectedRoute);

// POST /api/upload
router.post("/", upload.any(), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, data: [{ msg: "No files uploaded" }] });
  }
  const file = req.files[0]; // Take the first file
  const fileName = file.filename;
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
  const info = {
    ok: true,
    url: fileUrl,
    type: file.mimetype,
    size: file.size,
    name: file.originalname,
  };
  return res.status(201).json({ success: true, data: [info] });
});

export default router;
