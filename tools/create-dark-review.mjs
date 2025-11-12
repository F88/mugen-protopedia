import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const darkIconsDir = '/tmp/dark-icons';
const brightIconsDir = '/home/runner/work/mugen-protopedia/mugen-protopedia/public/icons';

async function createDarkIconReview() {
  const files = (await readdir(darkIconsDir)).filter(f => f.endsWith('.png') && !f.includes('maskable')).sort((a, b) => {
    const sizeA = parseInt(a.match(/\d+/)?.[0] || '0');
    const sizeB = parseInt(b.match(/\d+/)?.[0] || '0');
    return sizeA - sizeB;
  });
  
  // Create a comparison grid showing dark icons
  const iconSize = 128;
  const cols = 4;
  const rows = Math.ceil(files.length / cols);
  const padding = 10;
  const labelHeight = 20;
  const width = cols * (iconSize + padding) + padding;
  const height = rows * (iconSize + padding + labelHeight) + padding;
  
  const composites = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (iconSize + padding) + padding;
    const y = row * (iconSize + padding + labelHeight) + padding;
    
    // Add dark icon
    const darkResized = await sharp(join(darkIconsDir, file))
      .resize(iconSize, iconSize, { fit: 'contain', background: { r: 240, g: 240, b: 240, alpha: 1 } })
      .toBuffer();
    
    composites.push({
      input: darkResized,
      top: y,
      left: x
    });
  }
  
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite(composites)
  .png()
  .toFile('/tmp/dark-icons-grid.png');
  
  console.log('Created dark icons grid at /tmp/dark-icons-grid.png');
  
  // Create maskable icons comparison
  const maskableFiles = (await readdir(darkIconsDir)).filter(f => f.includes('maskable')).sort();
  
  if (maskableFiles.length > 0) {
    const maskableComposites = [];
    const maskableWidth = maskableFiles.length * (iconSize + padding) + padding;
    const maskableHeight = iconSize + 2 * padding;
    
    for (let i = 0; i < maskableFiles.length; i++) {
      const file = maskableFiles[i];
      const x = i * (iconSize + padding) + padding;
      
      const resized = await sharp(join(darkIconsDir, file))
        .resize(iconSize, iconSize, { fit: 'contain', background: { r: 240, g: 240, b: 240, alpha: 1 } })
        .toBuffer();
      
      maskableComposites.push({
        input: resized,
        top: padding,
        left: x
      });
    }
    
    await sharp({
      create: {
        width: maskableWidth,
        height: maskableHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite(maskableComposites)
    .png()
    .toFile('/tmp/dark-maskable-grid.png');
    
    console.log('Created dark maskable icons grid at /tmp/dark-maskable-grid.png');
  }
  
  // Create side-by-side comparison
  const comparisonIcon = 'icon-192x192.png';
  const darkIcon = await sharp(join(darkIconsDir, comparisonIcon))
    .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();
  
  const brightIcon = await sharp(join(brightIconsDir, comparisonIcon))
    .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();
  
  await sharp({
    create: {
      width: 542,
      height: 276,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([
    { input: darkIcon, top: 10, left: 10 },
    { input: brightIcon, top: 10, left: 276 }
  ])
  .png()
  .toFile('/tmp/side-by-side-comparison.png');
  
  console.log('Created side-by-side comparison at /tmp/side-by-side-comparison.png');
}

createDarkIconReview().catch(console.error);
