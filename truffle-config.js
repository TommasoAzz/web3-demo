const tsNode = require("ts-node");

tsNode.register({
  files: true,
});

module.exports = {
  networks: {
  },
  mocha: {
  },
  compilers: {
    solc: {
      version: "0.8.9"
    }
  }
};
