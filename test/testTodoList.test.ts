const BN = require('bn.js');

import { TodoListInstance } from "../types/truffle-contracts";

const TodoListContract = artifacts.require("TodoList");

enum CompletitionState {
    ToBeDone,
    InProgress,
    Completed
}

/**
 * Returns an instance of BN given a completition state.
 * @param {CompletitionState} state the state to convert.
 * @returns {BN} state converted
 */
function bn(state: CompletitionState): BN {
    switch(state) {
        case CompletitionState.ToBeDone:
            return new BN("0", 10);
        case CompletitionState.InProgress:
            return new BN("1", 10);
        case CompletitionState.ToBeDone:
            return new BN("2", 10);
    }
    return new BN("-1", 10);
}

contract("TodoList", (accounts) => {
    let todoList: TodoListInstance;
    let expectedOwnerOfFirstTodo: string;
    
    before(async () => {
        todoList = await TodoListContract.deployed();
    });

    describe("Adding two todo items, retrieve the todo items of the first and the second separately, update the status of the two added items", async () => {
        before("Adding a todo item using accounts[0] and one other using accounts[1]", async () => {
            await todoList.addTodoItem("This is a test todo item by accounts[0].", {
                from: accounts[0]
            });

            await todoList.addTodoItem("This is a second test todo item by accounts[1].", {
                from: accounts[1]
            });
        });

        it("Can retrieve all todo items of the two accounts", async () => {
            const todoItemsOfAcc0 = await todoList.getTodoItems({
                from: accounts[0]
            });
            const todoItemsOfAcc1 = await todoList.getTodoItems({
                from: accounts[1]
            });
            assert.equal(2, todoItemsOfAcc0.length + todoItemsOfAcc1.length, "There shold be 2 todo items!");
        });

        it("Can update the status of the todo items", async () => {
            const itemBeforeUpdate = (await todoList.getTodoItems({from:accounts[1]}))[0];
            let toPassTest1 = itemBeforeUpdate.state.toString();
            assert.equal(toPassTest1, "0", "The state should be \"To be done\".")
            
            const updateStatus = await todoList.updateTodoItemState.call("2", "1", {
                from: accounts[1]
            });
            assert.equal(updateStatus, true, "The status of the todo item should have been updated!");
            
            // const itemAfterUpdate = (await todoList.getTodoItems({from:accounts[1]}));
            // console.log(itemAfterUpdate);
            // let toPassTest2 = itemAfterUpdate[0].state.toString();
            // assert.equal(toPassTest2, "1", "The state should be \"In progress\".");
        });
    });
});