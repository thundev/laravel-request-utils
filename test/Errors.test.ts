import Errors from '../src/Errors';

let errors: Errors = new Errors();
let errorMessages: { [key: string]: string[] } = {};

beforeEach(() => {
    errorMessages = {
        domain: ['The domain format is invalid.'],
        thanks_page: ['The thanks page format is invalid.'],
        webhook: ['The webhook format is invalid.'],
    };

    errors = new Errors();
    errors.record(errorMessages);
});

test('this records errors', () => {
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

test('this can check for any errors recorded', () => {
    expect(errors.any()).toBeTruthy();

    errors.clear();
    expect(errors.any()).toBeFalsy();
});

test('this gets all errors as array of strings', () => {
    expect(errors.getAll()).toEqual(Object.values(errorMessages).map((value) => value[0]));
});

test('this clear one or all error fields', () => {
    expect(errors.getAll()).toEqual(Object.values(errorMessages).map((value) => value[0]));

    errors.clear('domain');
    expect(errors.has('domain')).toBeFalsy();
    expect(errors.has('thanks_page')).toBeTruthy();
    expect(errors.has('webhook')).toBeTruthy();

    errors.clear();
    expect(errors.any()).toBeFalsy();
});
