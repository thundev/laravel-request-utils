import Form, { FormMethods } from '../src/Form';

test('this adds data properties', () => {
    const data = { x: 'test', y: 'test 2' };
    const form = new Form(data);
    expect(form).toEqual(expect.objectContaining(data));
});

test('this can add fields', () => {
    const form = new Form({ x: 'test' });
    form.addField('test', 'test');
    expect(form.test).toBe('test');
});

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
            expect(form._method).toBe(method);
        }
    });
});

test('this can serialize data to json', () => {
    const form = new Form({ x: 'test1', y: 'test2' });
    const json = form.serialize();
    expect(json).toEqual('{"x":"test1","y":"test2"}');
});

test('this can add touched fields', () => {
    const form = new Form({ x: 'test1', y: 'test2' });
    form.addTouchedField('name');
    form.addTouchedField('phone');
    expect(form.getTouchedFields().length).toBe(2);
    expect(form.getTouchedFields()[0]).toBe('name');
    expect(form.getTouchedFields()[1]).toBe('phone');
});
