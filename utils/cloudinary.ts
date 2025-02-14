export const getOptimizedImageUrl = (url: string, width: number = 400) => {
  if (!url) return '/placeholder-service.jpg';
  
  // Check if it's a Cloudinary URL
  if (url.includes('cloudinary.com')) {
    // Parse the existing URL
    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) return url;

    // Add optimization parameters
    return `${urlParts[0]}/upload/w_${width},c_fill,q_auto,f_auto/${urlParts[1]}`;
  }

  return url;
}; 