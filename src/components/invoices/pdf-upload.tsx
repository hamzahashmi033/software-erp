"use client";

import { useRef, useState } from "react";
import { CloudUpload, FileText, X } from "lucide-react";

interface PdfFile {
  name: string;
  sizeKb: number;
  base64: string;
}

interface PdfUploadProps {
  value: PdfFile | null;
  onChange: (file: PdfFile | null) => void;
  error?: string;
}

const MAX_MB = 5;

export function PdfUpload({ value, onChange, error }: PdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState("");

  function processFile(file: File) {
    setSizeError("");
    if (file.type !== "application/pdf") {
      setSizeError("Only PDF files are allowed.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setSizeError(`File must be under ${MAX_MB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(",")[1];
      onChange({ name: file.name, sizeKb: Math.round(file.size / 1024), base64 });
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  const displayError = sizeError || error;

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFEDD5]">
          <FileText className="h-4 w-4 text-[#EA580C]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{value.name}</p>
          <p className="text-xs text-gray-400">{value.sizeKb} KB · PDF</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "w-full rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all",
          dragging
            ? "border-[#EA580C] bg-[#FFEDD5]"
            : "border-[#FED7AA] bg-[#FFF7ED] hover:border-[#EA580C] hover:bg-[#FFEDD5]",
          displayError ? "border-red-300 bg-red-50" : "",
        ].join(" ")}
      >
        <CloudUpload
          className={[
            "mx-auto mb-3 h-8 w-8",
            displayError ? "text-red-400" : dragging ? "text-[#EA580C]" : "text-[#9d8fd4]",
          ].join(" ")}
        />
        <p className="text-sm font-medium text-gray-700">
          Drag &amp; drop a PDF here, or{" "}
          <span className="text-[#EA580C] underline underline-offset-2">click to browse</span>
        </p>
        <p className="mt-1 text-xs text-gray-400">PDF only · Max {MAX_MB}MB</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      {displayError && <p className="mt-1.5 text-xs text-red-500">{displayError}</p>}
    </div>
  );
}
