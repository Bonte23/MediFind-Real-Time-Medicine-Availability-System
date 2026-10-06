// Script to generate PWA icons from the generated image
import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Copy the generated icon as-is for both sizes (the PWA will use them)
// The generated icon is already high-res enough
const srcPath = resolve('C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\3cd08f5c-257e-4e23-8737-cf47313e5aee\\pwa_icon_1790855501326.jpg');
const dest512 = resolve(__dirname, 'public', 'icon-512x512.png');
const dest192 = resolve(__dirname, 'public', 'icon-192x192.png');

copyFileSync(srcPath, dest512);
copyFileSync(srcPath, dest192);

console.log('Icons copied to public/');
