import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { generateOGPImage } from "./og_image_generator";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");
const OUTPUT_DIR = path.join(process.cwd(), "public/og");

async function generateAllOGImages() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read all markdown files from the blog directory
  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".md"));

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(content);
    const title = data.title;

    if (!title) {
      console.warn(`No title found for ${file}, skipping...`);
      continue;
    }

    const outputFileName = file.replace(".md", ".png");
    const image = await generateOGPImage(title, outputFileName);
    const outputPath = path.join(OUTPUT_DIR, outputFileName);

    fs.writeFileSync(outputPath, new Uint8Array(image));
    console.log(`Generated OG image for: ${file}`);
  }
}

// Execute the generation
generateAllOGImages().catch(console.error);
