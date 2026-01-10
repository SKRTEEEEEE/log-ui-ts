import { uploadthingImgRepository } from "@log-ui/core/infrastructure/services/uploadthing-img";
import { createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain";

// Simplified use cases - with minimal business logic
export const deleteImageUC = (img: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const fileName = img.split("/").pop();
        if (!fileName) { // Changed condition from fileName === undefined to !fileName
            reject(createDomainError(
                ErrorCodes.INPUT_PARSE, // Changed order of arguments
                deleteImageUC, // Pass the function reference as location
                "deleteImageUC",
                {
                    es: "URL de imagen inválida",
                    en: "Invalid image URL",
                    ca: "URL d'imatge invàlida",
                    de: "Ungültige Bild-URL"
                },
                { optionalMessage: "Could not extract filename from URL path" }
            ));
        } else {
            resolve(uploadthingImgRepository.deleteImage(fileName));
        }
    });
};

export const uploadImageUC = async (file: File): Promise<string> => {
  return uploadthingImgRepository.uploadImage(file);
};
