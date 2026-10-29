import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

async function createZip() {
  const outputDir = path.resolve('public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const zipPath = path.join(outputDir, 'SamirPay-Android-Project.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = new archiver.ZipArchive({
    zlib: { level: 9 }, // Maximum compression
  });

  return new Promise<void>((resolve, reject) => {
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
      console.log(`[ZIP Success] Generated: ${zipPath}`);
      console.log(`[ZIP Size] ${archive.pointer()} total bytes (${sizeInMB} MB)`);
      resolve();
    });

    archive.on('warning', (err: any) => {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err: any) => {
      reject(err);
    });

    archive.pipe(output);

    const rootDir = path.resolve('.');

    // Explicitly add directories
    const dirsToInclude = ['android', 'src', 'public', 'scripts', '.github'];
    dirsToInclude.forEach((dir) => {
      const fullPath = path.join(rootDir, dir);
      if (fs.existsSync(fullPath)) {
        archive.directory(fullPath, dir, (entry: any) => {
          // Do not include the generated zip inside the zip
          if (entry.name.endsWith('.zip')) {
            return false;
          }
          return entry;
        });
      }
    });

    // Explicitly add root files
    const rootFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'capacitor.config.ts',
      'capacitor.config.json',
      'index.html',
      'server.ts',
      '.env.example',
      '.gitignore',
      'metadata.json',
    ];

    rootFiles.forEach((file) => {
      const fullPath = path.join(rootDir, file);
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: file });
      }
    });

    archive.finalize();
  });
}

createZip()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to create project ZIP:', err);
    process.exit(1);
  });
