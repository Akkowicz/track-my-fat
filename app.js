// Storage controller
const StorageCtrl = (function() {
    console.log('Storage Ctrl');
})();

// Item controller
const ItemCtrl = (function() {
    const Item = function(id, name, calories) {
        [this.id, this.name, this.calories] = [id, name, calories];
    }
    // Contains application's state
    const state = {
        items: [
        ],
        currentItem: null,
        totalCalories: 0
    }
    
    // Public
    return {
        // return whole state object
        logState: function() {
            return state;
        },
        // return currentItem
        getCurrentItem: function() {
            return state.currentItem;
        },
        // return all items in the state
        getItems: function() {
            return state.items;
        },
        // return totalCalories value
        getTotalCalories: function() {
            return state.totalCalories;
        },
        // add new calories to the total count
        addCalories: function(newCalories) {
            state.totalCalories += newCalories;
        },
        // add new entry to state.items array
        addItem: function(name, calories) {
            calories = parseInt(calories);
            const ID = state.items.length;
            const newItem = new Item(ID, name, calories);

            state.items.push(newItem);

            return newItem;
        },
        // set currentItem state
        setCurrentItem: function(itemId) {
            state.items.forEach((item) => {
                if (item.id === itemId) {
                    state.currentItem = item;
                }
            });
        },
        // Clear currentItem
        clearCurrentItem: function() {
            state.currentItem = null;
        },
        // update existing item
        updateItem: function(newData) {
            let calorieDiff = state.currentItem.calories;
            [state.currentItem.name, state.currentItem.calories] = [newData.name, (parseInt(newData.calories))];
            calorieDiff -= state.currentItem.calories;
            state.totalCalories -= calorieDiff;
        },
        // Delete currentItem from items array
        deleteItem: function() {
            const ids = state.items.map((item) => {
                return item.id;
            });
            const index = ids.indexOf(state.currentItem.id);

            state.totalCalories -= state.currentItem.calories;
            state.items.splice(index, 1);
        },
        // Clear items array, remove current item and set totalCalories to 0
        purgeItems: function() {
            state.items = [];
            ItemCtrl.clearCurrentItem();
            state.totalCalories = 0;
        }

    }
})();

// UI controller
const UICtrl = (function() {
    // UI selectors for performance and readability 
    const UISelectors = {
        itemList: document.querySelector('#item-list'),
        addBtn: document.querySelector('.add-btn'),
        deleteBtn: document.querySelector('.delete-btn'),
        updateBtn: document.querySelector('.update-btn'),
        backBtn: document.querySelector('.back-btn'),
        clearBtn: document.querySelector('.clear-btn'),
        itemNameInput: document.querySelector('#item-name'),
        itemCaloriesInput: document.querySelector('#item-calories'),
        totalCaloriesDisplay: document.querySelector('.total-calories')
    }
    
    // Expose functions
    return {
        // Read all items from state and display them
        populateItemList: function() {
            const items = ItemCtrl.getItems();
            let html = '';

            items.forEach((item) => {
                html += `
            <li class="collection-item" id="item-${item.id}">
                <strong>${item.name}: </strong><em>${item.calories} Calories</em>
                <a href="#" class="secondary-content"><i class="edit-item material-icons">create</i></a>
            </li>`;

        });
        // Update itemList with new HTML
        UISelectors.itemList.innerHTML = html;
        },
        // Get form values
        getItemInput: function() {
            return {
                name: UISelectors.itemNameInput.value,
                calories: UISelectors.itemCaloriesInput.value
            }
        },
        // Add item to the UI
        addListItem: function(item) {
            UICtrl.showList();
            ItemCtrl.addCalories(item.calories);
            UICtrl.refreshTotalCalories();
            const li = document.createElement('li');
            li.className = 'collection-item';
            li.id = `item-${item.id}`;
            li.innerHTML += `
            <strong>${item.name}: </strong><em>${item.calories} Calories</em>
            <a href="#" class="secondary-content"><i class="edit-item material-icons">create</i></a>`;
            UISelectors.itemList.insertAdjacentElement('beforeend', li);
        },
        // Clear all inputs
        clearInput: function() {
            UISelectors.itemNameInput.value = '';
            UISelectors.itemCaloriesInput.value = '';
        },
        // Hides the ul element
        hideList: function() {
            UISelectors.itemList.style.display = 'none';
        },
        // Show the ul element
        showList: function() {
            UISelectors.itemList.style.display = 'block';
        },
        // Refresh the UI based on the current state
        refreshTotalCalories() {
            UISelectors.totalCaloriesDisplay.textContent = ItemCtrl.getTotalCalories();
        },
        // Resets UI controls
        setInitialState: function() {
            UICtrl.clearInput();
            UISelectors.updateBtn.style.display = 'none';
            UISelectors.deleteBtn.style.display = 'none';
            UISelectors.backBtn.style.display = 'none';
            UISelectors.addBtn.style.display = 'inline-block';
        },
        // Shows item modification state
        showEditState: function() {
            UISelectors.updateBtn.style.display = 'inline-block';
            UISelectors.deleteBtn.style.display = 'inline-block';
            UISelectors.backBtn.style.display = 'inline-block';
            UISelectors.addBtn.style.display = 'none';
        },
        // Make selectors public
        getSelectors: function() {
            return UISelectors;
        },
        // Populate input elements with currentItem values
        populateForm: function() {
            const currentItem = ItemCtrl.getCurrentItem();
            [UISelectors.itemNameInput.value, UISelectors.itemCaloriesInput.value] = [currentItem.name, currentItem.calories];
            UICtrl.showEditState();
        },
        // Redraw the whole state in the UI
        redrawState: function() {
            UICtrl.populateItemList();
            UICtrl.setInitialState();
            UICtrl.refreshTotalCalories();
        }
    }
})();

