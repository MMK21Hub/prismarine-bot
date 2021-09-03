export declare function createCache(data: any[], options: {
    key: string;
    value: string;
}): Map<any, any>;
export declare function validNamespacedId(value: string): boolean;
declare type postRegisterCallback<T extends anyObject> = (registry: Registry<T>, items: T[]) => void;
export declare type anyObject = {
    [key: string]: any;
};
export declare class Registry<T extends anyObject> extends Map<string, T> {
    register: (items: T[] | T, key?: string) => void;
    private postRegister?;
    constructor(postRegister?: postRegisterCallback<T>);
}
export {};
