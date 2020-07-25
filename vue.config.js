module.exports = {
  publicPath: process.env.DEPLOY ? '././' : '/',
  lintOnSave: false,
  pluginOptions: {
    express: {
      shouldServeApp: true,
      serverDir: '.'
    }
  }
};
