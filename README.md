# Laravel Request Utils Package

### Installation
```sh
npm i laravel-request-utils
```

### Usage
1. Configure the request if needed.
```js
// index.js
import { Request } from 'laravel-request-utils';

Request.setConfig({
    // Your config goes here.
});
```
2. Create a new Form instance for Vue component.
```vue
<template>
    <form @submit.prevent="onSubmit">
        <input v-model="form.name" />
        <button type="submit">Submit</button>
    </form>
</template>

<script>
    import { Form } from 'laravel-request-utils';
    
    export default {
        name: 'MyFormComponent',
        data() {
            return {
                form: new Form({
                    name: '',
                }),
            }
        },
        methods: {
            onSubmit() {
                const url = '/your/api/endpoint';
                this.form.submit(url)
                  .then((data) => {
                    // Logic on successful submit.
                  });
            }
        }
    }
</script>
```
