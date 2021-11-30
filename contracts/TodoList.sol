// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev State of completition of the To-Do items.
 */
enum CompletitionState {
    ToBeDone,
    InProgress,
    Completed
}

/**
 * @dev The To-Do item itself.
 */
struct TodoItem {
    // The item id.
    uint id;

    // What action should be performed.
    string text;

    // Flag controlling the state of completion of the item.
    CompletitionState state;
}

/**
 * @title Smart Contract for storing To-Do lists.
 * @author Tommaso Azzalin
 */
contract TodoList {
    // This structure stores all the To-Do item by all accounts.
    mapping(address => TodoItem[]) private todoLists;

    // This counter contains the total amount of To-Do items currently stored.
    uint storedItemsTotal;

    /**
     * @dev Adds the To-Do item to the list of items of the account.
     * @param todoDescription the action to perform and that we want to control its status.
     * @return the unique identifier of the To-Do item.
     */
    function addTodoItem(string memory todoDescription) external returns (uint) {
        require(bytes(todoDescription).length > 0);

        TodoItem[] storage usersItems = todoLists[msg.sender];

        storedItemsTotal++;

        TodoItem memory newItem = TodoItem({
            id: storedItemsTotal,
            text: todoDescription,
            state: CompletitionState.ToBeDone
        });
        
        usersItems.push(newItem);

        return storedItemsTotal;
    }

    /**
     * @dev Returns the list of To-Do items of the sender account.
     * @return the To-Do items of the account.
     */
    function getTodoItems() external view returns (TodoItem[] memory) {
        return todoLists[msg.sender];
    }

    /**
     * @dev Adds the To-Do item to the list of items of the account.
     * @param todoItemId the unique identifier returned by the contract function `addTodoItem(todoDescription)`.
     * @param newState the new completition state (can only be larger than the current one.
     * @return `true` if the status was updated, `false` otherwise.
     */
    function updateTodoItemState(uint todoItemId, CompletitionState newState) external returns (bool) {
        TodoItem[] storage usersItems = todoLists[msg.sender];
        
        uint itemCount = usersItems.length;
        bool notFound = true;
        bool updatedState = false;
        TodoItem storage toUpd8;
        for(uint i = 0; i < itemCount && notFound; i++) {
            if(usersItems[i].id == todoItemId) {
                toUpd8 = usersItems[i];
                notFound = false;

                if(toUpd8.state != newState &&
                    ((toUpd8.state == CompletitionState.ToBeDone && newState == CompletitionState.InProgress) ||
                    (toUpd8.state == CompletitionState.InProgress && newState == CompletitionState.Completed))
                )  {
                    toUpd8.state = newState;
                    updatedState = true;
                }
            }
        }

        return updatedState;
    }
}