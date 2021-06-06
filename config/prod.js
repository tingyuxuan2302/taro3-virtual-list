module.exports = {
  env: {
    NODE_ENV: '"production"',
  },
  defineConstants: {
  },
  weapp: {},
  h5: {
    publicPath: "/ztrip-mini-components-h5-demo/",
    router: {
      basename: "/ztrip-mini-components-h5-demo/",
    },
    webpackChain(chain) {
      chain.performance.set("hints", false)
    },
    esnextModules: ["@ctrip/ztrip-mini-components"],
  },
}
