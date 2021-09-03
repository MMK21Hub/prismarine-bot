export function createCache(data, options) {
    const cache = new Map();
    let index = 0;
    for (const item of data) {
        if (!item[options.key] || !item[options.value]) {
            throw new Error(`Found an object (index ${index}) that does not have a property that can be used as a key/value`);
        }
        cache.set(item[options.key], item[options.value]);
        index++;
    }
    return cache;
}
export function validNamespacedId(value) {
    const validChars = /[a-z0-9_:]/g;
    if (value.replace(validChars, "") === "") {
        return true;
    }
    return false;
}
export class Registry extends Map {
    constructor(postRegister) {
        super();
        this.postRegister = postRegister;
        this.register = (items, key = "id") => {
            if (!Array.isArray(items))
                items = [items];
            for (const item of items) {
                if (typeof item !== "object") {
                    throw new Error("Each item passed to register() must be an object.");
                }
                if (!item.hasOwnProperty(key)) {
                    throw new Error("Found item passed to register() that does not contain specified key: " +
                        key);
                }
                this.set(item[key], item);
            }
            this.postRegister?.(this, items);
        };
    }
}
//# sourceMappingURL=util.js.map