import axios, {
    AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';

export interface ErrorCallback {
    errorCode: number | number[] | null,
    callback: { (error: AxiosError): void }
}

export type Interceptor = (
    response: AxiosResponse,
    instance: Request,
    service: AxiosInstance,
    attempt: number,
) => void;

export interface SuccessCallback {
    (response: AxiosResponse): void
}

export interface MockConfig {
    matcher: string,
    requestBody: { [key: string]: any },
    statusCode: number,
    responseBody: { [key: string]: any },
}

export interface RequestConfig {
    autoRequestCsrfCookie?: boolean,
    csrfCookieUrl?: string,
    errorCallbacks?: ErrorCallback[],
    successCallbacks?: SuccessCallback[],
    interceptors?: Interceptor[],
    headers?: { [key: string]: string },
    withCredentials?: boolean
}

export default class Request {
    private readonly service: AxiosInstance;

    private readonly config: RequestConfig;

    private static instance: Request;

    private interceptorAttempts: { [key: number]: number };

    private static instanceConfig: RequestConfig = {
        autoRequestCsrfCookie: true,
        csrfCookieUrl: '/sanctum/csrf-cookie',
        errorCallbacks: [],
        successCallbacks: [],
        interceptors: [],
        headers: {},
        withCredentials: true,
    };

    public static mock(configs: MockConfig[]): Request {
        const { service } = Request.getInstance();
        // eslint-disable-next-line global-require
        const MockAdapter = require('axios-mock-adapter');
        const mock = new MockAdapter(service);

        configs.forEach((config) => {
            mock.onAny(config.matcher, config.requestBody)
                .reply(config.statusCode, config.responseBody);
        });

        return Request.getInstance();
    }

    public static getInstance(): Request {
        if (!Request.instance) {
            Request.instance = new Request(Request.instanceConfig);
        }

        return Request.instance;
    }

    public static setConfig(config: RequestConfig): void {
        Object.keys(config).forEach((key: string) => {
            if (
                Object.prototype.hasOwnProperty.call(Request.instanceConfig, key)
                && Object.prototype.hasOwnProperty.call(config, key)
            ) {
                // @ts-ignore
                Request.instanceConfig[key] = config[key];
            }
        });
    }

    public static setHeader(name: string, value: string): void {
        const { headers } = Request.instanceConfig;

        if (headers) {
            headers[name] = value;
        }

        Request.instance = new Request(Request.instanceConfig);
    }

    private constructor(config: RequestConfig = {}) {
        this.interceptorAttempts = [];
        this.service = axios.create();
        this.config = config;

        this.service.defaults.withCredentials = this.config.withCredentials;
        this.service.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        if (this.config.headers) {
            const { headers } = this.config;
            Object.keys(headers).forEach((key: string) => {
                this.service.defaults.headers.common[key] = headers[key];
            });
        }

        this.service.interceptors.response.use(
            (response: AxiosResponse) => {
                this.config.successCallbacks
                    ?.forEach((callback) => {
                        callback(response);
                    });

                this.interceptorAttempts = [];

                return response;
            },
            (error: AxiosError) => {
                // 419 error means that the CSRF token has timed out
                // in that case if the config autoRequestCsrfCookie is set to 'true',
                // we try to receive new token and retry the request.
                if (!error.response) {
                    return Promise.reject(error);
                }

                const responseStatusCode = error.response.status;

                if (
                    responseStatusCode === 419
                        && this.config.autoRequestCsrfCookie
                        && typeof this.config.csrfCookieUrl !== 'undefined'
                ) {
                    this.get(this.config.csrfCookieUrl)
                        .then(() => {
                            this.service.request(error.config);
                        });
                }

                this.config.interceptors?.forEach((interceptor: Interceptor, index: number) => {
                    this.interceptorAttempts[index] = typeof this.interceptorAttempts[index] !== 'undefined'
                        ? this.interceptorAttempts[index] + 1
                        : 0;

                    interceptor(
                        error.response as AxiosResponse,
                        Request.getInstance(),
                        this.service,
                        this.interceptorAttempts[index],
                    );
                });

                this.config.errorCallbacks
                    ?.find((callback) => {
                        if (callback.errorCode === null) {
                            return true;
                        }
                        let callbackErrorCode = callback.errorCode;
                        if (!Array.isArray(callbackErrorCode)) {
                            callbackErrorCode = [callbackErrorCode];
                        }

                        return callbackErrorCode.includes(responseStatusCode);
                    })
                    ?.callback(error);

                return Promise.reject(error);
            },
        );
    }

    public getConfig(): RequestConfig {
        return this.config;
    }

    // eslint-disable-next-line max-len
    public get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.service.get(url, config);
    }

    // eslint-disable-next-line max-len
    public post<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.service.post(url, data, config);
    }

    // eslint-disable-next-line max-len
    public patch<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.service.patch(url, data, config);
    }

    // eslint-disable-next-line max-len
    public put<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.service.put(url, data, config);
    }

    // eslint-disable-next-line max-len
    public delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.service.delete(url, config);
    }
}
