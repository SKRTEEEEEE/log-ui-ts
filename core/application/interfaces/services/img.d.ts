import { UTApi } from "uploadthing/server";

export type ImgRepository = {
  deleteImage(img: string): Promise<boolean>;
  uploadImage(file: File): Promise<string>;
  useUtapi(): UTApi;
};
