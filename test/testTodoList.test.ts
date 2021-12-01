const BN = require('bn.js');

import { TodoListInstance } from "../types/truffle-contracts";

const TodoListContract = artifacts.require("TodoList");

enum CompletitionState {
    ToBeDone,
    InProgress,
    Completed
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
            const itemBeforeUpdate = (await todoList.getTodoItems({
                from: accounts[1]
            }))[0];
            assert.equal(itemBeforeUpdate.state.toString(), "0", "The state should be \"To be done\".")
            
            const updateStatusCorrect = await todoList.updateTodoItemState.call("2", "1", {
                from: accounts[1]
            });
            assert.equal(updateStatusCorrect, true, "The status of the todo item should have been updated!");
            
            // The test passed, let's issue the real transaction.
            await todoList.updateTodoItemState("2", "1", { from: accounts[1] });

            const updateStatusIncorrect = await todoList.updateTodoItemState.call("2", "1", {
                from: accounts[1]
            });
            assert.equal(updateStatusIncorrect, false, "The status of the todo item should NOT have been updated!");
        });
    });
});