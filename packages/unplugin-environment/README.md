<div align="center">
    <h1>unplugin-environment</h1>
    <p>
        a plugin for loading enviroment variables safely.
    </p>
    <p>
        🚧 <b>Status: Work in progress (Unstable) - <a href="./TODO.md">TODO</a>"</b> 🚧
    </p>
</div>

## Install

```bash
npm i unplugin-environment
```

```bash
yarn add unplugin-environment
```

```bash
pnpm add unplugin-environment
```

```bash
bun add unplugin-environment
```

## Usage

> Example: [`playground/`](./playground/)

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Environment from 'unplugin-environment/vite'

export default defineConfig({
  plugins: [
    Environment(),
  ],
})
```
<br></details>

<details>
<summary>Farm</summary><br>

```ts
// farm.config.ts
import Environment from 'unplugin-environment/farm'

export default defineconfig({
  plugins: [
    Environment(),
  ],
})
```
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
<br></details>


<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import Environment from 'unplugin-environment/rollup'

export default {
  plugins: [
    Environment(),
  ],
}
```

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

<br></details>

<details>
<summary>Esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import Environment from 'unplugin-environment/esbuild'

build({
  plugins: [Environment()],
})
```

<br></details>

<details>
<summary>Astro</summary><br>

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config'
import Environment from 'unplugin-environment/astro'

build({
  plugins: [Environment()],
})
```

<br></details>

## Compatibility

## 🔭 Troubleshooting

## ❤️  Credits

Inspired by

* [dotenv](https://github.com/motdotla/dotenv) 
* [t3-env](https://github.com/t3-oss/t3-env) 
* [vite-plugin-environment](https://github.com/ElMassimo/vite-plugin-environment)
