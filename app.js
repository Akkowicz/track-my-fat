// Storage controler
const StorageCtrl = (function() {
    console.log('Storage Ctrl');
})();

// Item controler
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
        // return all items in the state
        getItems: function() {
            return state.items;
        },
        // return totalcalories value
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
        }
    }
})();

// UI controler
const UICtrl = (function() {
    // UI selectors for performance and readability 
    const UISelectors = {
        itemList: document.querySelector('#item-list'),
        addBtn: document.querySelector('.add-btn'),
        itemNameInput: document.querySelector('#item-name'),
        itemCaloriesInput: document.querySelector('#item-calories'),
        totalCaloriesDisplay: document.querySelector('.total-calories')
    }
    
    // Expose functions
    return {
        // Read all items from state and display them
        populateItemList: function(items) {
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
        // Make selectors public
        getSelectors: function() {
            return UISelectors;
        }
    }
})();

// App controler
const AppCtrl = (function() {
    // Add all event listeners
    const loadEventListeners = function() {
        const UISelectors = UICtrl.getSelectors();
        UISelectors.addBtn.addEventListener('click', itemAddSubmit);
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
    // Expose init function
    return {
        init: function() {
            const items = ItemCtrl.getItems();
            // Check if items array is empty
            if (items.length === 0) {
                UICtrl.hideList();
            } else {
                UICtrl.showList();
                UICtrl.populateItemList(items);
                UICtrl.refreshTotalCalories();
            }

            loadEventListeners();
        },
    };
})(ItemCtrl, UICtrl);

AppCtrl.init();