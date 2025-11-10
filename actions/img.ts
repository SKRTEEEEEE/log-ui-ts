"use server";

import { deleteImageUC, uploadImageUC } from "@log-ui/core/application/usecases/services/img";

class InputParseError extends Error {
  constructor(contextName: string, message: string) {
    super(`Input parse error in ${contextName}: ${message}`);
    this.name = "InputParseError";
  }
}

export async function uploadImg(formData: FormData) {
  const img = formData.get("img") as File;
  if (!img) throw new InputParseError("uploadImg", "No se encontró el archivo en el FormData");
  return await uploadImageUC(img);
}

export async function deleteImg(img: string) {
  return await deleteImageUC(img);
}

export async function updateImg(formData: FormData, url: string) {
  const img = formData.get("img") as File;
  if (!img) throw new InputParseError("updateImg", "No se encontró el archivo en el FormData");
  const dR = await deleteImageUC(url);
  if (!dR) throw new Error("Error at delete img");
  return await uploadImageUC(img);
}
