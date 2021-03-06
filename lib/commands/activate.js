module.exports = {
  name: 'deploy:activate',
  description: 'Activates a passed deploy-revision',
  works: 'insideProject',

  availableOptions: [
    { name: 'revision', type: String, required: true },
    { name: 'verbose', type: Boolean },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
  ],

  anonymousOptions: [
    '<deployTarget>'
  ],

  run: function(commandOptions, rawArgs) {
    commandOptions.deployTarget = rawArgs.shift();
    this.ui.verbose = commandOptions.verbose;
    process.env.DEPLOY_TARGET = commandOptions.deployTarget;

    var ReadConfigTask = require('../tasks/read-config');
    var readConfig = new ReadConfigTask({
      project: this.project,
      deployTarget: commandOptions.deployTarget,
      deployConfigFile: commandOptions.deployConfigFile
    });
    var self = this;
    return readConfig.run().then(function(config){
      var PipelineTask = require('../tasks/pipeline');
      var pipeline = new PipelineTask({
        project: self.project,
        ui: self.ui,
        config: config,
        deployTarget: commandOptions.deployTarget,
        commandOptions: commandOptions,
        hooks: [
          'configure',
          'setup',
          'willActivate',
          'activate',
          'didActivate',
          'teardown'
        ]
      });

      return pipeline.run();
    });
  }
};
