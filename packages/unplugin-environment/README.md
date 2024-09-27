<div align="center">
    <h1>unplugin-environment</h1>
    <p>
        A plugin for loading enviroment variables safely with schema validation, simple with virtual module, type-safe with intellisense, and better DX 🔥 🚀 👷. 
    </p>
    <p>
        <a href="https://www.npmjs.com/package/unplugin-environment"><img src="https://img.shields.io/npm/v/unplugin-environment.svg?style=flat-square&label=npm:unplugin-environment" alt="npm package"></a>
    </p>
    <h2><strong>Supported with:</string></h2>
    <p>
        <a href="https://www.npmjs.com/package/next"><img src="https://img.shields.io/badge/%20Next.js-grey?style=for-the-badge&logo=nextdotjs" alt="Next.js"></a>
        <a href="https://www.npmjs.com/package/vite"><img src="https://img.shields.io/badge/%20Vite-grey?style=for-the-badge&logo=vite" alt="Vite"></a>
        <a href="https://www.npmjs.com/package/esbuild"><img src="https://img.shields.io/badge/%20Esbuild-grey?style=for-the-badge&logo=esbuild" alt="Esbuild"></a>
        <a href="https://www.npmjs.com/package/webpack"><img src="https://img.shields.io/badge/%20Webpack-grey?style=for-the-badge&logo=webpack" alt="Webpack"></a>
        <a href="https://www.npmjs.com/package/astro"><img src="https://img.shields.io/badge/%20Astro-grey?style=for-the-badge&logo=astro" alt="Astro"></a>
        <a href="https://www.npmjs.com/package/rollup"><img src="https://img.shields.io/badge/%20Rollup-grey?style=for-the-badge&logo=rollupdotjs" alt="Rollup"></a>
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
        * [1.a Schema Validation](#schema-validation) `👍 Recommended`
        * [1.b Intellisense with TypeScript](#intellisense-with-typescript) `👍 Recommended`
    * [2. Accessing Environment Variables](#accessing-environment-variables)
    * [3. Done](#)
* [💡 Acknowledgements](#acknowledgements)

## Features

* 🔥 Safely load environment variables with schema validation. 
    * say no to `Im forgot define env variable` and error 😢.
    * say no to expose sensitive information.
* ✍️ Typed environment variables (automatically inferred based on your configuration).
* 👍 Simple and lightweight API for accessing environment variables.

## Installation
```bash
npm install unplugin-environment       # npm

yarn add unplugin-environment          # yarn

bun add unplugin-environment           # bun

pnpm add unplugin-environment          # pnpm
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
import Environment from 'unplugin-environment/webpack'

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
import Environment from 'unplugin-environment/vite'

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
import Environment from 'unplugin-environment/farm'

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
    require('unplugin-environment/rspack')()
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
import Environment from 'unplugin-environment/rollup'

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
    require('unplugin-environment/webpack')()
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
import Environment from 'unplugin-environment/esbuild'

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
import Environment from 'unplugin-environment/astro'

build({
  plugins: [Environment('PREFIX_APP')],
})
```

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

<br></details>

#### Schema Validation

You can use the `schema` option with [zod](https://github.com/colinhacks/zod) to validate the environment variables. it will produce a type and `virtual module` for you.


```ts
Environment({
    match: 'PREFIX_', // or ['PREFIX_', 'PREFIX2_']
    schema: {
        PREFIX_APP_NAME: z.string().min(1).default('My App'),
        PREFIX_APP_PORT: z.string().min(1).default('3000').transform(n => n | 0).pipe(z.number())
    },
})
```
<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

#### Intellisense with TypeScript
```json
{
    "compilerOptions": {
        "types": ["unplugin-environment/client"]
    }
}
```
<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

### Accessing Environment Variables

You can acess environment vareiables from `Virtual` module called `@env`.
```typescript
import { env } from '@env'

console.log(env.PREFIX_APP_NAME)
```

if you want to change the module name, you can define the `moduleEnvName` option.

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

## Acknowledgements

* [dotenv](https://github.com/motdotla/dotenv) 
* [t3-env](https://github.com/t3-oss/t3-env) 
* [vite-plugin-environment](https://github.com/ElMassimo/vite-plugin-environment)

<hr/>

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

