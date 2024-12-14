const http = require("http");
const app = require("./app");

const server = http.createServer(app);

server.listen(3003, () => {
  console.log("ride server is running on port 3003");
});
