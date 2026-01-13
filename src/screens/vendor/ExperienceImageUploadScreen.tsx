import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Check,
  Loader2,
  GripVertical,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ExperienceImageRecord } from '@/lib/types';

interface ExperienceImageUploadScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

export function ExperienceImageUploadScreen({
  onBack,
  onComplete,
}: ExperienceImageUploadScreenProps) {
  const [images, setImages] = useState<ExperienceImageRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(
        file.type,
      );
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

      if (!isValidType) toast.error(`${file.name} is not a valid image type`);
      if (!isValidSize) toast.error(`${file.name} is too large (max 10MB)`);

      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload process
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise((r) => setTimeout(r, 100));
    }

    const newRecords: ExperienceImageRecord[] = validFiles.map(
      (file, index) => ({
        id: crypto.randomUUID(),
        experienceId: 'current-draft-id',
        // Create a local object URL for preview
        imageUrl: URL.createObjectURL(file),
        displayOrder: images.length + index,
        createdAt: new Date().toISOString(),
      }),
    );

    setImages((prev) => [...prev, ...newRecords]);
    setUploading(false);
    toast.success(`${validFiles.length} images uploaded`);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (dragIndex: number, hoverIndex: number) => {
    const newImages = [...images];
    const draggedImage = newImages[dragIndex];
    if (!draggedImage) return;
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);

    // Update display orders
    const updatedWithOrder = newImages.map((img, idx) => ({
      ...img,
      displayOrder: idx,
    }));

    setImages(updatedWithOrder);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Upload Images</h1>
              <p className="text-xs text-muted-foreground">
                Add at least 3 photos
              </p>
            </div>
          </div>
          <Button
            onClick={onComplete}
            disabled={images.length < 3 || uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Publish Experience
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            uploading
              ? 'border-primary/50 bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Drag & drop your photos here
              </h3>
              <p className="text-muted-foreground mt-1">
                or click to browse from your computer
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP up to 10MB each
            </p>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Select Files
            </Button>
          </div>

          {uploading && (
            <div className="mt-8 max-w-xs mx-auto space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Image Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold font-display">
              Gallery ({images.length})
            </h2>
            {images.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Drag items to reorder
              </p>
            )}
          </div>

          {images.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No images uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="group relative aspect-[4/3] bg-muted rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all cursor-move"
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData('text/plain', index.toString())
                  }
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dragIndex = parseInt(
                      e.dataTransfer.getData('text/plain'),
                    );
                    moveImage(dragIndex, index);
                  }}
                >
                  <img
                    src={img.imageUrl}
                    alt="Upload"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => removeImage(img.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Badge for Cover Photo */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-sm font-medium">
                      Cover Photo
                    </div>
                  )}

                  {/* Order Indicator */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
