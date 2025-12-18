// Cookie provider abstraction - implementation in presentation layer
export interface CookieProvider {
    get(name: string): Promise<string | undefined>;
    set(name: string, value: string): Promise<void>;
    delete(name: string): Promise<void>;
}
