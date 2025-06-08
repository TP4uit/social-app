import apiClient from "./client";
import * as FileSystem from "expo-file-system";
import mime from "mime"; // Import mime package for dynamic type detection

export const imageService = {
  getImageString: async (fileUri) => {
    console.log("Uploading image with URI:", fileUri);
    try {
      // If the URI is a remote URL, return it as-is
      if (fileUri.startsWith("http")) {
        console.log("Skipping upload for remote URL:", fileUri);
        return fileUri;
      }

      // Validate local file URI
      if (!fileUri.startsWith("file://")) {
        throw new Error("Invalid file URI: Must be a local file:// URI");
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist at URI: " + fileUri);
      }

      // Get file extension and MIME type
      const fileName = fileUri.split("/").pop() || "image.jpg";
      const extension = fileName.split(".").pop()?.toLowerCase();
      let mimeType = mime.getType(fileName); // Get MIME type using mime package

      // Fallback for common image types if mime.getType returns null
      if (!mimeType) {
        const mimeMap = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
        };
        mimeType = mimeMap[extension] || "image/jpeg"; // Default to JPEG
        console.warn(
          `Unknown MIME type for extension "${extension}", using fallback: ${mimeType}`
        );
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      });

      // Log FormData details (for debugging, as FormData doesn't log directly)
      console.log("FormData prepared:", {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      });

      // Send request to upload image
      const response = await apiClient.post("/files/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Image upload response:", response.data);

      // Adjust based on your backend's response structure (e.g., Cloudinary)
      return response.data.secure_url || response.data.url || fileUri;
    } catch (error) {
      console.error(
        "Image upload failed:",
        error.message,
        error.response?.data
      );
      throw new Error(error.response?.data?.error || "Failed to upload image");
    }
  },
};
