/**
 * Initializes the Web3 instance with the available provider.
 * 
 * @returns {Promise<Web3>}
 */
async function initWeb3(development = false) {
    console.log("initWeb3");

    let web3Provider;
    // @ts-ignore
    if((!window.ethereum && !window.web3) || development) { // Fallback to Ganache
        // @ts-ignore
        web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    // @ts-ignore
    if (window.ethereum) { // Object injected by wallets like MetaMask, new version.
        // @ts-ignore
        web3Provider = window.ethereum;
        try {
            // Request account access
            await window.ethereum.request({ method: "eth_requestAccounts"});
        } catch (error) {
            // User denied account access...
            console.error("User denied account access");
        }
        
    // @ts-ignore
    } else { // Object injected by wallets like MetaMask, old version.
        // @ts-ignore
        web3Provider = window.web3.currentProvider;
    }
    // @ts-ignore
    return new Web3(web3Provider);
}

/**
 * 
 * @param {Array[object]} todoItems 
 * @param {(id, newState) => Promise<void>} updateStateCallback
 */
function displayTodoItems(todoItems, updateStateCallback) {
    console.log("displayTodoItems");

    displayTodoItemsOfState(todoItems, 0, "toBeDone");
    displayTodoItemsOfState(todoItems, 1, "inProgress");
    displayTodoItemsOfState(todoItems, 2, "completed");

    $("div#completed").children().find("button").text("Done").on("click", false);

    // @ts-ignore
    $(document).on("click", ".changeState", (event) => {
        console.log("Change state event");
        event.preventDefault();

        const id = parseInt($(event.target).data("id"));
        const state = parseInt($(event.target).data("state"));

        updateStateCallback(id, state + 1);
    });
}

/**
 * 
 * @param {(text) => Promise<void>} addItemCallback 
 */
function displayAddItem(addItemCallback) {
    console.log("displayAddItem");
    
    const $column = $("div#toBeDone");
    const $addTodoItem = $("div.todoItemAddTemplate");

    $column.append($addTodoItem.html());

    // @ts-ignore
    $(document).on("click", ".addToList", (event) => {
        console.log("Change state event");
        event.preventDefault();

        const text = $(event.target)
                        .parent()/* <p> */
                        .parent()/* div.card-body */
                        .find(".textToAdd").val();

        addItemCallback(text);
    });
}

/**
 * 
 * @param {Array[object]} todoItems 
 * @param {number} state 
 * @param {string} columnName 
 */
function displayTodoItemsOfState(todoItems, state, columnName) {
    console.log("displayTodoItemsOfState");

    const $title = $("div#" + columnName).children().first();
    $("div#" + columnName).empty();
    $("div#" + columnName).append($title);

    todoItems.filter(tdi => tdi.state.toString() === state.toString()).forEach((tdi, _, __) => {
        const $column = $("div#" + columnName);
        console.log("Found " + $("div.todoItemTemplate").length + " div.todoItemTemplate.");
        const $todoItem = $("div.todoItemTemplate");
        
        const $id = $todoItem.find("h4");
        const $text = $todoItem.find(".card-text");
        const $changeState = $todoItem.find("button");

        $id.text($id.text().substring(0, $id.text().indexOf("#") + 1) + tdi.id);
        $text.text(tdi.text);
        $changeState.attr("data-id", tdi.id);
        $changeState.attr("data-state", tdi.state);

        $column.append($todoItem.html());
    });
}

$(function() {
    // @ts-ignore
    $(window).on("load", async () => {
        const web3 = await initWeb3();
        const networkId = await web3.eth.net.getId();

        // TodoList.json can be found in the root directory because of bs-config.json.
        $.getJSON("TodoList.json", async function(TodoList) {
            console.log("$.getJSON");

            // Loading the smart contract.
            const deployedNetwork = TodoList.networks[networkId];
            console.log(`Network id: ${networkId}`);
            const todoListContract = new web3.eth.Contract(
                // @ts-ignore
                TodoList.abi,
                deployedNetwork.address
            );

            // Loading the accounts.
            const accounts = await web3.eth.getAccounts();
            if(accounts.length == 0) {
                return;
            }
            $("span#accountNumber").text(accounts[0]);

            // Refresh callback.
            const addItemCallback = async (/** @type {string} */ text) => {
                console.log("addItemCallback");

                if(text.trim().length == 0) {
                    return;
                }

                await todoListContract.methods.addTodoItem(text.trim()).send({
                    from: accounts[0]
                });
            }

            // Update state callback,
            const updateStateCallback = async (/** @type {number} */ todoItemId, /** @type {number} */ newState) => {
                console.log("updateStateCallback");

                if(newState > 2) {
                    return;
                }

                const result = await todoListContract.methods.updateTodoItemState(todoItemId.toString(), newState.toString()).call({
                    from: accounts[0]
                });
                console.log(result);

                await todoListContract.methods.updateTodoItemState(todoItemId.toString(), newState.toString()).send({
                    from: accounts[0]
                });
            };

            // Adding the refresh button.
            $("button#refresh").on("click", async function() {
                console.log("Refreshing to-do list.");
                const todoItems = await todoListContract.methods.getTodoItems().call({
                    from: accounts[0]
                });

                console.log("Found " + todoItems.length + " items.");
    
                displayTodoItems(todoItems, updateStateCallback);
                displayAddItem(addItemCallback);
            });

            // Retrieving the available to-do items.
            const todoItems = await todoListContract.methods.getTodoItems().call({
                from: accounts[0]
            });

            displayTodoItems(todoItems, updateStateCallback);
            displayAddItem(addItemCallback);
        });
    });
});
