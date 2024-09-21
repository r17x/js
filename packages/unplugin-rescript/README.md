<div align="center">
    <h1>unplugin-rescript</h1>
    <p>
        a plugin for integration <a href="https://rescript-lang.org/"><b>ReScript</b></a> with most Bundler (Vite, Rollup, Webpack, Esbuild, etc).
    </p>
    <p>
        🚧 <b>Status: Work in progress (Unstable) - <a href="./TODO.md">TODO</a>"</b> 🚧
        <a href="https://www.npmjs.com/package/unplugin-rescript">
            <img src="https://img.shields.io/npm/v/unplugin-rescript?color=a1b858&label="/>
        </a>
    </p>
</div>

## Install

```bash
npm i unplugin-rescript
```

```bash
yarn add unplugin-rescript
```

```bash
pnpm add unplugin-rescript
```

```bash
bun add unplugin-rescript
```

## Usage

> Example: [`playground/`](./playground/)

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import ReScript from 'unplugin-rescript/vite'

export default defineConfig({
  plugins: [
    ReScript(),
  ],
})
```
<br></details>

<details>
<summary>Farm</summary><br>

```ts
// farm.config.ts
import ReScript from 'unplugin-rescript/farm'

export default defineconfig({
  plugins: [
    ReScript(),
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
    require('unplugin-rescript/rspack')()
  ]
}
```
<br></details>


<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import ReScript from 'unplugin-rescript/rollup'

export default {
  plugins: [
    ReScript(),
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
    require('unplugin-rescript/webpack')()
  ]
}
```

<br></details>

<details>
<summary>Esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import ReScript from 'unplugin-rescript/esbuild'

build({
  plugins: [ReScript()],
})
```

<br></details>

<details>
<summary>Astro</summary><br>

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config'
import ReScript from 'unplugin-rescript/astro'

build({
  plugins: [ReScript()],
})
```

<br></details>

## Compatibility

## 🔭 Troubleshooting

## ❤️  Credits

Inspired by

* [jihchi/vite-plugin-rescript](https://github.com/jihchi/vite-plugin-rescript) - [@jihchi](https://github.com/jihchi)
* [unplugin/unplugin-starter](https://github.com/unplugin/unplugin-starter) - [@antfu](https://github.com/antfu)
