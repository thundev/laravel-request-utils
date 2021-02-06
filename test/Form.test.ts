import Form, { FormMethods } from '../src/Form';

describe.each([
    [true, false, 'removes'],
    [false, true, 'keeps'],
])('this can handle \'removeNullValues\' config setting', (removeNullValues, expected, name) => {
    test(`this ${name} null values when removeNullValues is set to '${expected}'`, () => {
        const form = new Form({ x: null, y: 'test' }, { removeNullValues });
        const formData = form.getFormData();
        expect(formData.has('x')).toBe(expected);
        expect(formData.has('y')).toBeTruthy();
    });
});

describe.each([
    [FormMethods.PATCH, true],
    [FormMethods.POST, false],
    [FormMethods.PUT, true],
])('this can handle \'method\' config setting', (method, hasField) => {
    test(`this ${hasField ? 'has' : 'doesn\'t have'} field '_method' with value '${method}'`, () => {
        const form = new Form({ x: null, y: 'test' }, { method });
        const formData = form.getFormData();
        expect(formData.has('_method')).toBe(hasField);
        if (hasField) {
            // eslint-disable-next-line no-underscore-dangle
            expect(form.data._method).toBe(method);
        }
    });
});

test('this can add fields', () => {
    const form = new Form({ x: 'test' });
    form.addField('test', 'test');
    expect(form.data.test).toBe('test');
    expect(form.originalData.test).toBe('test');
});
