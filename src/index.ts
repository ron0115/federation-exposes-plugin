/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import glob from 'glob'
import path from 'path'
import ModuleFederationPlugin from 'webpack/lib/container/ModuleFederationPlugin'

const returnPaths = (globs:string[] = [], storiesExtension = /\.?stories\./) => {
  return globs
    .reduce((previousValue: string[], currentValue) => {
      return [...previousValue, ...glob.sync(currentValue)]
    }, [])
    .filter(p => !new RegExp(storiesExtension).test(p))
}

const prepareExposesObject = ({
  paths = [],
  removePrefix = './src/',
  exclude = /\.?stories\./
}: {
  paths?: string[]
  removePrefix?: string
  exclude?: RegExp
}) => {
  const files = returnPaths(paths, exclude)

  return files.reduce(
    (previousValue, currentValue) => {
      const extension = path.extname(currentValue)

      return {
        exposes: {
          ...previousValue.exposes,
          [currentValue
            .replace(removePrefix, './')
            .replace(extension, '')
            .replace(/\/index$/, '')]: currentValue
        }
      }
    },
    { exposes: {} }
  )
}

const returnRemotes = (remotes: string[]) =>
  remotes.reduce((prev, curr) => {
    return { ...prev, [curr]: curr }
  }, {})

const prepareRemotesObject = (remotes: string[] | Record<string, string>) =>
  // eslint-disable-next-line no-nested-ternary
  Array.isArray(remotes) 
    ? { remotes: returnRemotes(remotes) } 
    : (typeof remotes === 'object' ? { remotes } : {})

type Options = {
  name: string
  exposesOpts?: {
    paths?: string[] | string
    exclude?: RegExp
    removePrefix?: string
  },
  remotes?: Record<string, string>
  shared?: Record<string, string>
  override: Record<string, string>
}
const returnMFConfig = ({
  name = 'app',
  exposesOpts = {},
  remotes = {},
  shared = {},
  override = {}
}: Options) => ({
  name,
  library: { type: 'var', name },
  filename: `${name}.js`,
  // Shared: returnShared(shared),
  shared: {
    // ...dependencies,
    react: {
      // RequiredVersion: dependencies.react,
      import: 'react', // The "react" package will be used a provided and fallback module
      shareKey: 'react', // Under this name the shared module will be placed in the share scope
      shareScope: 'default', // Share scope with this name will be used
      singleton: true, // Only a single version of the shared module is allowed
      eager: false
    },
    'react-dom': {
      // RequiredVersion: dependencies['react-dom'],
      singleton: true, // Only a single version of the shared module is allowed
      eager: false
    },
    ...shared
  },
  ...prepareExposesObject({
    paths: Array.isArray(exposesOpts) ? exposesOpts : [],
    exclude: exposesOpts.exclude,
    removePrefix: exposesOpts.removePrefix
  }),
  // Remotes
  ...prepareRemotesObject(remotes),
  ...override
})

class FederationExposesPlugin {
  constructor(options: Options) {
    // eslint-disable-next-line no-constructor-return
    return new ModuleFederationPlugin(returnMFConfig(options))
  }
}

export {
  returnPaths,
  prepareExposesObject,
  prepareRemotesObject,
  returnMFConfig,
  returnRemotes,
  FederationExposesPlugin
}
