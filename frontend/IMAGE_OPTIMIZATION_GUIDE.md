# Image Optimization Guide for VinVerse

## Quick Wins

### 1. Compress Existing Images
- Use [Squoosh](https://squoosh.app/) to compress images
- Target: < 200KB for hero images, < 100KB for thumbnails
- Quality: 80-85% for photos, 100% for logos/graphics

### 2. Convert to WebP
- Use WebP format for better compression (30-50% smaller than JPEG)
- Provide fallback for older browsers:
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

### 3. Use Responsive Images
```html
<img 
  src="image-800w.jpg"
  srcset="image-400w.jpg 400w, image-800w.jpg 800w, image-1200w.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Description"
  loading="lazy"
/>
```

### 4. Lazy Load Below-the-Fold Images
- Add `loading="lazy"` to images below the fold
- Preload critical images (hero images) with `<link rel="preload">`

### 5. Use SVG for Icons
- Use SVG for icons, logos, and simple graphics
- Inline small SVGs for faster loading
- Optimize SVGs with SVGO

## Recommended Tools

1. **Squoosh** (https://squoosh.app/) - Online image compression
2. **ImageOptim** - Mac app for batch optimization
3. **TinyPNG** - Online batch compression
4. **SVGO** - SVG optimization
5. **Cloudinary/Imgix** - CDN with automatic optimization

## Implementation Checklist

- [ ] Compress all existing images
- [ ] Convert images to WebP format
- [ ] Add responsive image srcsets
- [ ] Implement lazy loading for below-the-fold images
- [ ] Add proper alt text to all images
- [ ] Use SVG for icons and logos
- [ ] Set up CDN for image delivery (optional but recommended)

