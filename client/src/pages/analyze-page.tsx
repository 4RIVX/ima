import { useCallback, useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { useCreateAnalysis } from "@/hooks/use-analyses";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, FileImage, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyzePage() {
  const { mutate: analyze, isPending } = useCreateAnalysis();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
  });

  const handleAnalysis = () => {
    if (!file) return;

    // Simulate progress for UX
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 90) clearInterval(interval);
    }, 200);

    // In a real app, we'd upload the file here.
    // For this mock, we just send metadata.
    analyze(
      {
        filename: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        imageUrl: preview || undefined, // Send blob URL just for mock display
        resolution: "1920x1080", // Mock resolution
      },
      {
        onSuccess: () => {
          clearInterval(interval);
          setUploadProgress(100);
          setFile(null);
          setPreview(null);
          // Redirect or show success modal? 
          // For now, toast handles feedback (in hook)
          setTimeout(() => setUploadProgress(0), 1000); 
        },
        onError: () => {
          clearInterval(interval);
          setUploadProgress(0);
        }
      }
    );
  };

  return (
    <LayoutShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New Analysis</h2>
          <p className="text-muted-foreground mt-1">Upload an image to detect AI manipulation.</p>
        </div>

        <Card className="border-2 border-dashed border-border shadow-none hover:border-primary/50 transition-colors">
          <CardContent className="p-0">
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center min-h-[400px] p-8 cursor-pointer transition-colors ${
                isDragActive ? "bg-secondary/50" : "bg-transparent"
              }`}
            >
              <input {...getInputProps()} />
              
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden shadow-xl"
                  >
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium">Click to change image</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto">
                      <CloudUpload className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold">Drag & drop your image here</p>
                      <p className="text-muted-foreground mt-1">or click to browse files</p>
                    </div>
                    <div className="flex gap-2 justify-center text-xs text-muted-foreground mt-4">
                      <span className="bg-secondary px-2 py-1 rounded">JPG</span>
                      <span className="bg-secondary px-2 py-1 rounded">PNG</span>
                      <span className="bg-secondary px-2 py-1 rounded">WEBP</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Action Area */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-6 rounded-xl shadow-lg flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileImage className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                  </p>
                </div>
              </div>

              {isPending && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-2">
                <Button 
                  variant="outline" 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAnalysis} 
                  disabled={isPending}
                  className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" /> Start Analysis
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex gap-3 text-sm text-blue-900 dark:text-blue-100">
          <AlertTriangle className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <p>
            Files uploaded are processed securely and deleted from our servers after 24 hours. 
            For sensitive documents, please use the Enterprise Private Cloud solution.
          </p>
        </div>
      </div>
    </LayoutShell>
  );
}
