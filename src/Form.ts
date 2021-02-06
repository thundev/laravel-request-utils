import isObject from 'lodash.isobject/index';
// import { AxiosError, AxiosResponse } from 'axios';
import Errors from './Errors';
// import Request from './Request';

export enum FormMethods {
    POST = 'post',
    PATCH = 'patch',
    PUT = 'put',
}

interface FormConfig {
    resetAfterSend?: boolean,
    removeNullValues?: boolean,
    method?: FormMethods
}

interface Data {
    [key: string]: any
}

export default class Form {
    data: Data;

    originalData: Data;

    config: FormConfig;

    errors: Errors;

    // request: Request;

    /**
     * Create a new Form instance.
     */
    constructor(data: Data, config: FormConfig = {}) {
        this.config = {
            resetAfterSend: true,
            removeNullValues: true,
            method: FormMethods.POST,
            ...config,
        };
        this.data = data;
        this.originalData = { ...data };
        this.errors = new Errors();

        if (this.config.method !== FormMethods.POST) {
            this.addField('_method', this.config.method);
        }

        // @ts-ignore
        // this.request = Request;

        Object.preventExtensions(this);

        return new Proxy(this, {
            set(target, name, value): boolean {
                const propertyKey = String(name);

                if (Object.keys(target.data).includes(propertyKey)) {
                    // eslint-disable-next-line no-param-reassign
                    target.data[propertyKey] = value;
                    return true;
                }

                throw new Error(`Form data does not have '${propertyKey}' field. Add the field first.`);
            },
        });
    }

    /**
     * Add a new field with value to the form.
     */
    addField(field: string, value: any): void {
        this.originalData[field] = value;
        this.data[field] = value;
    }

    /**
     * Get FormData object.
     */
    getFormData(): FormData {
        const formData = new FormData();

        Object.keys(this.data).forEach((field) => {
            const value = this.data[field];

            if (value === null && this.config.removeNullValues) {
                return;
            }

            if (typeof value === 'boolean') {
                formData.append(field, Number(value).toString());
            } else if (Array.isArray(value)) {
                value.forEach((item) => {
                    formData.append(`${field}[]`, item);
                });
            } else if (isObject(value) && !(value instanceof File)) {
                Object.keys(value).forEach((key) => {
                    // @ts-ignore
                    formData.append(`${field}[${key}]`, value[key]);
                });
            } else {
                formData.append(field, value);
            }
        });

        return formData;
    }

    reset() {
        Object.keys(this.originalData).forEach((field) => {
            this.data[field] = this.originalData[field];
        });

        this.errors.clear();
    }

    serialize() {
        const json: { [key: string]: any } = {};

        Object.keys(this.originalData).forEach((field) => {
            json[field] = this.data[field];
        });

        return json;
    }

    // submit(url: string, clear: boolean = true) {
    //     this.errors.clear();
    //     const data = this.getFormData();
    //
    //     return new Promise((resolve, reject) => {
    //         // @ts-ignore
    //         this.request.post(url, data, { 'Content-Type': 'multipart/form-data' })
    //             .then((response: AxiosResponse) => {
    //                 if (clear) {
    //                     this.reset();
    //                 }
    //                 return resolve(response.data);
    //             })
    //             .catch((error: AxiosError) => {
    //                 if (typeof error.response?.data.errors !== 'undefined') {
    //                     this.errors.record(error.response.data.errors);
    //                 }
    //                 return reject(error.response?.data);
    //             });
    //     });
    // }
}
