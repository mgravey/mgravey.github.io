const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const sourceRoot = path.join(root, "assets/source-images");
const outputRoot = path.join(root, "assets/generated");
const backgroundTarget = 500 * 1024;
const portraitTarget = 250 * 1024;

const backgrounds = [
  "4student.jpg",
  "ThinkingDifferently2.png",
  "berezina.jpg",
  "bocalDEtoile.jpg",
  "code.jpg",
  "contact.jpg",
  "experience.png",
  "review.png",
  "starSky.jpg",
  "why-i-email.png"
];

async function encodeWithinLimit(input, output, maxDimension, limit) {
  const attempts = [
    { dimension: maxDimension, quality: 80 },
    { dimension: Math.round(maxDimension * 0.88), quality: 72 },
    { dimension: Math.round(maxDimension * 0.76), quality: 66 },
    { dimension: Math.round(maxDimension * 0.64), quality: 60 },
    { dimension: Math.round(maxDimension * 0.55), quality: 54 }
  ];

  for (const attempt of attempts) {
    await sharp(input)
      .rotate()
      .resize(attempt.dimension, attempt.dimension, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: attempt.quality, effort: 5 })
      .toFile(output);
    const { size } = await fs.stat(output);
    if (size <= limit) return size;
  }

  const { size } = await fs.stat(output);
  throw new Error(`${path.relative(root, output)} is ${Math.round(size / 1024)} KB; limit is ${Math.round(limit / 1024)} KB`);
}

async function main() {
  await fs.mkdir(path.join(outputRoot, "background"), { recursive: true });
  for (const filename of backgrounds) {
    const source = path.join(sourceRoot, "background", filename);
    const output = path.join(outputRoot, "background", `${path.parse(filename).name}.webp`);
    const size = await encodeWithinLimit(source, output, 2200, backgroundTarget);
    console.log(`${path.relative(root, output)} ${Math.round(size / 1024)} KB`);
  }

  for (const filename of ["MathieuGravey_current.png", "MathieuGravey_old.jpg"]) {
    const source = path.join(sourceRoot, filename);
    const output = path.join(outputRoot, `${path.parse(filename).name}.webp`);
    const size = await encodeWithinLimit(source, output, 900, portraitTarget);
    console.log(`${path.relative(root, output)} ${Math.round(size / 1024)} KB`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
