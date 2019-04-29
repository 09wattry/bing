const { setup, logger, run } = require("./app");

setup()
  .then(async () => {
    run();
  })
  .catch(error => {
    logger.info(
      "An error occurred while making setting up and running the application:",
      error
    );
  });