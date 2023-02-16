import Axios, {
    AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';
import { RequestConfig } from './types/RequestConfig';

export default class Request {
    private readonly service: AxiosInstance;

    private readonly config: RequestConfig;

    private static instance: Request;

    private interceptorAttempts: number = 0;

    private static instanceConfig: RequestConfig = {
        errorCallbacks: [],
        successCallbacks: [],
        headers: {},
        withCredentials: true,
    };

    public static getInstance(): Request {
        if (!Request.instance) {
            Request.instance = new Request(Request.instanceConfig);
        }

        return Request.instance;
    }

    public static setConfig(config: RequestConfig): void {
        Object.keys(config).forEach((key: string) => {
            // @ts-ignore
            Request.instanceConfig[key] = config[key];
        });
    }

    public static setHeader(name: string, value: string): void {
        const config = Request.getInstance().getConfig();

        if (config.headers) {
            config.headers[name] = value;
        }

        Request.instance = new Request(config);
    }

    private constructor(config: RequestConfig = {}) {
        this.service = Axios.create();
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

                this.interceptorAttempts = 0;

                return response;
            },
            (error: AxiosError) => {
                if (!error.response) {
                    return Promise.reject(error);
                }

                const responseStatusCode = error.response.status;

                if (this.config.interceptor) {
                    const interceptorResult = this.config.interceptor(
                        error.response as AxiosResponse,
                        this.service,
                        this.interceptorAttempts,
                    );

                    this.interceptorAttempts += 1;

                    if (interceptorResult !== false) {
                        return interceptorResult;
                    }
                }

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
