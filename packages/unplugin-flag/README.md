<div align="center">
    <h1>unplugin-flag</h1>
    <p>
        A powerfull plugin for feature flag.
    </p>
    <p>
        <a href="https://www.npmjs.com/package/unplugin-flag">
            <img src="https://img.shields.io/npm/v/unplugin-flag.svg?style=flat-square&label=npm:unplugin-flag" alt="npm package" />
            <img src="https://img.shields.io/npm/dw/unplugin-flag.svg?style=flat-square&label=Downloads" alt="npm package downloads" />
        </a>
    </p>
    <h2><strong>Supports:</string></h2>
    <p>
        <a href="https://www.npmjs.com/package/next"><img src="https://img.shields.io/badge/%20Next.js-grey?style=for-the-badge&logo=nextdotjs" alt="Next.js"></a>
        <a href="https://www.npmjs.com/package/vite"><img src="https://img.shields.io/badge/%20Vite-grey?style=for-the-badge&logo=vite" alt="Vite"></a>
        <a href="https://www.npmjs.com/package/esbuild"><img src="https://img.shields.io/badge/%20Esbuild-grey?style=for-the-badge&logo=esbuild" alt="Esbuild"></a>
        <a href="https://www.npmjs.com/package/webpack"><img src="https://img.shields.io/badge/%20Webpack-grey?style=for-the-badge&logo=webpack" alt="Webpack"></a>
        <a href="https://www.npmjs.com/package/astro"><img src="https://img.shields.io/badge/%20Astro-grey?style=for-the-badge&logo=astro" alt="Astro"></a>
        <a href="https://www.npmjs.com/package/rollup"><img src="https://img.shields.io/badge/%20Rollup-grey?style=for-the-badge&logo=rollupdotjs" alt="Rollup"></a>
        <a href="https://www.npmjs.com/package/rolldown"><img src="https://img.shields.io/badge/%20Rolldown-grey?style=for-the-badge&logo=rolldown" alt="Rolldown"></a>
        <a href="https://www.npmjs.com/package/rspack"><img src="https://img.shields.io/badge/%20Rspack-grey?style=for-the-badge&logo=rspack" alt="Rspack"></a>
        <a href="https://www.npmjs.com/package/@farm/core"><img src="https://img.shields.io/badge/%20Farm-grey?style=for-the-badge&logo=farmfe" alt="Farm"></a>
    </p>
</div>

## Table of Contents

