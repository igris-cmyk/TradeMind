"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { UploadCloud, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ImportModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processImport = async () => {
    if (!file) return;

    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/trades/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trades: results.data }),
          });

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.error || "Import failed");
            if (data.details) {
              console.error("Import Errors:", data.details);
            }
          } else {
            toast.success(`Successfully imported ${data.imported} trades!`);
            if (data.errors) {
              toast.warning(`${data.errors.length} rows were skipped due to errors.`);
            }
            setIsOpen(false);
            setFile(null);
            router.refresh();
          }
        } catch (err) {
          console.error(err);
          toast.error("An unexpected error occurred during import.");
        } finally {
          setIsUploading(false);
        }
      },
      error: (err) => {
        setIsUploading(false);
        toast.error(`CSV Parsing error: ${err.message}`);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Trades (CSV)</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing your historical trades. Required columns: <code>pair, direction, entry, stopLoss, takeProfit</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Click to upload CSV</p>
              <p className="text-xs text-muted-foreground mt-1">.csv files only, max 5MB</p>
            </div>
          ) : (
            <div className="border rounded-xl p-4 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="h-8 w-8 text-primary-400 shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)} disabled={isUploading}>
                Remove
              </Button>
            </div>
          )}
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={processImport} disabled={!file || isUploading} className="gap-2">
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isUploading ? "Importing..." : "Import Data"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
