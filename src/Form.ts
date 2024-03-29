import { AxiosError, AxiosResponse } from 'axios';
import Flattener from 'object-flattener/dist/flattener';
import Errors from './Errors';
import Request from './Request';

export enum FormMethods {
    POST = 'post',
    PATCH = 'patch',
    PUT = 'put',
}

export interface FormConfig {
    resetAfterSend?: boolean,
    removeNullValues?: boolean,
    method?: FormMethods,
    request?: Request,
    url?: string | null,
}

export interface FormProperties {
    [key: string]: any
}

export default class Form {
    [key: string]: any;

    private readonly originalData: FormProperties;

    private readonly config: FormConfig;

    public errors: Errors;

    private request: Request;

    private touchedFields: { [key: string]: any } = {};

    /**
     * Create a new Form instance.
     */
    constructor(data: FormProperties, config: FormConfig = {}) {
        this.config = {
            resetAfterSend: true,
            removeNullValues: true,
            url: null,
            method: FormMethods.POST,
            ...config,
        };

        Object.keys(data).forEach((key) => {
            this[key] = data[key];
        });

        this.originalData = JSON.parse(JSON.stringify(data));
        this.errors = new Errors();
        this.request = this.config.request ?? Request.getInstance();

        if (this.config.method !== FormMethods.POST) {
            this.addField('_method', this.config.method);
        }
    }

    /**
     * Add a new field with value to the form.
     */
    public addField(field: string, value: any): void {
        this.originalData[field] = value;
        this[field] = value;
    }

    public removeField(field: string): void {
        if (typeof this.originalData[field] !== 'undefined') {
            delete this.originalData[field];
        }

        if (typeof this[field] !== 'undefined') {
            delete this[field];
        }
    }

    public setUrl(url: string): Form {
        this.config.url = url;
        return this;
    }

    public addTouchedField(field: string) {
        this.touchedFields[field] = field;
    }

    public getTouchedFields(): Array<string> {
        return Object.values(this.touchedFields);
    }

    /**
     * Serialize the Form.
     */
    public serialize(asString: boolean = true): string | object {
        const json: { [key: string]: any } = {};

        Object.keys(this.originalData).forEach((field: string) => {
            json[field] = this[field];
        });

        return asString ? JSON.stringify(json) : json;
    }

    /**
     * Submit the form.
     */
    public submit(url: string | null): Promise<any> {
        this.errors.clear();
        const data = this.getFormData();
        return this.send(this.getUrl(url), data);
    }

    public validate(url: string | null): Promise<any> {
        const data = this.getFormData();
        data.append('validate', '1');
        this.getTouchedFields().forEach((field: string) => {
            data.append('fields[]', field);
        });

        return this.send(this.getUrl(url), data, true);
    }

    /**
     * Get FormData object.
     */
    public getFormData(): FormData {
        const formData = new FormData();

        const data: { [key: string]: any } = {};
        Object.keys(this.originalData).forEach((field) => {
            data[field] = this[field];
        });

        const flattened = Flattener.flattenToArray(data);

        Object.keys(flattened).forEach((key: string) => {
            const value = flattened[key];

            if (value === null) {
                if (this.config.removeNullValues) {
                    return;
                }

                formData.append(key, '');
                return;
            }

            if (
                typeof value === 'string'
                && value.length === 0
                && this.config.removeNullValues
            ) {
                return;
            }

            if (typeof value === 'boolean') {
                formData.append(key, Number(value).toString());
                return;
            }

            formData.append(key, value);
        });

        return formData;
    }

    /**
     * Reset the state of the form to the original state.
     */
    public reset(): void {
        Object.keys(this.originalData).forEach((field) => {
            this[field] = this.originalData[field];
        });
    }

    private getUrl(url: string | null): string {
        if (url) {
            return url;
        }
        if (this.config.url) {
            return this.config.url;
        }

        throw new Error('Please specify url.');
    }

    private send(url: string, data: FormData, shouldValidate: boolean = false): Promise<any> {
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };

        return new Promise((resolve, reject) => {
            this.request.post(url, data, config)
                .then((response: AxiosResponse) => {
                    if (this.config.resetAfterSend && !shouldValidate) {
                        this.reset();
                    }
                    this.errors.clear();
                    return resolve(response.data);
                })
                .catch((error: AxiosError) => {
                    if (typeof error.response === 'undefined') {
                        return reject(error);
                    }

                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    const data = error.response?.data;

                    // @ts-ignore
                    if (typeof data.errors !== 'undefined') {
                        // @ts-ignore
                        this.errors.record(data.errors);
                    }

                    return reject(data);
                });
        });
    }
}
