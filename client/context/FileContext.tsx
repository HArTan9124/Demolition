import React, { createContext, useContext, useState, useEffect } from "react";

export interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "pdf";
  size: number;
  uploadedAt: string;
  base64: string;
}

interface FileContextType {
  files: UploadedFile[];
  addFile: (file: UploadedFile) => void;
  deleteFile: (id: string) => void;
  getFiles: () => UploadedFile[];
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Load files from localStorage on mount
  useEffect(() => {
    const savedFiles = localStorage.getItem("ravya_uploaded_files");
    if (savedFiles) {
      try {
        setFiles(JSON.parse(savedFiles));
      } catch (error) {
        console.error("Failed to parse saved files:", error);
      }
    }
  }, []);

  const addFile = (file: UploadedFile) => {
    const updatedFiles = [...files, file];
    setFiles(updatedFiles);
    localStorage.setItem("ravya_uploaded_files", JSON.stringify(updatedFiles));
  };

  const deleteFile = (id: string) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    localStorage.setItem("ravya_uploaded_files", JSON.stringify(updatedFiles));
  };

  const getFiles = () => files;

  return (
    <FileContext.Provider value={{ files, addFile, deleteFile, getFiles }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFiles must be used within a FileProvider");
  }
  return context;
}
