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
    expect(errors.has('thanks_page')).toBeFalsy();
    Object.keys(errorMessages).forEach((key) => {
        expect(errors.has(key)).toBeTruthy();
        expect(errors.get(key)).toBe(errorMessages[key][0]);
    });
});
test('this have any error', () => {
    const errors = new Errors();

    errors.record({
        domain: ['The domain format is invalid.'],
        thanks_page: ['The thanks page format is invalid.'],
        webhook: ['The webhook format is invalid.'],
    });

    expect(errors.any()).toBeTruthy();
});

test('this get all errors', () => {
    const errorMessages: { [key: string]: string[] } = {
        domain: ['The domain format is invalid.'],
        thanks_page: ['The thanks page format is invalid.'],
        webhook: ['The webhook format is invalid.'],
    };
    const errors = new Errors();

    errors.record(errorMessages);
    expect(errors.getAll()).toEqual(Object.values(errorMessages).map((value) => value[0]));
});

test('this clear one or all error fields', () => {
    const errorMessages: { [key: string]: string[] } = {
        domain: ['The domain format is invalid.'],
        thanks_page: ['The thanks page format is invalid.'],
        webhook: ['The webhook format is invalid.'],
    };
    const errors = new Errors();

    errors.record(errorMessages);
    expect(errors.getAll()).toEqual(Object.values(errorMessages).map((value) => value[0]));

    errors.clear('domain');
    expect(errors.has('thanks_page')).toBeTruthy();
    expect(errors.has('webhook')).toBeTruthy();

    errors.clear();
    expect(errors.any()).toBe(false);
});
