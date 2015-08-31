module.exports = (env) ->

  express = env.require "express"

  # ##The MobileFrontend
  class MobileMaterialFrontend extends env.plugins.Plugin
    # ###init the frontend:
    init: (@app, @framework, @config) ->
      # * Static assets
      @app.use @config.path, express.static(__dirname)

      @framework.userManager.addAllowPublicAccessCallback( (req) =>
        return (
          # SocketIO
          req.url.match(/^\/socket\.io\/.*$/)? or
          # Application
          req.url.match(new RegExp('^' + @config.path + '.*'))?
        )
      )

  plugin = new MobileMaterialFrontend
  return plugin