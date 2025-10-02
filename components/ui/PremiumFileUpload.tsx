// components/ui/PremiumFileUpload.tsx
"use client";
import React, { useRef, useState, DragEvent, ChangeEvent } from "react";

interface PremiumFileUploadProps {
  label?: string;
  accept?: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

const PremiumFileUpload: React.FC<PremiumFileUploadProps> = ({
  label = "Upload File",
  accept = "image/*,application/pdf",
  file,
  onChange,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onChange(droppedFile);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onChange(e.target.files[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="font-medium text-black">{label}</span>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition
          ${dragOver ? "border-[#0daba9] bg-[#f0fdfa]" : "border-gray-300 bg-white"}
          hover:border-[#0daba9] hover:bg-[#f0fdfa]
        `}
      >
        <span className="text-gray-600">
          {file ? file.name : "Drag & drop file here or click to upload"}
        </span>
      </div>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default PremiumFileUpload;
