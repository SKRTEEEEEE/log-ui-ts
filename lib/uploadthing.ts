import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { ourFileRouter } from "@log-ui/core/infrastructure/connectors/uploadthing-st";

export const { useUploadThing, uploadFiles } = generateReactHelpers<typeof ourFileRouter>();

// Componentes pre-generados con tipos correctos
export const UploadButton = generateUploadButton<typeof ourFileRouter>();
export const UploadDropzone = generateUploadDropzone<typeof ourFileRouter>();
