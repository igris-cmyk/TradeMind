"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  endpoint: "tradeAttachment";
  onChange: (urls: string[]) => void;
  value: string[];
}

export function FileUpload({ endpoint, onChange, value }: FileUploadProps) {
  const [isMocking, setIsMocking] = useState(false);
  const allowMockUploads = process.env.NODE_ENV !== "production";

  const onUploadError = (error: Error) => {
    if (allowMockUploads && (error.message.includes("Simulated") || error.message.includes("Invalid config") || error.message.includes("Failed to fetch"))) {
      toast.error("UploadThing keys missing. Using mock images for testing.");
      mockUpload();
    } else {
      toast.error(`Upload failed: ${error.message}`);
    }
  };

  const mockUpload = () => {
    setIsMocking(true);
    setTimeout(() => {
      // Add a couple of realistic trading chart placeholders
      const newUrls = [
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=2030&auto=format&fit=crop"
      ];
      onChange([...value, ...newUrls]);
      setIsMocking(false);
      toast.success("Mock images attached");
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Upload"
                className="w-full h-32 object-cover transition-transform group-hover:scale-105"
              />
              <button
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="absolute top-2 right-2 p-1 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-red/20 hover:text-accent-red"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < 4 && (
        <div className="relative">
          {isMocking ? (
            <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Uploading mock images...</p>
            </div>
          ) : (
            <div className="relative group">
              <UploadDropzone
                endpoint={endpoint}
                onClientUploadComplete={(res) => {
                  onChange([...value, ...res.map((r) => r.url)]);
                  toast.success("Upload complete");
                }}
                onUploadError={onUploadError}
                className="ut-button:bg-primary ut-button:ut-readying:bg-primary/50 ut-label:text-primary ut-allowed-content:text-muted-foreground border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-colors"
              />
              
              {allowMockUploads && (
                <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={mockUpload}
                    type="button"
                    className="text-xs py-1 h-7"
                  >
                    <ImageIcon className="h-3 w-3 mr-2" />
                    Test Mock Upload
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
