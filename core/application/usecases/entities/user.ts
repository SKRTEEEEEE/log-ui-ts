import { VerifyLoginPayloadParams } from "thirdweb/auth";
import { ApiUserRepository, UserUpdateData } from "@log-ui/core/infrastructure/api/user.repository";
import { RoleType } from "@log-ui/core/domain/entities/role.type";

const apiUserRepository = new ApiUserRepository(process.env.NEXT_PUBLIC_BACKEND_URL);

export const apiReadUserByIdUC = async (id: string) => {
    return await apiUserRepository.readById(id)
}

export const apiReadUsersUC = async () => {
    return await apiUserRepository.readAll()
}

export const apiLoginUserUC = async (data:{payload: VerifyLoginPayloadParams}) => {
    return await apiUserRepository.login(data)
}

export const apiUpdateUserUC = async (data: {
    payload: VerifyLoginPayloadParams;
    formData: UserUpdateData;
}) => {
    return await apiUserRepository.update(data)
}

export const apiDeleteUserUC = async (data: {
    payload: VerifyLoginPayloadParams;
    id: string;
    address: string;
}) => {
    return await apiUserRepository.deleteById(data)
}

export const apiUpdateUserSolicitudUC = async (data: {
    id: string;
    solicitud: RoleType;
}) => {
    return await apiUserRepository.updateSolicitud(data)
}

export const apiResendVerificationEmailUC = async (userI: {
    id: string;
    email: string;
}) => {
    return await apiUserRepository.resendVerificationEmail(userI)
}
