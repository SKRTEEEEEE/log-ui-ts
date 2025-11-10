import { ApiBaseRepository, Modules, ApiResponseError } from "./base.repository";
import { cookies } from "next/headers";
import { RoleBase } from "@log-ui/core/domain/entities/role.d";

export class ApiRoleRepository extends ApiBaseRepository {
  constructor(baseUrl?: string) {
    super(Modules.ROLE, baseUrl);
  }

  async create(data: Omit<RoleBase, "id">) {
    const jwt = (await cookies()).get("jwt");
    const response = await fetch(this.getEndpointModule("create"), {
      method: this.endpoints.create.method,
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${jwt?.value}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok)
      throw new ApiResponseError("create", ApiRoleRepository, {
        module: this.module,
        optionalMessage: `Error creating role: ${response.statusText}`,
      });
    return await response.json();
  }

  async readById(id: string) {
    const jwt = (await cookies()).get("jwt");
    const response = await fetch(
      this.getEndpointModule("readById").replace(":id", id),
      {
        method: this.endpoints.readById.method,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${jwt?.value}`,
        },
      }
    );
    if (!response.ok)
      throw new ApiResponseError("readById", ApiRoleRepository, {
        module: this.module,
        optionalMessage: `Error reading role by ID: ${response.statusText}`,
      });
    return await response.json();
  }

  async read(filter?: Record<string, unknown>) {
    const jwt = (await cookies()).get("jwt");
    const queryParams = filter ? `?${new URLSearchParams(filter as Record<string, string>).toString()}` : '';
    const response = await fetch(
      `${this.getEndpointModule("readAll")}${queryParams}`,
      {
        method: this.endpoints.readAll.method,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${jwt?.value}`,
        },
      }
    );
    if (!response.ok)
      throw new ApiResponseError("read", ApiRoleRepository, {
        module: this.module,
        optionalMessage: `Error reading roles: ${response.statusText}`,
      });
    return await response.json();
  }

  async updateById(props: { id: string; updateData?: Partial<RoleBase> }) {
    const jwt = (await cookies()).get("jwt");
    const response = await fetch(
      this.getEndpointModule("update").replace(":id", props.id),
      {
        method: this.endpoints.update.method,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${jwt?.value}`,
        },
        body: JSON.stringify(props.updateData),
      }
    );
    if (!response.ok)
      throw new ApiResponseError("updateById", ApiRoleRepository, {
        module: this.module,
        optionalMessage: `Error updating role: ${response.statusText}`,
      });
    return await response.json();
  }

  async deleteById(id: string) {
    const jwt = (await cookies()).get("jwt");
    const response = await fetch(
      this.getEndpointModule("delete").replace(":id", id),
      {
        method: this.endpoints.delete.method,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${jwt?.value}`,
        },
      }
    );
    if (!response.ok)
      throw new ApiResponseError("deleteById", ApiRoleRepository, {
        module: this.module,
        optionalMessage: `Error deleting role: ${response.statusText}`,
      });
    return await response.json();
  }

  async delete(props: { filter: Record<string, unknown> }) {
    const jwt = (await cookies()).get("jwt");
    const response = await fetch(this.getEndpointModule("deleteMany"), {
      method: this.endpoints.deleteMany.method,
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${jwt?.value}`,
      },
      body: JSON.stringify(props.filter),
    });
    if (!response.ok)
      throw new ApiResponseError("delete", ApiRoleRepository, {
        module: this.module,
        optionalMessage: `Error deleting roles: ${response.statusText}`,
      });
    return await response.json();
  }
}
