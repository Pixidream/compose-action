const core = require("@actions/core");
const compose = require("docker-compose");
const utils = require("./utils");

try {
  const composeFiles = utils.parseComposeFiles(
    core.getMultilineInput("compose-file")
  );
  if (!composeFiles.length) {
    return;
  }

  const services = core.getMultilineInput("services", { required: false });

  const options = {
    config: composeFiles,
    log: true,
    composeOptions: utils.parseFlags(core.getInput("compose-flags")),
    commandOptions: utils.parseFlags(core.getInput("up-flags")),
  };
  
  const [serv, command] = utils.parseExec(core.getInput("exec"))

  const promise =
    services.length > 0
      ? compose.upMany(services, options)
      : compose.upAll(options);

  promise
    .then(() => {
      console.log("compose started");
      if (serv !== "" && command !== "") {
        compose.exec(serv, command)
      }
    })
    .catch((err) => {
      core.setFailed(`compose up failed ${JSON.stringify(err)}`);
    });
} catch (error) {
  core.setFailed(error.message);
}
