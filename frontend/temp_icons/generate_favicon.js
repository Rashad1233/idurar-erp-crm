const fs = require('fs');
const { createCanvas } = require('canvas');

async function generateFavicon() {
  // Create a 32x32 canvas (standard favicon size)
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');

  // Set background to blue (#1890ff - matching MimiApp blue color)
  ctx.fillStyle = '#1890ff';
  ctx.fillRect(0, 0, 32, 32);

  // Set up text styling
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw the "M" in the center
  ctx.fillText('M', 16, 16);

  // Convert to PNG buffer
  const pngBuffer = canvas.toBuffer('image/png');
  
  // Write to file
  fs.writeFileSync('../public/favicon.ico', pngBuffer);
  fs.writeFileSync('../src/favicon.ico', pngBuffer);
  
  console.log('Favicon generated successfully!');
}

generateFavicon().catch(console.error);
