import Request from '../src/Request';

test('this is a singleton', () => {
    const request1 = Request.getInstance();
    const request2 = Request.getInstance();
    expect(request1).toBe<Request>(request2);
});
