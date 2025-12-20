import { ApiBaseRepository, Modules } from "./base.repository";
import { VerifyLoginPayloadParams } from "thirdweb/auth";
import { RoleType, createDomainError, ErrorCodes } from "@skrteeeeee/profile-domain";

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
  async readAll(jwt?: string) {
    const response = await fetch(this.getEndpointModule("readAll"), {
      method: this.endpoints.readAll.method,
      headers: {
        "Content-type": "application/json",
        ...(jwt && { Authorization: `Bearer ${jwt}` }),
      },
    });
    if (!response.ok)
      throw createDomainError(
        ErrorCodes.DATABASE_FIND,
        ApiUserRepository,
        "readAll",
        "tryAgainOrContact",
        { 
          entity: "users",
          optionalMessage: `Error reading all users: ${response.statusText}` 
        }
      );
    return await response.json();
  }
  async login(data: { payload: VerifyLoginPayloadParams }, jwt?: string) {
    try {
      const response = await fetch(this.getEndpointModule("login"), {
        method: this.endpoints.login.method,
        headers: {
          "Content-type": "application/json",
          ...(jwt && { Authorization: `Bearer ${jwt}` }),
          "x-signed-payload": `${JSON.stringify(data.payload)}`,
        },
      });
      
      if (!response.ok)
        throw createDomainError(
          ErrorCodes.UNAUTHORIZED_ACTION,
          ApiUserRepository,
          "login",
          "credentials",
          { optionalMessage: `Error during login: ${response.statusText}` }
        );
      
      return await response.json();
    } catch (error) {
      // Si ya es DomainError, re-lanzar
      if (error && typeof error === 'object' && 'type' in error) throw error;
      
      // Error de red (ECONNREFUSED, timeout) → Convertir a DomainError
      throw createDomainError(
        ErrorCodes.DATABASE_FIND,
        ApiUserRepository,
        "login",
        {
          es: "No se pudo conectar con el servidor de autenticación.",
          en: "Could not connect to authentication server.",
          ca: "No s'ha pogut connectar amb el servidor d'autenticació.",
          de: "Verbindung zum Authentifizierungsserver fehlgeschlagen."
        },
        {
          entity: "user login",
          desc: {
            es: "Error de conexión",
            en: "Connection error",
            ca: "Error de connexió",
            de: "Verbindungsfehler"
          }
        }
      );
    }
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
        ApiUserRepository,
        "readById",
        "tryAgainOrContact",
        { 
          entity: "user",
          optionalMessage: `Error reading user by ID: ${response.statusText}` 
        }
      );
    return await response.json();
  }

  async update(data: {
    payload: VerifyLoginPayloadParams;
    formData: UserUpdateData;
  }, jwt?: string) {
    const response = await fetch(this.getEndpointModule("update"), {
      method: this.endpoints.update.method,
      headers: {
        "Content-type": "application/json",
        ...(jwt && { Authorization: `Bearer ${jwt}` }),
        "x-signed-payload": `${JSON.stringify(data.payload)}`,
      },
      body: JSON.stringify(data.formData),
    });
    if (!response.ok)
      throw createDomainError(
        ErrorCodes.DATABASE_ACTION,
        ApiUserRepository,
        "update",
        "tryAgainOrContact",
        { 
          entity: "user",
          optionalMessage: `Error updating user: ${response.statusText}` 
        }
      );
    return await response.json();
  }

  async deleteById(data: {
    payload: VerifyLoginPayloadParams;
    id: string;
    address: string;
  }, jwt?: string) {
    const response = await fetch(
      this.getEndpointModule("delete"),
      {
        method: this.endpoints.delete.method,
        headers: {
          "Content-type": "application/json",
          ...(jwt && { Authorization: `Bearer ${jwt}` }),
          "x-signed-payload": `${JSON.stringify(data.payload)}`,
        },
        body: JSON.stringify({ id: data.id, address: data.address }),
      }
    );
    if (!response.ok)
      throw createDomainError(
        ErrorCodes.DATABASE_ACTION,
        ApiUserRepository,
        "deleteById",
        "tryAgainOrContact",
        { 
          entity: "user",
          optionalMessage: `Error deleting user: ${response.statusText}` 
        }
      );
    return await response.json();
  }

  async updateSolicitud(data: { id: string; solicitud: RoleType }, jwt?: string) {
    const response = await fetch(this.getEndpointModule("updateSolicitud"), {
      method: this.endpoints.updateSolicitud.method,
      headers: {
        "Content-type": "application/json",
        ...(jwt && { Authorization: `Bearer ${jwt}` }),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok)
      throw createDomainError(
        ErrorCodes.DATABASE_ACTION,
        ApiUserRepository,
        "updateSolicitud",
        "tryAgainOrContact",
        { 
          entity: "user solicitud",
          optionalMessage: `Error updating user solicitud: ${response.statusText}` 
        }
      );
    return await response.json();
  }

  async resendVerificationEmail(data: { id: string; email: string }, jwt?: string) {
    const response = await fetch(this.getEndpointModule("resendVerificationEmail"), {
      method: this.endpoints.resendVerificationEmail.method,
      headers: {
        "Content-type": "application/json",
        ...(jwt && { Authorization: `Bearer ${jwt}` }),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok)
      throw createDomainError(
        ErrorCodes.SHARED_ACTION,
        ApiUserRepository,
        "resendVerificationEmail",
        "tryAgainOrContact",
        { 
          entity: "verification email",
          optionalMessage: `Error resending verification email: ${response.statusText}` 
        }
      );
    return await response.json();
  }
}
