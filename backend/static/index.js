let fridgeData = {
    temperature: 0,
    humidity: 0,
    door: "",
    products: [],
    missingProducts: [],
    desiredProducts: [],
    availableProducts: [],
    selectedProduct: ""
};

let url;

// Funzione per aggiornare l'interfaccia utente con i dati del frigo
function updateUI() {
    getFridgeData();
    getProducts();
    getAvailableProducts();
    getWishList();
    getMissingProducts();

    document.getElementById("temperatureValue").innerText = fridgeData.temperature;
    document.getElementById("humidityValue").innerText = fridgeData.humidity;
    document.getElementById("fridgeStatusValue").innerText = fridgeData.door;

    // Update product lists
    updateProductList("productListItems", fridgeData.products, false);
    updateProductList("missingProductsList", fridgeData.missingProducts, false);
    updateProductList("desiredProductsList", fridgeData.desiredProducts, true);
}

function updateProductList(listId, products, removeButton) {
    const productList = document.getElementById(listId);

    // Clear the existing list
    productList.innerHTML = '';

    // Add legend at the beginning of the list
    const legendItem = document.createElement("li");
    legendItem.classList.add("legend");

    // Create legend elements for product name and quantity
    const legendName = document.createElement("span");
    legendName.classList.add("legend-item");
    legendName.textContent = "Product";

    const legendQuantity = document.createElement("span");
    legendQuantity.classList.add("legend-item");
    legendQuantity.textContent = "Quantity";

    const legendRemoveButton = document.createElement("button");
    legendRemoveButton.classList.add("remove-button", "custom-remove-button");
    legendRemoveButton.innerHTML = '<i class="fas fa-times"></i>'; // Assuming you are using Font Awesome for the cross icon   
    legendRemoveButton.style.visibility = "hidden"; // Set visibility
    legendRemoveButton.style.pointerEvents = "none"; // Disable pointer events

    // Append legend elements to the legend item
    legendItem.appendChild(legendName);
    legendItem.appendChild(legendQuantity);
    if (removeButton)
        legendItem.appendChild(legendRemoveButton);

    // Append the legend item to the product list
    productList.appendChild(legendItem);

    products.forEach(product => {
        const listItem = document.createElement("li");
        listItem.classList.add("product-list-item");

        // Create elements for product name and quantity
        const productName = document.createElement("span");
        productName.classList.add("product-name");
        productName.textContent = product.name;

        const productQuantity = document.createElement("span");
        productQuantity.classList.add("product-quantity");
        productQuantity.textContent = product.quantity;

        listItem.appendChild(productName);
        listItem.appendChild(productQuantity);

        if (removeButton) {
            // Create remove button with a cross inside
            const removeButton = document.createElement("button");
            removeButton.classList.add("remove-button", "custom-remove-button");
            removeButton.innerHTML = '<i class="fas fa-times"></i>'; // Assuming you are using Font Awesome for the cross icon            

            // Add event listener to remove the item when the button is clicked
            removeButton.addEventListener("click", function() {
                removeFromWishlist(product.name);
            });

            listItem.appendChild(removeButton);
        }

        // Append the list item to the product list
        productList.appendChild(listItem);
    });
}

async function getFridgeData() {
    url = 'http://raspberrypi:8080/sensor/all';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();

        // Update fridge data
        if (data) {
            // Update fridge data and UI
            fridgeData.temperature = data.temperature;
            fridgeData.humidity = data.humidity;
            fridgeData.door = data.door;
        }
    } catch (error) {
        console.error('Error during API request:', error);
    }
}

async function getProducts() {
    url = 'http://raspberrypi:8080/product/status';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();

        if (data) {
            // Assuming data has a structure similar to the JSON you provided
            fridgeData.products = data;
        }

    } catch (error) {
        console.error('Error during API request:', error);
    }
}

async function getAvailableProducts() {
    url = 'http://raspberrypi:8080/product/all';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();

        if (data) {
            // Assuming data has a structure similar to the JSON you provided
            fridgeData.availableProducts = data;
        }

        updateAvailableProducts();

    } catch (error) {
        console.error('Error during API request:', error);
    }
}

function updateAvailableProducts() {
    const productNameDropdown = document.getElementById("productName");

    // Clear existing options
    productNameDropdown.innerHTML = '';

    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.text = fridgeData.selectedProduct || 'Select a product';
    defaultOption.value = '';
    productNameDropdown.add(defaultOption);

    // Add options for each available product
    fridgeData.availableProducts.forEach(product => {
        const option = document.createElement('option');
        option.text = product.name;
        productNameDropdown.add(option);
    });
}

async function getWishList() {
    url = 'http://raspberrypi:8080/wishlist';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();

        fridgeData.desiredProducts = data;

    } catch (error) {
        console.error('Error during API request:', error);
    }
}

async function addToWishlist() {
    url = 'http://raspberrypi:8080/wishlist/addProduct';

    if (fridgeData.selectedProduct != "") {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: fridgeData.selectedProduct,
                    quantity: document.getElementById("productQuantity").value
                })
            });

            updateUI();
        } catch (error) {
            console.error('Error during API request:', error);
        }
    }
}

async function removeFromWishlist(productName) {
    url = 'http://raspberrypi:8080/wishlist/removeProduct';

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: productName
            })
        });

        updateUI();
    } catch (error) {
        console.error('Error during API request:', error);
    }
}

async function getMissingProducts() {
    url = 'http://raspberrypi:8080/wishlist/missingProducts';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();

        fridgeData.missingProducts = data;

    } catch (error) {
        console.error('Error during API request:', error);
    }
}

// Funzione per gestire il caricamento della pagina
function handlePageLoad() {
    var select = document.getElementById("productName");
    
    if (fridgeData.selectedProduct) {
        select.value = fridgeData.selectedProduct;
    }

    // Aggiorna localStorage quando viene cambiato il valore del select
    select.addEventListener("change", function() {
        fridgeData.selectedProduct = select.value;
    });
}

// Inizializza l'interfaccia utente
handlePageLoad();

// Inizializza e aggiorna l'interfaccia utente periodicamente (ogni 5 secondi)
updateUI();
setInterval(updateUI, 5000);
