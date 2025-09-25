const isBrowser = (): boolean => typeof window !== "undefined";

export const localStorageUtil = {
    /**
     * Save item to localStorage
     */
    setItem: (key: string, value: unknown): void => {
        if (!isBrowser()) return;
        try {
            const json = JSON.stringify(value);
            localStorage.setItem(key, json);
        } catch (error) {
            console.error("localStorage setItem error:", error);
        }
    },

    /**
     * Get item from localStorage
     */
    getItem: <T>(key: string): T | null => {
        if (!isBrowser()) return null;
        try {
            const item = localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : null;
        } catch (error) {
            console.error("localStorage getItem error:", error);
            return null;
        }
    },

    /**
     * Remove item from localStorage
     */
    removeItem: (key: string): void => {
        if (!isBrowser()) return;
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("localStorage removeItem error:", error);
        }
    },

    /**
     * Clear all localStorage
     */
    clear: (): void => {
        if (!isBrowser()) return;
        try {
            localStorage.clear();
        } catch (error) {
            console.error("localStorage clear error:", error);
        }
    },
};
