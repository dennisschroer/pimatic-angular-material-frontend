module.exports = (env) ->

  express = env.require "express"
  fs = require "fs"

  # ##The MobileFrontend
  class MobileMaterialFrontend extends env.plugins.Plugin
    # ###init the frontend:
    init: (@app, @framework, @config) ->
      # Prepare index.html
      fs.readFile __dirname + '/index.tmpl.html', 'utf8', (err,data) =>
        if (err)
          return env.logger.error err
        data = data.replace('{{title}}', @config.customTitle);
        data = data.replace('{{debug}}', @config.debug);
        fs.writeFile __dirname + '/index.html', data, 'utf8', (err) ->
          if (err)
            return env.logger.error err

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