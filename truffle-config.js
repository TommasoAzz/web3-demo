const tsNode = require("ts-node");

tsNode.register({
  files: true,
});

module.exports = {
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
  },
  mocha: {
  },
  compilers: {
    solc: {
      version: "0.8.9"
    }
  }
};
