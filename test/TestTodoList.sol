// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/TodoList.sol";

contract TestAdoption {
    // The address of the TodoList contract to be tested
    TodoList todoList = TodoList(DeployedAddresses.TodoList());
}