// src/api/communityService.js
import apiClient from "./client";

export const communityService = {
  createCommunity: async ({ name, description, avatar, banner, privacy }) => {
    console.log("Creating community with:", {
      name,
      description,
      avatar,
      banner,
      privacy,
    });
    try {
      const response = await apiClient.post("/community", {
        name,
        description,
        avatar,
        banner,
        privacy,
      });
      console.log("Create community response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Create community failed:",
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to create community"
      );
    }
  },

  joinCommunity: async (communityId) => {
    if (!communityId) {
      console.error("joinCommunity: No communityId provided");
      throw new Error("Community ID is required");
    }
    try {
      const response = await apiClient.put(`/community/${communityId}/join`);
      console.log(
        `Join community response for ID ${communityId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Join community failed for ID ${communityId}:`,
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to join community"
      );
    }
  },

  leaveCommunity: async (communityId) => {
    if (!communityId) {
      console.error("leaveCommunity: No communityId provided");
      throw new Error("Community ID is required");
    }
    try {
      const response = await apiClient.put(`/community/${communityId}/leave`);
      console.log(
        `Leave community response for ID ${communityId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Leave community failed for ID ${communityId}:`,
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to leave community"
      );
    }
  },

  inviteToCommunity: async (communityId, userIdToInvite) => {
    if (!communityId || !userIdToInvite) {
      console.error("inviteToCommunity: Missing communityId or userIdToInvite");
      throw new Error("Community ID and User ID are required");
    }
    try {
      const response = await apiClient.put(`/community/${communityId}/invite`, {
        userIdToInvite,
      });
      console.log(
        `Invite user response for community ID ${communityId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Invite to community failed for ID ${communityId}:`,
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to invite user to community"
      );
    }
  },

  addModerator: async (communityId, userIdToPromote) => {
    if (!communityId || !userIdToPromote) {
      console.error("addModerator: Missing communityId or userIdToPromote");
      throw new Error("Community ID and User ID are required");
    }
    try {
      const response = await apiClient.put(
        `/community/${communityId}/add-moderator`,
        { userIdToPromote }
      );
      console.log(
        `Add moderator response for community ID ${communityId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Add moderator failed for ID ${communityId}:`,
        error.message,
        error.response?.data
      );
      const errorMessage =
        error.response?.status === 400
          ? "Only the creator can add moderators"
          : error.response?.data?.error || "Failed to add moderator";
      throw new Error(errorMessage);
    }
  },

  getMyCommunities: async () => {
    try {
      const response = await apiClient.get("/community/my");
      console.log("My communities response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Fetch my communities failed:",
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to fetch my communities"
      );
    }
  },

  updateCommunity: async (communityId, { name, avatar, banner }) => {
    if (!communityId) {
      console.error("updateCommunity: No communityId provided");
      throw new Error("Community ID is required");
    }
    console.log("Updating community with:", {
      communityId,
      name,
      avatar,
      banner,
    });
    try {
      const response = await apiClient.put(`/community/${communityId}/update`, {
        name,
        avatar,
        banner,
      });
      console.log(
        `Update community response for ID ${communityId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Update community failed for ID ${communityId}:`,
        error.message,
        error.response?.data
      );
      const errorMessage =
        error.response?.status === 403
          ? "Only the creator can edit the community"
          : error.response?.status === 404
          ? "Community not found"
          : error.response?.data?.error || "Failed to update community";
      throw new Error(errorMessage);
    }
  },

  approveJoinRequest: async (communityId, userIdToApprove) => {
    if (!communityId || !userIdToApprove) {
      console.error(
        "approveJoinRequest: Missing communityId or userIdToApprove"
      );
      throw new Error("Community ID and User ID are required");
    }
    try {
      const response = await apiClient.put(
        `/community/${communityId}/approve`,
        { userIdToApprove }
      );
      console.log(
        `Approve join request response for community ID ${communityId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Approve join request failed for ID ${communityId}:`,
        error.message,
        error.response?.data
      );
      const errorMessage =
        error.response?.status === 403
          ? "No permission to approve requests"
          : error.response?.status === 404
          ? "Community not found"
          : error.response?.data?.error || "Failed to approve join request";
      throw new Error(errorMessage);
    }
  },

  rejectJoinRequest: async (communityId, userIdToReject) => {
    if (!communityId || !userIdToReject) {
      console.error("rejectJoinRequest: Missing communityId or userIdToReject");
      throw new Error("Community ID and User ID are required");
    }
    try {
      const response = await apiClient.put(`/community/${communityId}/reject`, {
        userIdToReject,
      });
      console.log(
        `Reject join request response for community ID ${communityId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Reject join request failed for ID ${communityId}:`,
        error.message,
        error.response?.data
      );
      const errorMessage =
        error.response?.status === 403
          ? "No permission to reject requests"
          : error.response?.status === 404
          ? "Community not found"
          : error.response?.data?.error || "Failed to reject join request";
      throw new Error(errorMessage);
    }
  },

  createPost: async (communityId, { content, image }) => {
    if (!communityId) {
      console.error("createPost: No communityId provided");
      throw new Error("Community ID is required");
    }
    console.log("Creating post with:", { communityId, content, image });
    try {
      const response = await apiClient.post(`/community/${communityId}/posts`, {
        content,
        image,
      });
      console.log(
        `Create post response for community ID ${communityId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Create post failed for ID ${communityId}:`,
        error.message,
        error.response?.data
      );
      const errorMessage =
        error.response?.status === 403
          ? "You are not a member of this community"
          : error.response?.data?.error || "Failed to create post";
      throw new Error(errorMessage);
    }
  },

  getApprovedPosts: async (communityId) => {
    if (!communityId) {
      console.error("getApprovedPosts: No communityId provided");
      throw new Error("Community ID is required");
    }
    try {
      const response = await apiClient.get(`/community/${communityId}/posts`);
      console.log(
        `Approved posts response for community ID ${communityId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Fetch approved posts failed for ID ${communityId}:`,
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to fetch approved posts"
      );
    }
  },

  getPendingPosts: async (communityId) => {
    if (!communityId) {
      console.error("getPendingPosts: No communityId provided");
      throw new Error("Community ID is required");
    }
    try {
      const response = await apiClient.get(
        `/community/${communityId}/posts/pending`
      );
      console.log(
        `Pending posts response for community ID ${communityId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Fetch pending posts failed for ID ${communityId}:`,
        error.message,
        error.response?.data
      );
      const errorMessage =
        error.response?.status === 403
          ? "No permission to view pending posts"
          : error.response?.data?.error || "Failed to fetch pending posts";
      throw new Error(errorMessage);
    }
  },

  approvePost: async (postId) => {
    if (!postId) {
      console.error("approvePost: No postId provided");
      throw new Error("Post ID is required");
    }
    try {
      const response = await apiClient.patch(
        `/community/posts/${postId}/approve`
      );
      console.log(`Approve post response for ID ${postId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        `Approve post failed for ID ${postId}:`,
        error.message,
        error.response?.data
      );
      const errorMessage =
        error.response?.status === 403
          ? "No permission to approve this post"
          : error.response?.status === 404
          ? "Post not found"
          : error.response?.data?.error || "Failed to approve post";
      throw new Error(errorMessage);
    }
  },

  // Placeholder for rejectPost, assuming a similar endpoint might exist
  rejectPost: async (postId) => {
    if (!postId) {
      console.error("rejectPost: No postId provided");
      throw new Error("Post ID is required");
    }
    try {
      // Replace with actual endpoint when available, e.g., `/community/posts/${postId}/reject`
      const response = await apiClient.patch(
        `/community/posts/${postId}/reject`
      );
      console.log(`Reject post response for ID ${postId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        `Reject post failed for ID ${postId}:`,
        error.message,
        error.response?.data
      );
      const errorMessage =
        error.response?.status === 403
          ? "No permission to reject this post"
          : error.response?.status === 404
          ? "Post not found"
          : error.response?.data?.error || "Failed to reject post";
      throw new Error(errorMessage);
    }
  },
};
