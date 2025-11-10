import { ApiBaseRepository, Modules, ApiResponseError } from "./base.repository";
import { cookies } from "next/headers";
import { VerifyLoginPayloadParams } from "thirdweb/auth";
import { RoleType } from "@log-ui/core/domain/entities/role.type";
import { setJwtUC } from "@log-ui/core/application/usecases/services/auth";

export type UserUpdateData = {
  id: string;
  nick?: string | null;
  img: string | null;
  email: string | null;
};

export class ApiUserRepository extends ApiBaseRepository {
  constructor(baseUrl?: string) {
    super(Modules.USER, baseUrl);
  }
  async readAll() {
    console.log(this.getEndpointModule("readAll"));
    const jwt = (await cookies()).get("jwt");

    const response = await fetch(this.getEndpointModule("readAll"), {
      method: this.endpoints.readAll.method,
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${jwt?.value}`,
      },
    });
    if (!response.ok)
      throw new ApiResponseError("readAll", ApiUserRepository, {
        module: this.module,
        optionalMessage: `Error reading all users: ${response.statusText}`,
      });
    return await response.json();
  }
  async login(data: { payload: VerifyLoginPayloadParams }) {
    const jwt = (await cookies()).get("jwt");
    console.log("login... :", this.getEndpointModule("login"));
    console.log(data.payload);
    const response = await fetch(this.getEndpointModule("login"), {
      method: this.endpoints.login.method,
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${jwt?.value}`,
        "x-signed-payload": `${JSON.stringify(data.payload)}`,
      },
    });
    console.log(response);
    if (!response.ok)
      throw new ApiResponseError("create", ApiUserRepository, {
        module: this.module,
        optionalMessage: `Error creating user: ${response.statusText}`,
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
      throw new ApiResponseError("readById", ApiUserRepository, {
        module: this.module,
        optionalMessage: `Error reading user by ID: ${response.statusText}`,
      });
    return await response.json();
  }

  async update(data: {
    payload: VerifyLoginPayloadParams;
    formData: UserUpdateData;
  }) {
    const jwt = (await cookies()).get("jwt");
    const response = await fetch(this.getEndpointModule("update"), {
      method: this.endpoints.update.method,
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${jwt?.value}`,
        "x-signed-payload": `${JSON.stringify(data.payload)}`,
      },
      body: JSON.stringify(data.formData),
    });
    if (!response.ok)
      throw new ApiResponseError("update", ApiUserRepository, {
        module: this.module,
        optionalMessage: `Error updating user: ${response.statusText}`,
      });
    const res = await response.json();
    // Actualizar JWT con nuevos datos
    await setJwtUC(data.payload, {
      nick: res.data.nick,
      id: res.data.id,
      role: res.data.role,
      img: res.data.img || undefined,
    });
    return res;
  }

  async deleteById(data: {
    payload: VerifyLoginPayloadParams;
    id: string;
    address: string;
  }) {
    const jwt = (await cookies()).get("jwt");
    const response = await fetch(
      this.getEndpointModule("delete"),
      {
        method: this.endpoints.delete.method,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${jwt?.value}`,
          "x-signed-payload": `${JSON.stringify(data.payload)}`,
        },
        body: JSON.stringify({ id: data.id, address: data.address }),
      }
    );
    if (!response.ok)
      throw new ApiResponseError("deleteById", ApiUserRepository, {
        module: this.module,
        optionalMessage: `Error deleting user: ${response.statusText}`,
      });
    return await response.json();
  }

  async updateSolicitud(data: { id: string; solicitud: RoleType }) {
    const jwt = (await cookies()).get("jwt");
    const response = await fetch(this.getEndpointModule("updateSolicitud"), {
      method: this.endpoints.updateSolicitud.method,
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${jwt?.value}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok)
      throw new ApiResponseError("updateSolicitud", ApiUserRepository, {
        module: this.module,
        optionalMessage: `Error updating user solicitud: ${response.statusText}`,
      });
    return await response.json();
  }

  async resendVerificationEmail(data: { id: string; email: string }) {
    const jwt = (await cookies()).get("jwt");
    const response = await fetch(this.getEndpointModule("resendVerificationEmail"), {
      method: this.endpoints.resendVerificationEmail.method,
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${jwt?.value}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok)
      throw new ApiResponseError("resendVerificationEmail", ApiUserRepository, {
        module: this.module,
        optionalMessage: `Error resending verification email: ${response.statusText}`,
      });
    return await response.json();
  }
}
