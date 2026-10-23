export interface ICacheProvider {
    set(key: string, value: any, ttlSeconds?: number): Promise<any>;
    get(key: string): Promise<any>;
    del(key: string): Promise<any>;
}