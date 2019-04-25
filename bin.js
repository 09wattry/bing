const { setup, logger } = require("./app");

setup()
  .then(() => {})
  .catch(error => {
    logger.info(
      "An error occurred while making setting up and running the application:",
      error
    );
  });
