import Errors from '../src/Errors';

test('this can add and clear errors', () => {
    const errors = new Errors();
    const error = {
        domain: ['The domain format is invalid.'],
        thanks_page: ['The thanks page format is invalid.'],
        webhook: ['The webhook format is invalid.'],
    };
    errors.record(error);
    const newError = {
        domain: ['The domain format is invalid.'],
        webhook: ['The webhook format is invalid.'],
    };
    errors.record(newError);
    expect(errors.get('domain')).toBe('The domain format is invalid.');
    expect(errors.get('webhook')).toBe('The webhook format is invalid.');
});
