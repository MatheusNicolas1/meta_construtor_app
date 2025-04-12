
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Photo {
  id: string;
  url: string;
  file: File;
}

interface PhotoUploaderProps {
  onPhotosChange?: (photos: Photo[]) => void;
  initialPhotos?: Photo[];
  maxPhotos?: number;
}

export function PhotoUploader({ 
  onPhotosChange, 
  initialPhotos = [], 
  maxPhotos = 10 
}: PhotoUploaderProps) {
  const { resolvedTheme } = useTheme();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      // Check if adding these files would exceed the maximum
      if (photos.length + event.target.files.length > maxPhotos) {
        toast.error(`Você só pode adicionar até ${maxPhotos} fotos`);
        return;
      }
      
      setIsUploading(true);
      
      try {
        const newPhotos = Array.from(event.target.files).map((file) => ({
          id: crypto.randomUUID(),
          url: URL.createObjectURL(file),
          file,
        }));

        const updatedPhotos = [...photos, ...newPhotos];
        setPhotos(updatedPhotos);
        onPhotosChange?.(updatedPhotos);
        toast.success(`${newPhotos.length} foto(s) adicionada(s) com sucesso`);
      } catch (error) {
        console.error("Error handling file upload:", error);
        toast.error("Erro ao adicionar fotos");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemovePhoto = (id: string) => {
    const photoToRemove = photos.find(photo => photo.id === id);
    
    if (photoToRemove) {
      // Revoke object URL to avoid memory leaks
      URL.revokeObjectURL(photoToRemove.url);
      
      const updatedPhotos = photos.filter((photo) => photo.id !== id);
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);
      toast.success("Foto removida com sucesso");
    }
  };

  const uploadPhotoToStorage = async (photo: Photo, path: string) => {
    const fileExt = photo.file.name.split('.').pop();
    const filePath = `${path}/${photo.id}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('rdo-photos')
      .upload(filePath, photo.file);
      
    if (error) {
      throw error;
    }
    
    const { data } = supabase.storage.from('rdo-photos').getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          id="photo-upload"
          onChange={handleFileChange}
          disabled={isUploading || photos.length >= maxPhotos}
        />
        <label htmlFor="photo-upload">
          <Button
            type="button"
            variant="default"
            size="sm"
            className={cn(
              "bg-orange-500 hover:bg-orange-600 text-white",
              (isUploading || photos.length >= maxPhotos) && "opacity-50 cursor-not-allowed"
            )}
            disabled={isUploading || photos.length >= maxPhotos}
            asChild
          >
            <span>
              <Image className="mr-1 h-4 w-4" />
              {isUploading ? "Adicionando..." : "Adicionar Foto"}
            </span>
          </Button>
        </label>
        {photos.length > 0 && (
          <span className="ml-3 text-xs text-muted-foreground">
            {photos.length} de {maxPhotos} fotos
          </span>
        )}
      </div>
      
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={cn(
                "relative group rounded-md overflow-hidden h-24",
                resolvedTheme === "dark" ? "border border-gray-700" : "border border-gray-200"
              )}
            >
              <img
                src={photo.url}
                alt="Foto do RDO"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(photo.id)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remover foto"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Export helper function to upload photos to storage
export async function uploadPhotosToStorage(photos: Photo[], rdoId: string) {
  const uploadPromises = photos.map(photo => {
    const fileExt = photo.file.name.split('.').pop();
    const filePath = `rdo/${rdoId}/${photo.id}.${fileExt}`;
    
    return supabase.storage
      .from('rdo-photos')
      .upload(filePath, photo.file)
      .then(({ data, error }) => {
        if (error) throw error;
        return supabase.storage
          .from('rdo-photos')
          .getPublicUrl(filePath)
          .then(({ data }) => ({
            id: photo.id,
            url: data.publicUrl,
            rdo_id: rdoId
          }));
      });
  });
  
  return Promise.all(uploadPromises);
}