// App controller
const AppCtrl = (function() {
    // Add all event listeners
    const loadEventListeners = function() {
        const UISelectors = UICtrl.getSelectors();
        UISelectors.addBtn.addEventListener('click', itemAddSubmit);
        UISelectors.itemList.addEventListener('click', itemEditClick);
        UISelectors.updateBtn.addEventListener('click', itemUpdateSubmit);
        UISelectors.deleteBtn.addEventListener('click', itemDeleteSubmit);
        UISelectors.clearBtn.addEventListener('click', clearAllItems);
        UISelectors.backBtn.addEventListener('click', UICtrl.setInitialState);
        document.addEventListener('keypress', function(e) {
            if (e.keyCode === 13 || e.which === 13) {
                e.preventDefault();
                return false;
            }
        })
    };
    // Fires when the add button is clicked
    const itemAddSubmit = function(e) {
        const input = UICtrl.getItemInput();
        
        if (input.name !== '' && input.calories !== '') {
            const newItem = ItemCtrl.addItem(input.name, input.calories);
            UICtrl.addListItem(newItem);
            // Clear input
            UICtrl.clearInput();
        }
        e.preventDefault();
    };
    // Fires when the edit button is clicked
    const itemEditClick = function(e) {
        if (e.target.classList.contains('edit-item')) {
            const itemId = parseInt((e.target.parentNode.parentNode.id.split('-'))[1]);
            ItemCtrl.setCurrentItem(itemId);
            UICtrl.populateForm();
        }

        e.preventDefault();
    };
    // Fires then the update button is clicked
    const itemUpdateSubmit = function(e) {
        const input = UICtrl.getItemInput();
        ItemCtrl.updateItem(input);
        ItemCtrl.clearCurrentItem();

        UICtrl.redrawState();
        e.preventDefault();
    }
    // Fires when the delete button is clicked
    const itemDeleteSubmit = function(e) {
        ItemCtrl.deleteItem();
        ItemCtrl.clearCurrentItem();

        UICtrl.redrawState();
        e.preventDefault();
    };
    // Fires when the clear all button is clicked
    const clearAllItems = function(e) {
        ItemCtrl.purgeItems();

        UICtrl.redrawState();
        e.preventDefault();
    }
    // Expose init function
    return {
        init: function() {
            UICtrl.setInitialState();
            const items = ItemCtrl.getItems();
            // Check if items array is empty
            if (items.length === 0) {
                UICtrl.hideList();
            } else {
                UICtrl.showList();
                UICtrl.populateItemList();
                UICtrl.refreshTotalCalories();
            }

            loadEventListeners();
        },
    };
})(ItemCtrl, UICtrl);

AppCtrl.init();