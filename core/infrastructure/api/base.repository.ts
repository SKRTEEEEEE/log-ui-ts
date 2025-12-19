export enum Modules {
    PRE_TECH = "PRE_TECH",
    PROJECTS = "PROJECTS",
    ROLE = "ROLE",
    TECH = "TECH",
    USER = "USER"
}

type EndpointConfig = {
    endpoint:  ((opt: string|string[])=>string )| string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
};

type ModuleConfig = {
    [key: string]: EndpointConfig;
};

type ModulesMap = {
    [key in Modules]: ModuleConfig;
};

export abstract class ApiBaseRepository {
    private readonly _baseUrl: string;
    private readonly _module: Modules;
    private readonly modules: ModulesMap = {
        [Modules.PRE_TECH]: {
            readByQuery: { endpoint: "pre-tech", method: "GET" },
            updatePreTech: { endpoint: "pre-tech", method: "POST" }
        },
        [Modules.PROJECTS]: {
            list: { endpoint: "project", method: "GET" },
            readById: { endpoint: "project/:id", method: "GET" }
        },
        [Modules.ROLE]: {
            create: {endpoint: "role", method: "POST"},
            readById: {endpoint: "role/:id", method: "GET"},
            readAll: {endpoint: "role", method: "GET"},
            update: {endpoint: "role/:id", method: "PUT"},
            delete: {endpoint: "role/:id", method: "DELETE"},
            deleteMany: {endpoint: "role/many", method: "DELETE"},
        },
        [Modules.TECH]: {
            create: {endpoint: "tech", method: "POST"},
            update: {endpoint: "tech", method: "PUT"},
            actualizarGithub: {endpoint: (opt)=>`tech/${opt}`, method: "POST"},
            readAll: {endpoint: (opt)=>`tech/${opt}`, method: "GET"},
            delete: {endpoint: "tech", method: "DELETE"},

        },
        [Modules.USER]: {
            readById: {endpoint: "user/:id", method: "GET"},
            readAll: {endpoint: "user", method: "GET"},
            login: {endpoint: "user", method: "POST"},
            update: {endpoint: "user", method: "PUT"},
            updateSolicitud: {endpoint: "user/request", method: "PATCH"},
            delete: {endpoint: "user", method: "DELETE"},
            giveRole: {endpoint: "user/give", method: "PATCH"},
            verifyEmail: {endpoint: "user/verify-email", method: "PATCH"},
            resendVerificationEmail: {endpoint: "user", method: "PUT"},
        }
    };

    constructor(module: Modules, baseUrl?: string) {
        this._module = module;
        this._baseUrl = baseUrl ?? 'http://localhost:3001';
    }
    public get baseUrl(){
        return this._baseUrl;
    }
    // Getter para exponer dinámicamente los endpoints del módulo actual
    public get endpoints() {
        const config = this.getModuleConfig();
        // Devuelve un proxy para acceder dinámicamente a cada endpoint
        return new Proxy(config, {
            get: (target, prop: string) => {
                if (prop in target) {
                    return {
                        endpoint: target[prop].endpoint,
                        method: target[prop].method
                    };
                }
                throw new Error(`Endpoint '${prop}' not found in module '${this.module}'`);
            }
        });
    }
    public get module() {return this._module}

    protected getEndpointConfig(key: keyof ModuleConfig): EndpointConfig | undefined {
        return this.getModuleConfig()[key as string];
    }
    protected getEndpointModule(endpointKey: string){
        return `${this._baseUrl}/${this.getModuleConfig()[endpointKey]?.endpoint}`;
    }
    protected getDynamicEndpointModule(endpointKey: string, opt: string | string[]) {
        const endpointConfig = this.getModuleConfig()[endpointKey];
        if (!endpointConfig) return null;

        const endpoint = endpointConfig.endpoint;
        if (typeof endpoint === "function") {
            if (typeof opt === "string") {
                return `${this._baseUrl}/${endpoint(opt)}`;
            }
            if (Array.isArray(opt)) {
                return opt.map(o => `${this._baseUrl}/${endpoint(o)}`);
            }
        } else {
            // Para endpoints estáticos
            if (typeof opt === "string") {
                return `${this._baseUrl}/${endpoint}/${opt}`;
            }
            if (Array.isArray(opt)) {
                return opt.map(o => `${this._baseUrl}/${endpoint}/${o}`);
            }
        }
        return null;
    }
    // Métodos privados para uso interno
    private getModuleConfig(): ModuleConfig {
        return this.modules[this._module];
    }
}

// Removed ApiResponseError - now using createDomainError from profile-domain
