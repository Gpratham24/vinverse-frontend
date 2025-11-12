/**
 * Image Optimization Utilities
 * 
 * Guidelines for image optimization:
 * 1. Use WebP format for better compression
 * 2. Provide multiple sizes for responsive images
 * 3. Use lazy loading for below-the-fold images
 * 4. Compress images before uploading
 * 
 * Recommended tools:
 * - Squoosh (https://squoosh.app/) for compression
 * - ImageOptim or TinyPNG for batch processing
 * - Use srcset for responsive images
 */

/**
 * Generate responsive image srcset
 * @param {string} baseUrl - Base image URL
 * @param {number[]} sizes - Array of widths (e.g., [400, 800, 1200])
 * @returns {string} srcset string
 */
export const generateSrcSet = (baseUrl, sizes = [400, 800, 1200, 1920]) => {
  return sizes
    .map((size) => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
};

/**
 * Get optimized image URL with WebP format
 * @param {string} url - Original image URL
 * @param {number} width - Desired width
 * @param {number} quality - Quality (1-100, default: 80)
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (url, width, quality = 80) => {
  // If using a CDN like Cloudinary, Imgix, or similar:
  // return `${url}?w=${width}&q=${quality}&f=webp`;
  
  // For local images, ensure they're optimized and use WebP
  // This is a placeholder - implement based on your image hosting solution
  return url;
};

/**
 * Lazy load image component props
 * @returns {object} Props for lazy loading
 */
export const getLazyLoadProps = () => {
  return {
    loading: 'lazy',
    decoding: 'async',
  };
};

/**
 * Image optimization checklist:
 * 
 * 1. Format:
 *    - Use WebP for modern browsers (with JPEG/PNG fallback)
 *    - Use SVG for icons and logos
 *    - Use AVIF for even better compression (if supported)
 * 
 * 2. Sizing:
 *    - Serve appropriately sized images (not larger than needed)
 *    - Use srcset for responsive images
 *    - Consider device pixel ratio (2x for retina displays)
 * 
 * 3. Compression:
 *    - Aim for 80-85% quality for photos
 *    - Use lossless compression for graphics/logos
 *    - Target file sizes: < 200KB for hero images, < 100KB for thumbnails
 * 
 * 4. Loading:
 *    - Use lazy loading for below-the-fold images
 *    - Preload critical images (hero images)
 *    - Use placeholder/blur-up technique
 * 
 * 5. CDN:
 *    - Use a CDN for image delivery
 *    - Enable automatic format conversion (WebP, AVIF)
 *    - Use responsive image service (Cloudinary, Imgix, etc.)
 */

