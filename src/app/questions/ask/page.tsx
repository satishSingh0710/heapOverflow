"use client";
import { useState } from "react";
import { userAuthStore } from "@/store/Auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Page() {
  const { user } = userAuthStore(); // Get user info (if needed)
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Show preview
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!user) return alert("You must be logged in to upload a post!");

    if (!title || !content || !tags || !file) return alert("All fields are required!");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("tags", tags);
      formData.append("image", file);

      // Call API to upload data
      const response = await fetch("/api/question", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert("Post uploaded successfully!");
        // Reset form
        setTitle("");
        setContent("");
        setTags("");
        setFile(null);
        setPreviewUrl(null);
      } else {
        alert("Upload failed: " + result.error);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">Create a New Post</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div>
            <Label htmlFor="title" className="block text-sm font-semibold text-gray-700">
              Title
            </Label>
            <Input
              type="text"
              id="title"
              name="title"
              placeholder="Enter your title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Content Input */}
          <div>
            <Label htmlFor="content" className="block text-sm font-semibold text-gray-700">
              Content
            </Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Write your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Tags Input */}
          <div>
            <Label htmlFor="tags" className="block text-sm font-semibold text-gray-700">
              Tags (comma separated)
            </Label>
            <Input
              type="text"
              id="tags"
              name="tags"
              placeholder="e.g. technology, news, updates"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label htmlFor="file" className="block text-sm font-semibold text-gray-700">
              Upload Image
            </Label>
            <Input
              type="file"
              id="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Image Preview */}
          {previewUrl && <img src={previewUrl} alt="Preview" className="w-full rounded-lg shadow-sm mt-2" />}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 p-3 text-white hover:bg-blue-600 active:scale-95"
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </div>
    </div>
  );
}
