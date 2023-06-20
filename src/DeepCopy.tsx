function deepCopy<T>(obj: T): T {
    let copy: T;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" !== typeof obj) return obj;

    // Handle DOM node
    // DON'T copy because there's no use in having orphaned DOM nodes floating around
    if (obj instanceof Node) {
        return obj;
        return copy;
    }

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date() as unknown as T;
        (copy as unknown as Date).setTime((obj as unknown as Date).getTime());
        return copy;
    }

    // Handle Array
    if (Array.isArray(obj)) {
        copy = [] as unknown as T;
        for (let i = 0, len = (obj as unknown as Array<any>).length; i < len; i++) {
            (copy as unknown as Array<any>)[i] = deepCopy((obj as unknown as Array<any>)[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {} as T;
        for (const attr in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, attr)) {
                (copy as unknown as Record<string, any>)[attr] = deepCopy((obj as unknown as Record<string, any>)[attr]);
            }
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

export default deepCopy;