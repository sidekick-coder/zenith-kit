export function safeJsonParse<T>(jsonString: string): T | null {
    try {
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return null;
    }
}

export function safeJsonStringify<T>(value: T): string | null {
    try {
        return JSON.stringify(value);
    } catch (error) {
        console.error('Failed to stringify JSON:', error);
        return null;
    }
}
