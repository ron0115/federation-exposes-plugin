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

1. `paths`：批量生成expose对象的目录集合

2. `removePrefix`：调整expose namescope使其符合`emp-tune-dts-plugin`的类型规则。


```ts
const { returnMFConfig } = require("federation-exposes-plugin");
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const { dependencies } = require(path.resolve('./', 'package.json'))

module.exports = {
  plugins: [
    new ModuleFederationPlugin(returnMFConfig({
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
    })),
  ],
};
```

生成的产物示例如下

```json
// src/components/Button/index.tsx
{
  "exposes": {
    "./components/Button": "src/components/Button/index.tsx "
  }
}

 ```