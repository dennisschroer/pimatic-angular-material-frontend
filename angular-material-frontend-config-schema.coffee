# #mobile-frontend configuration options
module.exports = {
  title: "pimatic-angular-material-frontend config"
  type: "object"
  properties:
    customTitle:
      description: "Custimg title to use for the pimatic installation"
      type: "string"
      default: "pimatic"
    debug:
      description: "that to true to get additional debug outputs"
      type: "boolean"
      default: false
}