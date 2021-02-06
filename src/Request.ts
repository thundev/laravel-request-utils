/* eslint-disable max-len */
import axios, {
    AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';

interface RequestConfig {
    autoRequestCsrfCookie?: boolean,
    csrfCookieUrl?: string,
    errorCallbacks?: { [key: number]: { (error: AxiosError): void } },
}

export default class Request {
    service: AxiosInstance;

    config: RequestConfig;

    constructor(config: RequestConfig = {}) {
        this.config = {
            autoRequestCsrfCookie: true,
            csrfCookieUrl: '/sanctum/csrf-cookie',
            ...config,
        };
        this.service = axios;

        this.service.defaults.withCredentials = true;
        this.service.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

        this.service.interceptors.response.use(
            (response) => response,
            (error) => {
                // 419 error means that the CSRF token has timed out
                // in that case if the config autoRequestCsrfCookie is set to 'true',
                // we try to receive new token and retry the request.
                if (error.response.status === 419) {
                    if (this.config.autoRequestCsrfCookie && typeof config.csrfCookieUrl === 'string') {
                        return this.get(config.csrfCookieUrl)
                            .then(() => this.service.request(error.config));
                    }
                }

                if (typeof config.errorCallbacks !== 'undefined') {
                    Object.keys(config.errorCallbacks).forEach((key) => {
                        const errorCode = Number.parseInt(key, 10);
                        if (error.response.status === errorCode) {
                            // @ts-ignore
                            config.errorCallbacks[errorCode](error);
                        }
                    });
                }

                return Promise.reject(error);
            },
        );
    }

    get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.service.get(url, config);
    }

    post<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.service.post(url, data, config);
    }

    patch<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.service.patch(url, data, config);
    }

    put<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.service.put(url, data, config);
    }

    delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.service.delete(url, config);
    }
}
