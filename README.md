<div align="center">
  <h1>federation-exposes-plugin</h1>
  <p>批量生成module federation exposes对象的插件。</p>
</div>

## Install

```sh
npm install --save-dev federation-exposes-plugin
# or
yarn add -D federation-exposes-plugin
```

## 使用

```ts
const { FederationExposesPlugin } = require("federation-exposes-plugin");
const { dependencies } = require(path.resolve('./', 'package.json'))

module.exports = {
  plugins: [
    new FederationExposesPlugin({
      name: 'my_app', // this will be used by the consuming federation host
      exposesOpts: {
        // paths glob to the exposes
        paths: ['./src/**/*.ts{,x}'],
        // exclude regex
        exclude: /\.?stories\./,
        // remove prefix
        removePrefix: './src/'
      },
      shared: {
        ...dependencies
      }
    }),
  ],
};
```

## 例子

插件做了两件事：
1. 批量生成expose对象
2. 调整expose namescope使其符合`emp-tune-dts-plugin`的类型规则。

```json
// src/components/Button/index.tsx
{
  "exposes": {
    "./components/Button": "src/components/Button/index.tsx "
  }
}

 ```