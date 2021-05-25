import axios, {
    AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';

export interface ErrorCallback {
    errorCode: number|number[],
    callback: { (error: AxiosError): void }
}

export interface SuccessCallback {
    (response: AxiosResponse): void
}

export interface RequestConfig {
    autoRequestCsrfCookie?: boolean,
    csrfCookieUrl?: string,
    errorCallbacks?: ErrorCallback[],
    successCallbacks?: SuccessCallback[],
}

export default class Request {
    private service: AxiosInstance;

    private readonly config: RequestConfig;

    private static instance: Request;

    private static instanceConfig: RequestConfig = {
        autoRequestCsrfCookie: true,
        csrfCookieUrl: '/sanctum/csrf-cookie',
        errorCallbacks: [],
        successCallbacks: [],
    };

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

    private constructor(config: RequestConfig = {}) {
        this.service = axios.create();
        this.config = config;

        this.service.defaults.withCredentials = true;
        this.service.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

        this.service.interceptors.response.use(
            (response: AxiosResponse) => {
                this.config.successCallbacks
                    ?.forEach((callback) => {
                        callback(response);
                    });

                return response;
            },
            (error: AxiosError) => {
                // 419 error means that the CSRF token has timed out
                // in that case if the config autoRequestCsrfCookie is set to 'true',
                // we try to receive new token and retry the request.
                if (error.response) {
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

                    this.config.errorCallbacks
                        ?.find((callback) => {
                            let callbackErrorCode = callback.errorCode;
                            if (!Array.isArray(callbackErrorCode)) {
                                callbackErrorCode = [callbackErrorCode];
                            }

                            return callbackErrorCode.includes(responseStatusCode);
                        })
                        ?.callback(error);
                }

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
