"use client";

import Image from "next/image";
import { useState } from "react";
import { toast, Toaster } from "sonner";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  // Handle file changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOriginalImage(null);
    setProcessedImage(null);
    setProcessing(true);

    if (!selectedFile) {
      alert("Please select a file first.");
      setProcessing(false);
      return;
    }
    // const toastId :any= toast.loading("Processing started");

    const formData = new FormData();
    formData.append("imageFile", selectedFile);

    try {
      const response = await fetch("/api/fileUpload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      // console.log("Response data:", data);

      if (response.ok) {
        setJobId(data.jobId); 
        // toast.success("Processing started", { duration: 1000 });
        
        pollForCompletion(data.jobId);
      } else {
        console.error("Failed to upload file.");
        toast.error("Failed to start processing", { duration: 2000 });
        setProcessing(false);
      }
    } catch (error) {
      toast.error(`${error}`, {  duration: 2000 });
      setProcessing(false);
    }
  };

  // Polling function to check for job completion
  const pollForCompletion = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/fileUpload?jobId=${jobId}`);
        const data = await response.json();
        // console.log("Polling status:", data);

        if (response.ok && data.status === "completed") {
          clearInterval(interval);
          if (data.originalUrl && data.grayscaleUrl) {
            setOriginalImage(data.originalUrl);
            setProcessedImage(data.grayscaleUrl);
            toast.success("Processing completed", { duration: 1000 });
          } else {
            toast.error("No image URLs received", { duration: 2000 });
          }
          setProcessing(false);
        } else if (response.ok && data.status === "processing") {
          // console.log("Still processing...");
        } else {
          clearInterval(interval);
          toast.error("Error in processing", { duration: 2000 });
          setProcessing(false);
        }
      } catch (error) {
        console.error("Polling failed", error);
        clearInterval(interval);
        toast.error("Error while checking status", { duration: 2000 });
        setProcessing(false);
      }
    }, 15000); // Poll every 5 seconds
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
          disabled={processing}
        >
          {processing ? "Processing..." : "Process Image"}
        </button>
      </form>

      <div className="mt-8 flex flex-wrap justify-center gap-8">
        {processing && (
          <div className="text-center">
            <div className="text-xl font-medium text-gray-800">Processing...</div>
            <div className="mt-4 animate-spin">🔄</div>
          </div>
        )}

        {originalImage && !processing && (
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

        {processedImage && !processing && (
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
