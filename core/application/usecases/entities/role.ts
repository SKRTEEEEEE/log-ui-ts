import { RoleBase } from "@skrteeeeee/profile-domain";
import { ApiRoleRepository } from "@log-ui/core/infrastructure/api/role.repository";

const apiRoleRepository = new ApiRoleRepository(process.env.NEXT_PUBLIC_BACKEND_URL);

export const apiCreateRoleUC = async (newRole: Omit<RoleBase, "id">) => {
    return await apiRoleRepository.create(newRole)
}

export const apiReadRoleByIdUC = async (id: string) => {
    return await apiRoleRepository.readById(id)
}

export const apiReadRolesUC = async (filter?: Record<string, unknown>) => {
    return await apiRoleRepository.read(filter)
}

export const apiUpdateRoleByIdUC = async (props: { id: string; updateData?: Partial<RoleBase> }) => {
    return await apiRoleRepository.updateById(props)
}

export const apiDeleteRoleByIdUC = async (id: string) => {
    return await apiRoleRepository.deleteById(id)
}

export const apiDeleteRolesUC = async (props: { filter: Record<string, unknown> }) => {
    return await apiRoleRepository.delete(props)
}
