module.exports = (env) ->

  express = env.require "express"
  fs = require "fs"
  #bower = require "bower"

  # ##The MobileFrontend
  class MobileMaterialFrontend extends env.plugins.Plugin
    # ###init the frontend:
    init: (@app, @framework, @config) ->
      # Prepare index.html
      fs.readFile __dirname + '/index.tmpl.html', 'utf8', (err,data) =>
        if (err)
          return env.logger.error err
        data = data.replace(/@@title/g, @config.customTitle);
        data = data.replace(/@@debug/g, @config.debug);
        fs.writeFile __dirname + '/index.html', data, 'utf8', (err) ->
          if (err)
            return env.logger.error err
          env.logger.info "Generated index.html"

      # Update dependencies
      # Does not work: you can not call bower update with a reference to the bower.json file
      #env.logger.info "Updating dependencies. This can take some time (runs next to startup)..."
      #bower.commands.update([__dirname], {production: true}, {}).on('log', (log) =>
      #  env.logger.info log
      #)

      # Static assets
      @app.use @config.mountPath, express.static(__dirname)
      env.logger.info "Mounted material frontend on '" + @config.mountPath + "'"

      @framework.userManager.addAllowPublicAccessCallback( (req) =>
        return (
          # SocketIO
          req.url.match(/^\/socket\.io\/.*$/)? or
          # Application
          req.url.match(new RegExp('^' + @config.mountPath + '.*'))?
        )
      )

  plugin = new MobileMaterialFrontend
  return plugin