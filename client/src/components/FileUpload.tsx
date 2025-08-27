import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  File, 
  Video, 
  CheckCircle, 
  X, 
  AlertCircle,
  Loader2
} from "lucide-react";

interface FileUploadProps {
  label: string;
  accept: string;
  endpoint: string;
  maxSize?: number; // in bytes
  onUpload?: (url: string) => void;
  className?: string;
}

export default function FileUpload({ 
  label, 
  accept, 
  endpoint, 
  maxSize = 50 * 1024 * 1024, // 50MB default
  onUpload,
  className = ""
}: FileUploadProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Reset states
    setUploadError(null);
    setUploadedUrl(null);
    setUploadProgress(0);

    // Validate file size
    if (selectedFile.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setUploadError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = accept.split(',').map(ext => ext.trim().replace('.', '').replace('*', ''));
    
    if (accept !== "*" && fileExtension && !acceptedExtensions.some(ext => 
      ext === fileExtension || (ext === "video" && selectedFile.type.startsWith("video/"))
    )) {
      setUploadError(`File type not supported. Accepted: ${accept}`);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !isAuthenticated) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append(accept.includes('video') ? 'video' : 'document', file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }

      const result = await response.json();
      setUploadedUrl(result.url);
      onUpload?.(result.url);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadedUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) {
      return <Video className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-hidden"
      />

      {!file && !uploadedUrl && (
        <Card 
          className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
          onClick={handleClick}
          data-testid="card-file-upload-area"
        >
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-1">{label}</p>
            <p className="text-xs text-muted-foreground mb-3">
              Max size: {formatFileSize(maxSize)}
            </p>
            <p className="text-xs text-muted-foreground">
              Supported: {accept}
            </p>
            {!isAuthenticated && (
              <Badge variant="destructive" className="mt-2">
                Sign in required
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {file && !uploadedUrl && (
        <Card data-testid="card-file-selected">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                data-testid="button-remove-file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {uploadError && (
              <div className="flex items-center space-x-2 mb-3 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <p className="text-xs">{uploadError}</p>
              </div>
            )}

            {isUploading && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                  <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading || !!uploadError}
                className="flex-1"
                data-testid="button-upload-file"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleClick}
                disabled={isUploading}
                data-testid="button-change-file"
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedUrl && (
        <Card data-testid="card-file-uploaded">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-700">File uploaded successfully</p>
                <p className="text-xs text-muted-foreground truncate">
                  {file?.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                data-testid="button-remove-uploaded"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
