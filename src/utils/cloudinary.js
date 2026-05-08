import apiRequest from '../config/api';

/**
 * Helper function to convert data URL to File
 * @param {string} dataUrl - The base64 data URL (e.g., "data:image/png;base64,iVBORw0KG...")
 * @param {string} filename - The desired filename for the file
 * @returns {File} - A File object created from the data URL
 */
export const dataURLtoFile = (dataUrl, filename) => {
  // Split the data URL into header and base64 data
  const [header, base64Data] = dataUrl.split(',');

  // Extract the MIME type from the header (e.g., "image/png")
  const mimeType = header.match(/:(.*?);/)[1];

  // Decode base64 data to binary string
  const binaryString = atob(base64Data);

  // Convert binary string to Uint8Array
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }

  // Create and return a File object
  return new File([byteArray], filename, { type: mimeType });
};

/**
 * Upload base64 images to Cloudinary and replace them with Cloudinary URLs
 * @param {string} content - HTML content with base64 images
 * @param {function} showSnackbar - Snackbar notification function
 * @returns {Promise<string>} - Processed content with Cloudinary URLs
 */

/**
 * Upload a single file to Cloudinary (for avatars, space images, etc.)
 * @param {File} file - The file to upload
 * @param {function} showSnackbar - Snackbar notification function
 * @param {string} fieldName - The field name for the upload (default: 'avatar')
 * @returns {Promise<{url: string, publicId: string}>} - Upload result
 */
export const uploadSingleFileToCloudinary = async (file, showSnackbar, fieldName = 'avatar') => {
  try {
    // Validate file size (5MB limit for avatars)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('File size must be less than 5MB', 'error');
      throw new Error('File size too large');
    }
    
    const formData = new FormData();
    formData.append(fieldName, file);
    
    const response = await apiRequest('/api/cloudinary/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      showSnackbar(result.message, 'success');
      return {
        url: result.url,
        publicId: result.publicId
      };
    } else {
      showSnackbar(result.message, 'error');
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    
    // Specific handling for connection errors
    if (error.message.includes('Connection ended unexpectedly') || 
        error.message.includes('Network') || 
        error.name === 'TypeError') {
      showSnackbar('Network error - please check your connection and try again', 'error');
    } else {
      showSnackbar('Failed to upload file', 'error');
    }
    
    throw error;
  }
};

export const uploadImagesToCloudinary = async (content, showSnackbar) => {
  let processedContent = content;
  let match;

  const imgRegex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/g;
  const images = [];

  // Extract all base64 images from content
  while ((match = imgRegex.exec(content)) !== null) {
    images.push({
      fullMatch: match[0],
      mimeType: match[1],
      base64Data: match[2]
    });
  }

  // Upload each image to Cloudinary
  for (const image of images) {
    try {
      const file = dataURLtoFile(`data:image/${image.mimeType};base64,${image.base64Data}`, `image.${image.mimeType}`);

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        console.error('Image too large:', file.size / 1024 / 1024, 'MB');
        showSnackbar('Image too large. Maximum size is 10MB', 'error');
        return content; // Return original content on error
      }

      const formData_img = new FormData();
      formData_img.append('image', file);

      const response = await apiRequest('/api/cloudinary/upload_editor_image', {
        method: 'POST',
        body: formData_img
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Replace base64 URL with Cloudinary URL
        processedContent = processedContent.replace(image.fullMatch, `<img src="${result.url}" />`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  return processedContent;
};

