module.exports = (env) ->

  express = env.require "express"

  # ##The MobileFrontend
  class MobileMaterialFrontend extends env.plugins.Plugin
    # ###init the frontend:
    init: (@app, @framework, @config) ->
      # * Static assets
      @app.use @config.path, express.static(__dirname + "/app")

  plugin = new MobileMaterialFrontend
  return plugin