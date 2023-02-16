import Request from '../src/Request';

test('this is a singleton', () => {
    const request1 = Request.getInstance();
    const request2 = Request.getInstance();
    expect(request1).toBe<Request>(request2);
});

test('this can update global config', () => {
    Request.setConfig({ withCredentials: false });
    expect(Request.getInstance().getConfig().withCredentials).toBe(false);

    Request.setConfig({ withCredentials: true });
    expect(Request.getInstance().getConfig().withCredentials).toBe(true);
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
