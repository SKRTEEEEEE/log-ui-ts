import { uploadthingImgRepository } from "@log-ui/core/infrastructure/services/uploadthing-img";
import { ImgRepository } from "../../interfaces/services/img";
import { createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain";

abstract class UseImage {
  constructor(protected imgRepository: ImgRepository) {}
}

class DeleteImage extends UseImage {
  async execute(img: string): Promise<boolean> {
    const fileName = img.split("/").pop();
    if (fileName === undefined) throw createDomainError(
      ErrorCodes.INPUT_PARSE,
      DeleteImage,
      "execute",
      {
        es: "URL de imagen inválida",
        en: "Invalid image URL",
        ca: "URL d'imatge invàlida",
        de: "Ungültige Bild-URL"
      },
      { optionalMessage: "Could not extract filename from URL path" }
    );
    return this.imgRepository.deleteImage(fileName);
  }
}

export const deleteImageUC = async (img: string) => {
  const d = new DeleteImage(uploadthingImgRepository);
  return await d.execute(img);
};

class UploadImage extends UseImage {
  async execute(file: File): Promise<string> {
    return this.imgRepository.uploadImage(file);
  }
}

export const uploadImageUC = async (file: File) => {
  const u = new UploadImage(uploadthingImgRepository);
  return await u.execute(file);
};
