/* eslint-disable no-constructor-return */
/* eslint-disable @typescript-eslint/no-var-requires */
const glob = require('glob')
const path = require('path')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
// Const { dependencies } = require('../package.json')

const returnPaths = (globs = [], storiesExtension = /\.?stories\./) => {
  return globs
    .reduce((previousValue, currentValue) => {
      return [...previousValue, ...glob.sync(currentValue)]
    }, [])
    .filter(p => !new RegExp(storiesExtension).test(p))
}

const prepareExposesObject = ({
  paths = [],
  removePrefix = './src/',
  exclude = /\.?stories\./
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

const returnRemotes = remotes =>
  remotes.reduce((prev, curr) => {
    return { ...prev, [curr]: curr }
  }, {})

const prepareRemotesObject = remotes =>
  remotes.length > 0 ? { remotes: returnRemotes(remotes) } : {}

const returnMFConfig = ({
  name = 'app',
  exposesOpts = {},
  remotes = [],
  shared
}) => ({
  name,
  library: { type: 'var', name },
  filename: 'ge_components.js',
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
    paths: Array.isArray(exposesOpts) ? exposesOpts : exposesOpts.paths,
    exclude: exposesOpts.exclude,
    removePrefix: exposesOpts.removePrefix
  }),
  ...prepareRemotesObject(remotes)
})

class FederationExposesPlugin {
  constructor(options) {
    return new ModuleFederationPlugin(returnMFConfig(options))
  }
}

module.exports = {
  returnPaths,
  prepareExposesObject,
  returnMFConfig,
  returnRemotes,
  FederationExposesPlugin
}
