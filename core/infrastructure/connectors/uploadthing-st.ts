import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { authRepository } from "@log-ui/core/presentation/services/auth.service";
import { AuthRepository } from "@log-ui/core/application/interfaces/services/auth";
import { createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain";

export abstract class UploadThingAdapter {
  protected f = createUploadthing();
  protected static utapiInstance: UTApi | null = null;

  protected get utapi(): UTApi {
    if (!UploadThingAdapter.utapiInstance) {
      UploadThingAdapter.utapiInstance = new UTApi();
    }
    return UploadThingAdapter.utapiInstance;
  }
}

class ConcreteUploadThingAdapter extends UploadThingAdapter {
  constructor(private authRepository: AuthRepository) {
    super();
  }

  createFileRouter(): FileRouter {
    return {
      imageUploader: this.f({ 
        image: { maxFileSize: "4MB" } 
      })
        .middleware(async () => {
          // This code runs on your server before upload
          const user = await this.authRepository.getCookies();

          // If unauthorized, prevent upload
          if (user === false) {
            throw createDomainError(
              ErrorCodes.UNAUTHORIZED_ACTION,
              ConcreteUploadThingAdapter,
              "middleware",
              "credentials",
              { entity: "file upload", optionalMessage: "User not authenticated" }
            );
          }

          // Whatever is returned here is accessible in onUploadComplete as `metadata`
          return { userId: user.ctx.id };
        })
        .onUploadComplete(async ({ metadata }) => {
          // This code RUNS ON YOUR SERVER after upload
          // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
          return { uploadedBy: metadata.userId };
        }),
    } satisfies FileRouter;
  }
}

const concreteUploadthingAdapter = new ConcreteUploadThingAdapter(authRepository);
export const ourFileRouter = concreteUploadthingAdapter.createFileRouter();

// Exportar el tipo para usar en otros archivos
export type OurFileRouter = typeof ourFileRouter;
