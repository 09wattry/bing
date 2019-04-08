const app = require("./app");
try {
    app.setup();
    app.run();
} catch (error) {
    console.log("An error occurred while making the request:", error);
}