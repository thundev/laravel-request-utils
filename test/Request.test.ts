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
