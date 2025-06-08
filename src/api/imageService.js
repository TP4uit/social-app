import apiClient from "./client";
import * as FileSystem from "expo-file-system";
import mime from "mime";

export const imageService = {
  getImageString: async (fileUri) => {
    console.log("Uploading image with URI:", fileUri);
    try {
      // Handle undefined or invalid URI
      if (!fileUri) {
        throw new Error("Invalid file URI: URI is undefined or empty");
      }

      // Handle web URLs (blob:, data:) or remote URLs (http:)
      if (
        fileUri.startsWith("http") ||
        fileUri.startsWith("blob:") ||
        fileUri.startsWith("data:")
      ) {
        console.log("Processing web-compatible URL:", fileUri);
        // For web, create a FormData with blob/data URL
        const fileName = fileUri.split("/").pop() || "image.jpg";
        const extension = fileName.split(".").pop()?.toLowerCase();
        let mimeType = mime.getType(fileName) || "image/jpeg";

        const response = await fetch(fileUri);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append("file", {
          uri: fileUri,
          name: fileName,
          type: mimeType,
          blob, // Include blob for web
        });

        console.log("FormData prepared for web:", {
          uri: fileUri,
          name: fileName,
          type: mimeType,
        });

        const uploadResponse = await apiClient.post(
          "/files/upload-image",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        console.log("Image upload response:", uploadResponse.data);
        return (
          uploadResponse.data.secure_url || uploadResponse.data.url || fileUri
        );
      }

      // Mobile: Validate local file URI
      if (!fileUri.startsWith("file://")) {
        throw new Error("Invalid file URI: Must be a local file:// URI");
      }

      // Check if file exists (mobile only)
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist at URI: " + fileUri);
      }

      // Get file extension and MIME type
      const fileName = fileUri.split("/").pop() || "image.jpg";
      const extension = fileName.split(".").pop()?.toLowerCase();
      let mimeType = mime.getType(fileName);

      // Fallback for common image types
      if (!mimeType) {
        const mimeMap = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
        };
        mimeType = mimeMap[extension] || "image/jpeg";
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

      console.log("FormData prepared for mobile:", {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      });

      // Send request to upload image
      const response = await apiClient.post("/files/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Image upload response:", response.data);
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
