import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "canvas";

// 背景となる画像を読み込む
// canvasに背景の上からタイトル,名前をレンダリングする
// レンダリング結果をimageにしてpublic配下に保存する
const size = {
  width: 1200,
  height: 630,
};

const titleBox = {
  width: 1075,
  height: 250,
  x: 65,
  y: 150,
};

const generateOGPImage = async (
  title: string,
  fileName: string,
  debug: boolean = false
) => {
  const canvas = createCanvas(size.width, size.height);
  const ctx = canvas.getContext("2d");

  const backgroundImage = path.resolve(__dirname, "../public/og/template.png");
  const image = await loadImage(backgroundImage);

  ctx.drawImage(image, 0, 0, size.width, size.height);

  // デバッグモード時にtitleBoxを描画
  if (debug) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(titleBox.x, titleBox.y, titleBox.width, titleBox.height);
  }

  const cleanTitle = title.replace(/<[^>]*>?/g, "");
  const fontSize = 60;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";

  // テキストを折り返して配列にする関数
  const wrapText = (text: string, maxWidth: number): string[] => {
    if (!text) return [""];

    let lines: string[] = [];
    let currentLine = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const testLine = currentLine + char;
      const width = ctx.measureText(testLine).width;

      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = char;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    if (lines.length === 0) {
      lines = [text];
    }

    return lines;
  };

  // テキストを2行に制限し、必要な場合は省略する
  const truncateToTwoLines = (lines: string[]): string[] => {
    if (!lines || lines.length === 0) return [""];
    if (lines.length <= 2) return lines;

    const result = lines.slice(0, 2);
    if (result[1] && result[1].length > 3) {
      result[1] = result[1].slice(0, -3) + "...";
    }
    return result;
  };

  const lines = truncateToTwoLines(wrapText(cleanTitle, titleBox.width));

  // 各行を描画
  const totalHeight = lines.length * fontSize * 1.2; // 全テキストの高さ
  const startY = titleBox.y + (titleBox.height - totalHeight) / 2; // 開始Y位置を中央に調整

  lines.forEach((line, index) => {
    const x = titleBox.x; // 左端から開始
    const y = startY + index * fontSize * 1.2 + fontSize / 2; // Y位置を調整
    ctx.fillText(line, x, y, titleBox.width);
  });

  return canvas.toBuffer("image/png");
};

export { generateOGPImage };
