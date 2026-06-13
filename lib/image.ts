/**
 * Reusable utility to convert a File upload object to a Base64 string.
 * This format is stored directly in Cloud Firestore catalog documents.
 * 
 * @param file Browser File object from input[type="file"]
 * @returns Promise resolving to a Base64 Data URL string
 */
export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
