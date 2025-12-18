import { uploadthingImgRepository } from "@log-ui/core/infrastructure/services/uploadthing-img";
import { createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain";

// Simplified use cases - with minimal business logic
export const deleteImageUC = async (img: string): Promise<boolean> => {
  const fileName = img.split("/").pop();
  if (fileName === undefined) throw createDomainError(
    ErrorCodes.INPUT_PARSE,
    deleteImageUC,
    "deleteImageUC",
    {
      es: "URL de imagen inválida",
      en: "Invalid image URL",
      ca: "URL d'imatge invàlida",
      de: "Ungültige Bild-URL"
    },
    { optionalMessage: "Could not extract filename from URL path" }
  );
  return uploadthingImgRepository.deleteImage(fileName);
};

export const uploadImageUC = async (file: File): Promise<string> => {
  return uploadthingImgRepository.uploadImage(file);
};
