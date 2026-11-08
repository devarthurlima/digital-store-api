const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const UPLOADS_DIR = path.resolve(__dirname, "..", "..", "public", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function saveBase64Image(content, type = "image/jpeg") {
  if (!content) return null;

  if (content.startsWith("http://") || content.startsWith("https://")) {
    return content;
  }

  const base64Data = content.replace(/^data:image\/\w+;base64,/, "");

  let extension = "jpg";
  if (type.includes("png")) extension = "png";
  if (type.includes("webp")) extension = "webp";
  if (type.includes("jpeg") || type.includes("jpg")) extension = "jpg";

  const fileName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${extension}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${fileName}`;
}

module.exports = {
  saveBase64Image,
};
