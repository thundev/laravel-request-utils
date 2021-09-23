import Errors from '../src/Errors';

test('this record errors', () => {
    const errorMessages: { [key: string]: string[] } = {
        domain: ['The domain format is invalid.'],
        thanks_page: ['The thanks page format is invalid.'],
        webhook: ['The webhook format is invalid.'],
    };

    const errors = new Errors();

    errors.record(errorMessages);
    Object.keys(errorMessages).forEach((key) => {
        expect(errors.has(key)).toBeTruthy();
        expect(errors.get(key)).toBe(errorMessages[key][0]);
    });

    delete errorMessages.thanks_page;

    errors.record(errorMessages);
    Object.keys(errorMessages).forEach((key) => {
        expect(errors.has(key)).toBeTruthy();
        expect(errors.get(key)).toBe(errorMessages[key][0]);
    });
});
