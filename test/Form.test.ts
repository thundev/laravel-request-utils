/* eslint-disable @typescript-eslint/indent */
import Form, { FormMethods } from '../src/Form';

describe.each([
    ['object', { x: { field: 'x' } }],
    ['string', { x: 'x' }],
    ['number', { x: 1 }],
    ['array', { x: [1, 2, 3] }],
    ['file', { x: new File([''], 'filename') }],
])('this adds data of type', (type, data) => {
    test(type, () => {
        const form = new Form(data);
        expect(form)
            .toEqual(expect.objectContaining(data));
    });
});

test('this can add fields', () => {
    const form = new Form({ x: 'test' });
    form.addField('test', 'test');
    expect(form.test).toBe('test');
});

test('this can remove fields', () => {
    const form = new Form({ x: 'test', y: 'test2' });
    form.removeField('x');
    expect(form.x).toBeUndefined();
    expect(form.y).toBe('test2');
});

describe.each([
    [true, false, 'removes'],
    [false, true, 'keeps'],
])('this can handle \'removeNullValues\' config setting', (removeNullValues, expected, name) => {
    test(`this ${name} null values when removeNullValues is set to '${expected}'`, () => {
        const form = new Form({ x: null, y: 'test' }, { removeNullValues });
        const formData = form.getFormData();
        expect(formData.has('x')).toBe(expected);
        if (expected) {
            expect(formData.get('x')).toEqual('');
        }
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

test('this can reset form data', () => {
    const form = new Form({ x: 'x', y: 'y' });
    form.x = 'test1';
    form.y = 'test2';
    expect(form.x).toBe('test1');
    expect(form.y).toBe('test2');
    form.reset();
    expect(form.x).toBe('x');
    expect(form.y).toBe('y');
});

describe.each([
    ['is object', { field: 'x' }, { field: 'test' }],
    ['is string', 'x', 'test'],
    ['is number', 1, 2],
    ['is array', [1, 2, 3], [4, 5, 6]],
])('this can reset form data', (type, initialValue, newValue) => {
    test(`when property ${type}`, () => {
        let x;

        if (['string', 'number'].includes(typeof initialValue)) {
            x = initialValue;
        } else if (Array.isArray(initialValue)) {
            x = [...initialValue];
        } else if (typeof initialValue === 'object') {
            x = { ...initialValue };
        }

        const form = new Form({ x });

        if (type === 'is object') {
            // @ts-ignore
            form.x.field = newValue.field;
        } else {
            form.x = newValue;
        }

        form.reset();
        expect(form.x).toEqual(initialValue);
    });
});
