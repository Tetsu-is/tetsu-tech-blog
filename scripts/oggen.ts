import path from "path";
import fs from "fs";
import { CanvasRenderingContext2D, createCanvas, loadImage } from "canvas";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.resolve(__dirname, "../../..");

const size = {
  width: 1200,
  height: 630,
};

const fontSize = 70;

const titleBox = {
  width: 1075,
  height: fontSize * 2,
  x: 65,
  y: 75 + 100,
};

type Args = {
  fileName: string;
  title: string;
};

const setDebugTitleBox = (ctx: CanvasRenderingContext2D, color: string) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(titleBox.x, titleBox.y, titleBox.width, titleBox.height);
  ctx.moveTo(titleBox.x, titleBox.y + titleBox.height / 2);
  ctx.lineTo(titleBox.x + titleBox.width, titleBox.y + titleBox.height / 2);
  ctx.stroke();
};

const saveImageToPath = (
  buffer: Buffer,
  fileName: string,
  outputDir: string
) => {
  const outputPath = path.join(projectRoot, outputDir, "og");
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const fullPath = path.join(outputPath, `${fileName}.png`);
  const absoluteOutputPath = path.resolve(fullPath);
  fs.writeFileSync(absoluteOutputPath, new Uint8Array(buffer));
  console.log(`Saved image to: ${absoluteOutputPath}`);
};

export const generateOgImage = async ({
  fileName,
  title,
}: Args): Promise<void> => {
  /// create canvas
  const canvas = createCanvas(size.width, size.height);
  const ctx = canvas.getContext("2d");

  /// load background image
  const backgroundImage = path.join(projectRoot, "public/og/template.png");
  if (!fs.existsSync(backgroundImage)) {
    throw new Error(`Template image not found at: ${backgroundImage}`);
  }
  const image = await loadImage(backgroundImage);
  ctx.drawImage(image, 0, 0, size.width, size.height);

  // setDebugTitleBox(ctx, "gray");

  /// draw title
  const cleanTitle = title.replace(/<[^>]*>?/g, "");
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = "white";

  const lines: string[] = [];

  let currentLine = "";

  for (const rune of cleanTitle) {
    const newLine = currentLine + rune;
    const newLineWidth = ctx.measureText(newLine).width;
    if (newLineWidth > titleBox.width) {
      lines.push(currentLine);
      currentLine = rune;
    } else {
      currentLine = newLine;
    }
  }
  lines.push(currentLine);

  lines.forEach((line, index) => {
    ctx.fillText(
      line,
      titleBox.x,
      titleBox.y + fontSize * (index + 1),
      titleBox.width
    );
  });

  const generated = canvas.toBuffer("image/png");

  // Save to both directories
  saveImageToPath(generated, fileName, "public");
  saveImageToPath(generated, fileName, "dist");
};
