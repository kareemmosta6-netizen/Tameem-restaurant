
const restaurantWhatsApp = "201020025623";

function orderOnWhatsApp(productName, price) {
    const message =
        `أهلاً مطعم تميم، عايز أطلب ${productName} بسعر ${price} جنيه.`;

    const whatsappURL =
        `https://wa.me/${restaurantWhatsApp}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");
}

const cart = [];

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    renderCart();
}

function changeQuantity(name, quantity) {
    const item = cart.find(item => item.name === name);

    if (!item) return;

    item.quantity = Number(quantity);

    if (item.quantity <= 0) {
        removeFromCart(name);
        return;
    }

    renderCart();
}

function removeFromCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        cart.splice(index, 1);
    }

    renderCart();
}

function renderCart() {
    const container = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");

    if (!container || !totalElement) return;

    if (cart.length === 0) {
        container.innerHTML =
            '<p class="empty-cart">لسه ما ضفتش أي وجبات.</p>';
        totalElement.textContent = "0";
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <strong>${item.name}</strong>
                <p>${item.price} جنيه للوجبة</p>
            </div>

            <input
                type="number"
                min="1"
                step="1"
                value="${item.quantity}"
                aria-label="كمية ${item.name}"
                onchange="changeQuantity('${item.name}', this.value)"
            >

            <button
                type="button"
                class="remove-item"
                onclick="removeFromCart('${item.name}')"
            >
                حذف
            </button>
        </div>
    `).join("");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    totalElement.textContent = total;
}

function checkoutOnWhatsApp() {
    if (cart.length === 0) {
        alert("من فضلك أضف وجبة واحدة على الأقل.");
        return;
    }

    const restaurantWhatsApp = "201020025623";

    const orderDetails = cart.map(item =>
        `${item.name} × ${item.quantity} = ${item.price * item.quantity} جنيه`
    ).join("\n");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const message =
        `أهلاً مطعم تميم، عايز أطلب:\n${orderDetails}\nالإجمالي: ${total} جنيه`;

    const url =
        `https://wa.me/${restaurantWhatsApp}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
}

function addSelectedQuantity(name, price, inputId) {
    const input = document.getElementById(inputId);
    const quantity = Number(input.value);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        alert("اختار كمية من 1 إلى 20.");
        return;
    }

    for (let i = 0; i < quantity; i++) {
        addToCart(name, price);
    }

    input.value = 1;
}
