import { ApiBaseRepository, Modules } from "./base.repository";
import { RoleBase, createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain";

export class ApiRoleRepository extends ApiBaseRepository {
  constructor(baseUrl?: string) {
    super(Modules.ROLE, baseUrl);
  }

  async create(data: Omit<RoleBase, "id">, jwt?: string) {
    const response = await fetch(this.getEndpointModule("create"), {
      method: this.endpoints.create.method,
      headers: {
        "Content-type": "application/json",
        ...(jwt && { Authorization: `Bearer ${jwt}` }),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok)
      throw createDomainError(
        ErrorCodes.DATABASE_ACTION,
        ApiRoleRepository,
        "create",
        "tryAgainOrContact",
        { entity: "role", optionalMessage: `Error creating role: ${response.statusText}` }
      );
    return await response.json();
  }

  async readById(id: string, jwt?: string) {
    const response = await fetch(
      this.getEndpointModule("readById").replace(":id", id),
      {
        method: this.endpoints.readById.method,
        headers: {
          "Content-type": "application/json",
          ...(jwt && { Authorization: `Bearer ${jwt}` }),
        },
      }
    );
    if (!response.ok)
      throw createDomainError(
        ErrorCodes.DATABASE_FIND,
        ApiRoleRepository,
        "readById",
        "tryAgainOrContact",
        { entity: "role", optionalMessage: `Error reading role by ID: ${response.statusText}` }
      );
    return await response.json();
  }

  async read(filter?: Record<string, unknown>, jwt?: string) {
    const queryParams = filter ? `?${new URLSearchParams(filter as Record<string, string>).toString()}` : '';
    const response = await fetch(
      `${this.getEndpointModule("readAll")}${queryParams}`,
      {
        method: this.endpoints.readAll.method,
        headers: {
          "Content-type": "application/json",
          ...(jwt && { Authorization: `Bearer ${jwt}` }),
        },
      }
    );
    if (!response.ok)
      throw createDomainError(
        ErrorCodes.DATABASE_FIND,
        ApiRoleRepository,
        "read",
        "tryAgainOrContact",
        { entity: "roles", optionalMessage: `Error reading roles: ${response.statusText}` }
      );
    return await response.json();
  }

  async updateById(props: { id: string; updateData?: Partial<RoleBase> }, jwt?: string) {
    const response = await fetch(
      this.getEndpointModule("update").replace(":id", props.id),
      {
        method: this.endpoints.update.method,
        headers: {
          "Content-type": "application/json",
          ...(jwt && { Authorization: `Bearer ${jwt}` }),
        },
        body: JSON.stringify(props.updateData),
      }
    );
    if (!response.ok)
      throw createDomainError(
        ErrorCodes.DATABASE_ACTION,
        ApiRoleRepository,
        "updateById",
        "tryAgainOrContact",
        { entity: "role", optionalMessage: `Error updating role: ${response.statusText}` }
      );
    return await response.json();
  }

  async deleteById(id: string, jwt?: string) {
    const response = await fetch(
      this.getEndpointModule("delete").replace(":id", id),
      {
        method: this.endpoints.delete.method,
        headers: {
          "Content-type": "application/json",
          ...(jwt && { Authorization: `Bearer ${jwt}` }),
        },
      }
    );
    if (!response.ok)
      throw createDomainError(
        ErrorCodes.DATABASE_ACTION,
        ApiRoleRepository,
        "deleteById",
        "tryAgainOrContact",
        { entity: "role", optionalMessage: `Error deleting role: ${response.statusText}` }
      );
    return await response.json();
  }

  async delete(props: { filter: Record<string, unknown> }, jwt?: string) {
    const response = await fetch(this.getEndpointModule("deleteMany"), {
      method: this.endpoints.deleteMany.method,
      headers: {
        "Content-type": "application/json",
        ...(jwt && { Authorization: `Bearer ${jwt}` }),
      },
      body: JSON.stringify(props.filter),
    });
    if (!response.ok)
      throw createDomainError(
        ErrorCodes.DATABASE_ACTION,
        ApiRoleRepository,
        "delete",
        "tryAgainOrContact",
        { entity: "roles", optionalMessage: `Error deleting roles: ${response.statusText}` }
      );
    return await response.json();
  }
}
