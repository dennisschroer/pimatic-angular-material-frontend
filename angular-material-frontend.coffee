module.exports = (env) ->

  express = env.require "express"
  fs = require "fs"

  # ##The MobileFrontend
  class MobileMaterialFrontend extends env.plugins.Plugin
    # ###init the frontend:
    init: (@app, @framework, @config) ->
      content = "angular.module('pimaticApp.configuration').constant('title', '" + @config.customTitle + "');" +
        "angular.module('pimaticApp.configuration').constant('debug', " + @config.debug + ");"

      fs.writeFile __dirname + "/assets/config.min.js", content,  (err) ->
        if err
          env.logger.error err
        else
          env.logger.info "Configuration loaded"

      # * Static assets
      @app.use @config.mountPath, express.static(__dirname)

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