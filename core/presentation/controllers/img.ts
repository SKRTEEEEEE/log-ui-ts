"use server";

import { deleteImageUC, uploadImageUC } from "@log-ui/core/application/usecases/services/img";
import { createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain";

export async function uploadImg(formData: FormData) {
  const img = formData.get("img") as File;
  if (!img) throw createDomainError(
    ErrorCodes.INPUT_PARSE,
    uploadImg,
    "uploadImg",
    {
      es: "Por favor, selecciona una imagen válida",
      en: "Please select a valid image",
      ca: "Si us plau, selecciona una imatge vàlida",
      de: "Bitte wähle ein gültiges Bild aus"
    },
    { optionalMessage: "No se encontró el archivo en el FormData" }
  );
  return await uploadImageUC(img);
}

export async function updateImg(formData: FormData, url: string) {
  const img = formData.get("img") as File;
  if (!img) throw createDomainError(
    ErrorCodes.INPUT_PARSE,
    updateImg,
    "updateImg",
    {
      es: "Por favor, selecciona una imagen válida",
      en: "Please select a valid image",
      ca: "Si us plau, selecciona una imatge vàlida",
      de: "Bitte wähle ein gültiges Bild aus"
    },
    { optionalMessage: "No se encontró el archivo en el FormData" }
  );
  const dR = await deleteImageUC(url);
  if (!dR) throw createDomainError(
    ErrorCodes.SHARED_ACTION,
    updateImg,
    "updateImg",
    "tryAgainOrContact",
    { optionalMessage: "Error deleting previous image" }
  );
  return await uploadImageUC(img);
}
