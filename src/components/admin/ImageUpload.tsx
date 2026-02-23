import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { encodeImageUrl } from '@/lib/imageUtils';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onFilesChange?: (files: File[]) => void;
  onDeleteImage?: (url: string) => void;
  maxImages?: number;
  bucket?: 'product-images' | 'flower-images' | 'accessory-images';
  multiple?: boolean;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  onFilesChange,
  onDeleteImage,
  maxImages = 10,
  multiple = true,
  label = 'Upload Images',
}) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>(images);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreviewUrls(images);
    // Reset uploaded files if images change and none are blob URLs (meaning they're external URLs, not local file previews)
    const hasBlobUrls = images.some(url => url.startsWith('blob:'));
    if (!hasBlobUrls && images.length > 0) {
      // Clear uploaded files when external URLs are set (e.g., when editing existing items)
      setUploadedFiles([]);
    } else if (images.length === 0) {
      // Clear uploaded files when images array is empty
      setUploadedFiles([]);
    }
  }, [images]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // For single image mode, replace existing; for multiple, add to existing
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    const finalPreviewUrls = multiple 
      ? [...previewUrls, ...newPreviewUrls]
      : newPreviewUrls;

    // Check max images limit
    if (finalPreviewUrls.length > maxImages) {
      // Revoke the blob URLs we just created
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Revoke old blob URLs if replacing (single image mode)
    if (!multiple && previewUrls.length > 0) {
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    }

    setPreviewUrls(finalPreviewUrls);

    // Store files for upload - replace for single, add for multiple
    const finalFiles = multiple ? [...uploadedFiles, ...files] : files;
    setUploadedFiles(finalFiles);
    if (onFilesChange) {
      onFilesChange(finalFiles);
    }

    // Update images array with placeholder URLs (will be replaced with actual URLs after upload)
    const finalImages = multiple ? [...images, ...newPreviewUrls] : newPreviewUrls;
    onImagesChange(finalImages);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const removedUrl = images[index];
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    const newImages = images.filter((_, i) => i !== index);
    const newFiles = uploadedFiles.filter((_, i) => i !== index);

    // Revoke object URL if it's a preview
    if (previewUrls[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }

    setPreviewUrls(newPreviewUrls);
    setUploadedFiles(newFiles);
    onImagesChange(newImages);
    if (onFilesChange) {
      onFilesChange(newFiles);
    }
    if (onDeleteImage && removedUrl && !removedUrl.startsWith('blob:')) {
      onDeleteImage(removedUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      // For single image mode, only take the first file
      const filesToUse = multiple ? files : [files[0]];
      const dataTransfer = new DataTransfer();
      filesToUse.forEach((file) => dataTransfer.items.add(file));
      
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({ target: fileInputRef.current } as any);
      }
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">{label}</label>
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {multiple ? `Up to ${maxImages} images` : 'Single image'} (PNG, JPG, WEBP)
        </p>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={url.startsWith('blob:') ? url : encodeImageUrl(url)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {previewUrls.length === 0 && (
        <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">No images uploaded</p>
          </div>
        </div>
      )}
    </div>
  );
};

