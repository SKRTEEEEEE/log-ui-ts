import { ImgRepository } from "@log-ui/core/application/interfaces/services/img";
import { UploadThingAdapter } from "../connectors/uploadthing-st";

class StorageActionError extends Error {
  constructor(action: string, repositoryName: string, details?: Record<string, unknown>) {
    super(`Storage action '${action}' failed in ${repositoryName}. Details: ${JSON.stringify(details)}`);
    this.name = "StorageActionError";
  }
}

class InputParseError extends Error {
  constructor(contextName: string, message: string) {
    super(`Input parse error in ${contextName}: ${message}`);
    this.name = "InputParseError";
  }
}

class UploadThingImgRepository extends UploadThingAdapter implements ImgRepository {
  async uploadImage(file: File): Promise<string> {
    if (!(file instanceof File)) {
      throw new InputParseError("UploadThingImgRepository", "El elemento no es un archivo válido");
    }

    const results = await this.utapi.uploadFiles([file]);
    const firstResult = results[0];
    
    if (!firstResult.data) {
      throw new StorageActionError("upload", "UploadThingImgRepository", { 
        type: "image", 
        optionalMessage: "No result: " + JSON.stringify(firstResult) 
      });
    }
    
    return firstResult.data.url;
  }

  async deleteImage(img: string): Promise<boolean> {
    const { success, deletedCount } = await this.utapi.deleteFiles(img);
    console.log(`Eliminada: ${success} \n ${deletedCount} Imagen ${img}`);
    return success;
  }

  useUtapi() {
    return this.utapi;
  }
}

export const uploadthingImgRepository = new UploadThingImgRepository();
