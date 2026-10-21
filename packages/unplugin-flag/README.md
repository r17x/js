<div align="center">
    <h1>unplugin-flag</h1>
    <p>
        A plugin for feature flag.
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
    * [2. Flag your code](#flag-your-code)
    * [3. Done](#)
* [💡 Acknowledgements](#acknowledgements)

## Features

* ✍️ **Type-Safe**: Automatically inferred types based on your feature flag configuration.
* ⚡ **Developer-Friendly**: Lightweight and simple API for managing feature flag.
* **💀 Dead Code Elimination**: Removed unused code flag. 

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
import Flag from 'unplugin-flag/webpack'

const nextConfig = {
    webpack(config){
        config.plugins.push(Flag('PREFIX_APP'))
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
import Flag from 'unplugin-flag/vite'

export default defineConfig({
  plugins: [
    Flag('PREFIX_APP'),
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
import Flag from 'unplugin-flag/farm'

export default defineconfig({
  plugins: [
    Flag('PREFIX_APP'),
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
import Flag from 'unplugin-flag/rollup'

export default {
  plugins: [
    Flag('PREFIX_APP'),
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
import Flag from 'unplugin-flag/rolldown'

export default {
  plugins: [
    Flag('PREFIX_APP'),
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
import Flag from 'unplugin-flag/esbuild'

build({
  plugins: [Flag('PREFIX_APP')],
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
import Flag from 'unplugin-flag/astro'

build({
  plugins: [Flag('PREFIX_APP')],
})
```

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

<br></details>

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

### Flag your code

```ts
import { flag } from '@flag'

const someFeature = flag.MY_FEATURE("show me when true", "show me when false")
```

Result
```diff
// when true
-- const someFeature = flag.MY_FEATURE("show me when true", "show me when false")
++ const someFeature = "show me when true"

// when false
-- const someFeature = flag.MY_FEATURE("show me when true", "show me when false")
++ const someFeature = "show me when false"
```

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

## Acknowledgements

<hr/>

<div align="right">
    <a href="#table-of-contents"><strong>⇡ <i>Back to top</i></strong></a>
</div>

