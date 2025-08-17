/**
 * Generates a filename with random ID and subcategory name
 * Format: {randomId}_{subcategoryName}.{extension}
 * 
 * @param originalFilename - The original file name
 * @param subcategoryId - The subcategory ID/name
 * @returns Generated filename
 */
export const generateFilename = (originalFilename: string, subcategoryId: string): string => {
  // Generate a random ID (timestamp + random number)
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  const randomId = `${timestamp}_${randomNum}`;
  
  // Get file extension from original filename
  const lastDotIndex = originalFilename.lastIndexOf('.');
  const extension = lastDotIndex > 0 ? originalFilename.substring(lastDotIndex) : '';
  
  // Clean subcategory ID (remove special characters, replace spaces with underscores)
  const cleanSubcategory = subcategoryId
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase(); // Convert to lowercase
  
  // Generate new filename
  const newFilename = `${randomId}_${cleanSubcategory}${extension}`;
  
  console.log('Filename generation:', {
    original: originalFilename,
    subcategoryId,
    cleanSubcategory,
    randomId,
    extension,
    newFilename
  });
  
  return newFilename;
};

/**
 * Generates a filename with custom random ID and subcategory name
 * Format: {customId}_{subcategoryName}.{extension}
 * 
 * @param originalFilename - The original file name
 * @param subcategoryId - The subcategory ID/name
 * @param customId - Custom ID to use instead of timestamp
 * @returns Generated filename
 */
export const generateFilenameWithCustomId = (
  originalFilename: string, 
  subcategoryId: string, 
  customId: string
): string => {
  // Get file extension from original filename
  const lastDotIndex = originalFilename.lastIndexOf('.');
  const extension = lastDotIndex > 0 ? originalFilename.substring(lastDotIndex) : '';
  
  // Clean subcategory ID (remove special characters, replace spaces with underscores)
  const cleanSubcategory = subcategoryId
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase(); // Convert to lowercase
  
  // Generate new filename
  const newFilename = `${customId}_${cleanSubcategory}${extension}`;
  
  console.log('Filename generation with custom ID:', {
    original: originalFilename,
    subcategoryId,
    cleanSubcategory,
    customId,
    extension,
    newFilename
  });
  
  return newFilename;
};
