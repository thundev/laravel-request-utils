interface IErrors {
    [key: string]: string[]
}

export default class Errors {
    errors: IErrors;

    /**
     * Create a new Errors instance.
     */
    constructor() {
        this.errors = {};
    }

    /**
     * Determine if an errors exists for the given field.
     */
    has(field: string, strict: boolean = true): boolean {
        if (strict) {
            return typeof this.errors[field] !== 'undefined';
        }

        return Object.keys(this.errors).some((key) => !!key.match(field));
    }

    /**
     * Determine if we have any errors.
     */
    any(): boolean {
        return Object.keys(this.errors).length > 0;
    }

    /**
     * Retrieve the error message for a field.
     */
    get(field: string): string|null {
        return this.has(field) ? this.errors[field][0] : null;
    }

    /**
     * Retrieve all error messages.
     */
    getAll(): (string | null)[] {
        return this.any() ? Object.keys(this.errors).map((field) => this.get(field)) : [];
    }

    /**
     * Record the new errors.
     */
    record(errors: { [key: string]: string[] }): void {
        this.errors = { ...errors };
    }

    /**
     * Clear one or all error fields.
     */
    clear(field: string|null = null): void {
        if (field) {
            Object.keys(this.errors).forEach((key: string) => {
                if (key.match(field)) {
                    delete this.errors[key];
                }
            });

            return;
        }

        this.errors = {};
    }
}
