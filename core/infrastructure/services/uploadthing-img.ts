import { ImgRepository } from "@log-ui/core/application/interfaces/services/img";
import { UploadThingAdapter } from "../connectors/uploadthing-st";
import { createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain";

class UploadThingImgRepository extends UploadThingAdapter implements ImgRepository {
  async uploadImage(file: File): Promise<string> {
    if (!(file instanceof File)) {
      throw createDomainError(
        ErrorCodes.INPUT_PARSE,
        UploadThingImgRepository,
        "uploadImage",
        {
          es: "Por favor, selecciona un archivo válido",
          en: "Please select a valid file",
          ca: "Si us plau, selecciona un arxiu vàlid",
          de: "Bitte wähle eine gültige Datei aus"
        },
        { optionalMessage: "The element is not a valid file" }
      );
    }

    const results = await this.utapi.uploadFiles([file]);
    const firstResult = results[0];
    
    if (!firstResult.data) {
      throw createDomainError(
        ErrorCodes.SHARED_ACTION,
        UploadThingImgRepository,
        "uploadImage",
        "tryAgainOrContact",
        { 
          entity: "image",
          optionalMessage: "No result from uploadFiles: " + JSON.stringify(firstResult)
        }
      );
    }
    
    return firstResult.data.url;
  }

  async deleteImage(img: string): Promise<boolean> {
    const { success } = await this.utapi.deleteFiles(img);
    return success;
  }

  useUtapi() {
    return this.utapi;
  }
}

export const uploadthingImgRepository = new UploadThingImgRepository();
