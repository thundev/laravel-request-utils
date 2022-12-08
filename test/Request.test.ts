import Request from '../src/Request';

test('this is a singleton', () => {
    const request1 = Request.getInstance();
    const request2 = Request.getInstance();
    expect(request1).toBe<Request>(request2);
});

test('this can update global config', () => {
    Request.setConfig({ autoRequestCsrfCookie: false });
    const request = Request.getInstance();
    expect(request.getConfig().autoRequestCsrfCookie).toBe(false);

    Request.setConfig({ autoRequestCsrfCookie: true });
    expect(request.getConfig().autoRequestCsrfCookie).toBe(true);
});

test('this can set headers', () => {
    Request.setHeader('x-header', 'test');
    expect(Request.getInstance().getConfig().headers).toEqual({ 'x-header': 'test' });

    Request.setHeader('y-header', 'test-2');
    expect(Request.getInstance().getConfig().headers).toEqual({
        'x-header': 'test',
        'y-header': 'test-2',
    });

    Request.setHeader('y-header', 'test-3');

    expect(Request.getInstance().getConfig().headers).toEqual({
        'x-header': 'test',
        'y-header': 'test-3',
    });
});

test('this can call error callbacks', () => {
    let testPassed = false;

    Request.setConfig({
        errorCallbacks: [
            {
                errorCode: null,
                callback: () => {
                    testPassed = true;
                },
            },
        ],
    });

    Request.mock([{
        matcher: '/users',
        requestBody: { test: 'test' },
        statusCode: 404,
        responseBody: { error: 'error' },
    }])
        .get('/users')
        .catch(() => {})
        .finally(() => {
            expect(testPassed).toBeTruthy();
        });
});

test('this can retry request', () => {
    let testPassed = false;

    Request.setConfig({
        interceptors: [
            (response, instance, axios, attempt) => {
                if (response.status !== 401 || attempt > 0) {
                    return;
                }

                const { config } = response;
                config.url = '/success';

                axios
                    .request(config)
                    .then((res) => {
                        testPassed = res.data.success;
                    });
            },
        ],
    });

    Request.mock([
        {
            matcher: '/success',
            requestBody: { test: 'test' },
            statusCode: 200,
            responseBody: { success: true },
        },
        {
            matcher: '/error',
            requestBody: { test: 'test' },
            statusCode: 401,
            responseBody: { success: false },
        },
    ])
        .get('/error')
        .catch(() => {})
        .finally(() => {
            expect(testPassed).toEqual(true);
        });
});
