"use server";

import { apiUpdateUserUC, apiDeleteUserUC, apiUpdateUserSolicitudUC, apiResendVerificationEmailUC, apiReadUserByIdUC } from "@log-ui/core/application/usecases/entities/user";
import { getCookiesUC } from "@log-ui/core/application/usecases/services/auth";
import { revalidatePath } from "next/cache";
import { LoginPayload } from "thirdweb/auth";
import { RoleType } from "@skrteeeeee/profile-domain";

export const userInCookiesUC = async () => {
    try {
        const cookies = await getCookiesUC()
        if (!cookies || !cookies.ctx) return null
        
        // Obtener datos completos del usuario desde el backend
        const userData = await apiReadUserByIdUC(cookies.ctx.id)
        if (!userData || !userData.success) return null
        
        return {
            id: userData.data.id,
            nick: userData.data.nick,
            img: userData.data.img,
            email: userData.data.email,
            address: userData.data.address,
            role: userData.data.role,
            isVerified: userData.data.isVerified,
            solicitud: userData.data.solicitud
        }
    } catch (error) {
        console.error("Error fetching user from cookies:", error)
        return null
    }
}

export async function updateUser(
  id: string,
  payload: {
    signature: `0x${string}`;
    payload: LoginPayload;
  },
  formData: { email: string | null; nick?: string; img: string | null }
) {
  const res = await apiUpdateUserUC({
    payload,
    formData: {
      id,
      nick: formData.nick ? formData.nick : null,
      img: formData.img,
      email: formData.email,
    },
  });
  revalidatePath("/");
  return res;
}

export async function deleteUser(
  payload: {
    signature: `0x${string}`;
    payload: LoginPayload;
  },
  id: string,
  address: string
) {
  const res = await apiDeleteUserUC({ payload, id, address });
  if (!res.success) {
    throw new Error(res.message || "Error deleting user");
  }
  revalidatePath("/");
}

export async function updateUserSolicitud(data: {
  id: string;
  solicitud: RoleType;
}) {
  const res = await apiUpdateUserSolicitudUC(data);
  revalidatePath("/");
  return res;
}

export async function resendVerificationEmail(userI: {
  id: string;
  email: string;
}) {
  return await apiResendVerificationEmailUC(userI);
}
