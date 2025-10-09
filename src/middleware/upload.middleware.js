import multer from "multer";

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowed = ["image/", "video/"];
  if (allowed.some((p) => file.mimetype.startsWith(p))) return cb(null, true);
  cb(new Error("Only image and video files are allowed"));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});
