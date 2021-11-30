type Network = "development" | "kovan" | "mainnet";

module.exports = (artifacts: Truffle.Artifacts, web3: Web3) => {
  return async (
    deployer: Truffle.Deployer
  ) => {
    const TodoList = artifacts.require("TodoList");

    await deployer.deploy(TodoList);
  };
};
