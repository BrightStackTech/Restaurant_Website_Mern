import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { FaCamera, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "axios";
import LoadingOverlay from "../components/LoadingOverlay";
import { Link } from "react-router-dom";
import api from "../api/config";

const getCroppedImg = (imageSrc: string, pixelCrop: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );
        resolve(canvas.toDataURL("image/png"));
      } else {
        reject(new Error("Canvas context not found"));
      }
    };
    image.onerror = (error) => reject(error);
  });
};

const EditProfile = () => {
  const { state, setUser } = useAuth();
  const user = state.user;
  const navigate = useNavigate();

  // Editable states
  const [name, setName] = useState(user?.name || "");
  const [nameError, setNameError] = useState("");
  const [previewProfilePic, setPreviewProfilePic] = useState(user?.profilePicture || "");
  const [showCameraDropdown, setShowCameraDropdown] = useState(false);
  const [showCameraInterface, setShowCameraInterface] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [nsfwResult, setNsfwResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setName(user?.name || "");
    setPreviewProfilePic(user?.profilePicture || "");
  }, [user]);

    const checkImageSafeSearch = async (base64: string) => {
    const payload = {
        requests: [
        {
            image: { content: base64 },
            features: [{ type: "SAFE_SEARCH_DETECTION" }]
        }
        ]
    };
    const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${import.meta.env.VITE_VISION_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    const annotation = data.responses?.[0]?.safeSearchAnnotation;
    return annotation;
    };
    
  useEffect(() => {
    if (!name.trim() || name === user?.name) {
      setUsernameExists(false);
      setCheckingUsername(false);
      return;
    }
    setCheckingUsername(true);
    setUsernameExists(false);
    if (usernameCheckTimeout.current) clearTimeout(usernameCheckTimeout.current);
    usernameCheckTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/check-username?name=${encodeURIComponent(name.trim())}`);
        setUsernameExists(res.data.exists);
      } catch {
        setUsernameExists(false);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);
    // eslint-disable-next-line
  }, [name, user?.name]);


  const isNSFW = nsfwResult && Object.values(nsfwResult).some(
  (v) => v === "LIKELY" || v === "VERY_LIKELY"
  );
  
    const isSaveDisabled =
      !name.trim() ||
      !!nameError ||
      (name === user?.name && previewProfilePic === user?.profilePicture) ||
      isNSFW ||
      usernameExists ||
      checkingUsername;

  // Save handler (real API call)
  const handleSave = async () => {
    try {
      let imageUrl = previewProfilePic;
      // If image is a data URL, upload to Cloudinary
      if (previewProfilePic && previewProfilePic.startsWith("data:image")) {
        const formData = new FormData();
        formData.append("file", previewProfilePic);
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );
        imageUrl = uploadRes.data.secure_url;
      }

      // Update user details in backend
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/auth/updatedetails`;
      const res = await axios.put(
        apiUrl,
        { name, profilePicture: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (res.data.success && res.data.data) {
        setUser(res.data.data); // Update context
        toast.success("Profile updated!");
        navigate("/profile");
        window.location.reload();
      } else {
        throw new Error(res.data.message || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
        setIsSaving(false);
    }
  };

  // Camera logic
  const toggleCameraDropdown = () => setShowCameraDropdown((prev) => !prev);

  const handleCaptureOption = async () => {
    setShowCameraDropdown(false);
    setShowCameraInterface(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      toast.error("Error accessing camera");
    }
  };

  const handleUploadOption = () => {
    setShowCameraDropdown(false);
    document.getElementById("fileInput")?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setCapturedImage(dataUrl);
        setShowCameraInterface(false);
        setShowCropper(true);
        // Stop video stream
        let stream = video.srcObject as MediaStream;
        if (stream) stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => setCroppedAreaPixels(croppedAreaPixels);

const handleSaveCropped = async () => {
  try {
    if (capturedImage && croppedAreaPixels) {
      const croppedImage = await getCroppedImg(capturedImage, croppedAreaPixels);
      // Remove data URL prefix for Vision API
      const base64 = croppedImage.split(',')[1];
      setNsfwResult(null); // Reset before checking
      // Check NSFW
      const annotation = await checkImageSafeSearch(base64);
      setNsfwResult(annotation);
      // If any field is LIKELY or VERY_LIKELY, don't allow save
      const isNSFW = annotation && Object.values(annotation).some(
        (v) => v === "LIKELY" || v === "VERY_LIKELY"
      );
      if (isNSFW) {
        setPreviewProfilePic(""); // Don't set the image
        toast.error("Profile picture contains inappropriate content.");
        setPreviewProfilePic(croppedImage);
        setShowCropper(false);
        setCapturedImage(null);
      } else {
        setPreviewProfilePic(croppedImage);
        setShowCropper(false);
        setCapturedImage(null);
      }
    }
  } catch {
    toast.error("Error cropping image");
  }
};

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">403</h1>
        <h2 className="text-3xl font-bold mb-4 dark:text-white">User Unauthorized</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          You are not logged in. Please log in to access your profile.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/"
            className="px-6 py-2 bg-primary-600 text-black dark:text-white rounded-md hover:bg-primary-700 transition hover:text-primary"
          >
            Go to Home Page
          </Link>
          <Link
            to="/login"
            className="px-6 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-primary dark:hover:bg-primary transition"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white"
    >
    {isSaving && <LoadingOverlay />}
      <div className="max-w-xl mx-auto p-6 mt-20">
       <h1 className="text-3xl font-bold mb-6 text-center">Edit Profile</h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col items-center space-y-6 py-12 ">
          <div className="relative group">
            <div className="relative group rounded-full overflow-hidden">
              <img
                onClick={() => setShowImageDialog(true)}
                src={previewProfilePic || "/default-avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover cursor-pointer"
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-10 bg-black bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCameraDropdown();
                }}
              >
                <FaCamera size={20} className="text-white" />
              </div>
            </div>
            {showCameraDropdown && (
              <div className="absolute bottom-0 -right-20 bg-white dark:bg-gray-800 rounded shadow p-2 z-10">
                <button
                  onClick={handleCaptureOption}
                  className="block w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Capture
                </button>
                <button
                  onClick={handleUploadOption}
                  className="block w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Upload
                </button>
              </div>
            )}
          </div>
            {nsfwResult && (
            <div className="mt-2 text-red-500 text-sm">
                {(Object.values(nsfwResult).some(v => v === "LIKELY" || v === "VERY_LIKELY")) && (
                <div className="font-bold">Inappropriate content detected. Please choose another image.</div>
                )}
            </div>
            )}
          <div className="w-full max-w-md">
            <div className="mb-4">
              <label htmlFor="name" className="block font-semibold mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value.trim()) {
                    setNameError("Name is required");
                  } else if (/\s/.test(value)) {
                    setNameError("Username cannot contain spaces");
                  } else if (/[A-Z]/.test(value)) {
                    setNameError("Username must be lowercase");
                  } else {
                    setNameError("");
                  }
                  setName(value);
                }}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {nameError && <small className="text-red-500">{nameError}</small>}
              {checkingUsername && (
                <p className="text-sm text-gray-400 mt-1">Checking username...</p>
              )}
              {usernameExists && (
                <p className="text-sm text-red-500 mt-1">User with this username already exists!</p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-semibold text-red-500 font-semibold mb-1">
                Your account is associated with this email and email cant be changed
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => navigate("/profile")}
                className={`w-full btn hover:bg-gray-400 py-3 flex items-center justify-center cursor-pointer`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaveDisabled}
                className={`w-full btn hover:bg-gray-400 py-3 flex items-center justify-center ${
                  isSaveDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "btn-primary hover:btn-primary text-white"
                }`}
              >
                Save
              </button>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => navigate("/change-password")}
                className="w-full btn hover:bg-gray-400 py-3 flex items-center justify-center bg-transparent hover:bg-red-700 hover:text-white dark:hover:bg-red-700 text-black dark:text-white dark:hover:text-white border-2 border-red-900 dark:border-red-800"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
      <input
        title="File Upload"
        id="fileInput"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      {/* Camera Interface Modal */}
      {showCameraInterface && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <video ref={videoRef} className="w-80 h-60 bg-black" autoPlay />
            <div className="flex justify-between mt-4">
              <button
                onClick={handleCaptureFrame}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Capture
              </button>
              <button
                onClick={() => {
                  if (videoRef.current && videoRef.current.srcObject) {
                    let stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach((track) => track.stop());
                  }
                  setShowCameraInterface(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Cropper Preview Modal */}
      {showCropper && capturedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-700 dark:text-white">Crop your image</h2>
            <div className="relative w-80 h-60 bg-black">
              <Cropper
                key={capturedImage}
                image={capturedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={handleSaveCropped}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowCropper(false);
                  setCapturedImage(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Enlarged Image Dialog */}
      {showImageDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
          onClick={() => setShowImageDialog(false)}
        >
          <div
            className="relative overflow-hidden rounded-xl shadow-lg"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the dialog
          >
            <button
             title="btn"
              className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 transition"
              onClick={() => setShowImageDialog(false)}
            >
              <FaTimes className="text-gray-700 text-xl" />
            </button>
            <img
              src={user.profilePicture ? user.profilePicture + '?v=' + user.updatedAt : "/default-avatar.png"}
              alt="Enlarged Profile"
              className="w-96"
            />
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};

export default EditProfile;