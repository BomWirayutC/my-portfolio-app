export const setItem = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export const getItem = (key: string) => {
    if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
    return null;
};

export const removeItem = (key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
};

export const clear = () => {
    if (typeof window !== 'undefined') {
        localStorage.clear();
    }
};