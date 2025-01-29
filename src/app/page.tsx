"use client";

import Image from "next/image";
import { useState } from "react";
import { toast, Toaster } from "sonner";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  // Handle file changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOriginalImage(null)
 setProcessedImage(null)
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    const toastId = toast.loading("Processing...");
    
    const formData = new FormData();
    formData.append("imageFile", selectedFile);

    try {
      const response = await fetch("/api/fileUpload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("data-->>",data);

      if (response.ok) {
        setOriginalImage(data.originalFile); 
        setProcessedImage(data.grayscaleFile); 
        toast.success("Processing success", { id: toastId, duration: 1000 });
      } else {
        console.error("Failed to upload file.");
      }
    } catch (error) {
      toast.error(`${error}`, { id: toastId, duration: 2000 });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-gray-900 mb-6">Make Grayscale Images</h1>

      <form
        className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96"
        onSubmit={handleSubmit}
      >
        <div className="mb-6">
          <input
            type="file"
            name="imageFile"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-600 file:bg-gray-100 file:border file:border-gray-300 file:py-2 file:px-4 file:rounded-md hover:file:bg-gray-200 transition-all"
          />
        </div>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all focus:outline-none"
          type="submit"
        >
          Process Image
        </button>
      </form>

      <div className="mt-8 flex flex-wrap justify-center gap-8">
        {originalImage && (
          <div className="text-center">
            <h2 className="text-xl font-medium text-gray-800">Original Image:</h2>
            <Image
              src={originalImage}
              alt="Original"
              className="mt-4 max-w-[300px] h-auto border-2 border-gray-300 rounded-lg shadow-md"
              width={400}
              height={300}
            />
          </div>
        )}

        {processedImage && (
          <div className="text-center">
            <h2 className="text-xl font-medium text-gray-800">Processed Image:</h2>
            <Image
              src={processedImage}
              alt="Processed"
              className="mt-4 max-w-[300px] h-auto border-2 border-gray-300 rounded-lg shadow-md"
              width={400}
              height={300}
            />
          </div>
        )}
      </div>

      <Toaster />
    </div>
  );
}
