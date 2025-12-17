import { useState } from "react";
import { useFiles, UploadedFile } from "@/context/FileContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { Upload, File, FileText, X } from "lucide-react";

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { addFile } = useFiles();

  const handleFileSelect = async (selectedFiles: FileList) => {
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Validate file type
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";

      if (!isImage && !isPdf) {
        alert("Only images (JPG, PNG) and PDFs are allowed");
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 10MB)`);
        continue;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const newFile: UploadedFile = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: isImage ? "image" : "pdf",
          size: file.size,
          uploadedAt: new Date().toISOString(),
          base64,
        };

        addFile(newFile);
        setUploadedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary"
        }`}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Drag and drop your files</h3>
        <p className="text-muted-foreground font-light mb-4">
          or click to browse from your computer
        </p>
        <p className="text-xs text-muted-foreground font-light mb-4">
          Supported formats: JPG, PNG, PDF (Max 10MB each)
        </p>
        <label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />
          <Button variant="gradient" size="lg" className="cursor-pointer">
            Select Files
          </Button>
        </label>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Files ({uploadedFiles.length})</h3>

          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {file.type === "pdf" ? (
                    <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                  ) : (
                    <File className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground font-light">
                      {(file.size / 1024).toFixed(2)} KB •{" "}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <a
                  href={file.base64}
                  download={file.name}
                  className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex-shrink-0"
                >
                  Download
                </a>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