* [📚 Table of Contents](#-table-of-contents)
* [🔥 Features](#features)
* [📦 Installation](installation)
* [🚀 Basic Usage](#basic-usage)
    * [1. Configuration](#configuration)
    * [2. Flag your code](#accessing-environment-variables)
    * [3. Done](#)
* [💡 Acknowledgements](#acknowledgements)

## Features


## Installation

Install via your preferred package manager:

```bash
npm install unplugin-flag       # npm

yarn add unplugin-flag          # yarn

bun add unplugin-flag           # bun

pnpm add unplugin-flag          # pnpm
```
<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

## Basic Usage

### Configuration

<details>
<summary>Next.js</summary><br>

```ts
// next.config.mjs
import Environment from 'unplugin-flag/webpack'

const nextConfig = {
    webpack(config){
        config.plugins.push(Environment('PREFIX_APP'))
        return config
    },
}

export default nextConfig
```
<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

<br></details>


<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Environment from 'unplugin-flag/vite'

export default defineConfig({
  plugins: [
    Environment('PREFIX_APP'),
  ],
})
```
<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

<br></details>

<details>
<summary>Farm</summary><br>

```ts
// farm.config.ts
import Environment from 'unplugin-flag/farm'

export default defineconfig({
  plugins: [
    Environment('PREFIX_APP'),
  ],
})
```
<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

<br></details>

<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-flag/rspack')('PREFIX_APP')
  ]
}
```
<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

<br></details>


<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import Environment from 'unplugin-flag/rollup'

export default {
  plugins: [
    Environment('PREFIX_APP'),
  ],
}
```

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

<br></details>


<details>
<summary>Rolldown</summary><br>

```ts
// rolldown.config.js
import Environment from 'unplugin-flag/rolldown'

export default {
  plugins: [
    Environment('PREFIX_APP'),
  ],
}
```

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

<br></details>


<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-flag/webpack')("PREFIX_APP")
  ]
}
```

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

<br></details>

<details>
<summary>Esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import Environment from 'unplugin-flag/esbuild'

build({
  plugins: [Environment('PREFIX_APP')],
})
```

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

<br></details>

<details>
<summary>Astro</summary><br>

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config'
import Environment from 'unplugin-flag/astro'

build({
  plugins: [Environment('PREFIX_APP')],
})
```

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

<br></details>

#### Schema Validation

Use the `schema` option with [zod](https://github.com/colinhacks/zod_) for validating environment variables. This automatically creates a virtual module with types.


```ts
Environment({
    match: 'PREFIX_', // or ['PREFIX_', 'PREFIX2_']
    schema: {
        PREFIX_APP_NAME: z.string().min(1).default('My App'),
        PREFIX_APP_PORT: z.coerce.number().min(1).default(3000),
    },
})
```
<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

#### Intellisense with TypeScript
To enable Intellisense for environment variables, add the following to your `tsconfig.json`:

```json
{
    "compilerOptions": {
        "types": ["unplugin-flag/client"]
    }
}
```
<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

### Accessing Environment Variables

You can access environment variables from the virtual module `@env`:

```typescript
import { env } from '@env'

console.log(env.PREFIX_APP_NAME)
```

If you want to customize the module name, use the `moduleEnvName` option:

```typescript
// in plugin configuration
Environment({
    match: 'PREFIX_', // or ['PREFIX_', 'PREFIX2_']
    schema: ...,
    moduleEnvName: 'MYENV',
})


// you can access it from `MYENV` module
import { env } from 'MYENV'

console.log(env.PREFIX_APP_NAME)
```

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

### Client/Server Environment

To handle environment variables separately for client and server, use the client and server options. This allows for precise control over which variables are accessible in different environments.

> [!NOTE]
> When using the client and server options, you cannot access environment variables through the @env module. Instead, use `@env/client` for client-side variables and `@env/server` for server-side variables by default.

Example configuration:
```ts
Environment({
    client: {
        match: 'CLIENT_',
        schema: {
            CLIENT_APP_NAME: z.string().min(1).default('My App'),
        },
    },
    server: {
        match: 'SERVER_',
        schema: {
            SERVER_APP_DB_URL: z.string().min(1).default('postgres://localhost:5432/mydb'),
        }
    },
})
```

If you'd like to change the default module names `@env/client` and `@env/server`, you can use the optional `moduleEnvName` key to define a custom module name for accessing the environment variables.

> [!CAUTION]
> When customizing moduleEnvName for client and server, ensure the module names are different. Using the same name for both client and server can cause conflicts and unpredictable behavior.

```ts
Environment({
    client: {
        match: 'CLIENT_',
        schema: {
            CLIENT_APP_NAME: z.string().min(1).default('My App'),
        },
        moduleEnvName: '@myenv/client', // Optional: Customize the client module name
    },
    server: {
        match: 'SERVER_',
        schema: {
            SERVER_APP_DB_URL: z.string().min(1).default('postgres://localhost:5432/mydb'),
        },
        moduleEnvName: '@myenv/server', // Optional: Customize the server module name
    },
})
```

#### Accessing Client/Server Environment

```ts
// client environment
import { env } from '@env/client'

env.CLIENT_APP_NAME // typed with string

// server environment
import { env } from '@env/server'

env.SERVER_APP_DB_URL // typed with string

```


<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

## Acknowledgements

* [dotenv](https://github.com/motdotla/dotenv) 
* [t3-env](https://github.com/t3-oss/t3-env) 
* [vite-plugin-environment](https://github.com/ElMassimo/vite-plugin-environment)

<hr/>

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

