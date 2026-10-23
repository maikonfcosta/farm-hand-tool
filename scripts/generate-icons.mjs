import sharp from 'sharp';
for(const size of [192,512]) await sharp('public/icons/icon.svg').resize(size,size).png().toFile(`public/icons/icon-${size}.png`);
await sharp('public/icons/icon.svg').resize(512,512).png().toFile('public/icons/maskable-512.png');
