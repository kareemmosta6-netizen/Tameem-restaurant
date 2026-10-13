
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
    const deliveryElement = document.getElementById("delivery-cost");
    const finalTotalElement = document.getElementById("final-total");

    if (!container || !totalElement || !deliveryElement || !finalTotalElement) {
        return;
    }

    
if (cart.length === 0) {
    const areaSelect = document.getElementById("delivery-area");
    const deliveryFee = areaSelect && areaSelect.value !== ""
        ? Number(areaSelect.value)
        : 0;

    container.innerHTML =
        '<p class="empty-cart">لسه ما ضفتش أي وجبات.</p>';

    totalElement.textContent = "0";
    deliveryElement.textContent = deliveryFee;
    finalTotalElement.textContent = deliveryFee;
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

    const foodTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const areaSelect = document.getElementById("delivery-area");
    const deliveryFee = areaSelect && areaSelect.value !== ""
        ? Number(areaSelect.value)
        : 0;

    totalElement.textContent = foodTotal;
    deliveryElement.textContent = deliveryFee;
    finalTotalElement.textContent = foodTotal + deliveryFee;
}






function checkoutOnWhatsApp() {
    if (cart.length === 0) {
        alert("من فضلك أضف وجبة واحدة على الأقل.");
        return;
    }

    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const address = document.getElementById("customer-address").value.trim();

    
const areaSelect = document.getElementById("delivery-area");
const area = areaSelect.options[areaSelect.selectedIndex];

if (
    !areaSelect.value ||
    !Number.isFinite(Number(areaSelect.value)) ||
    Number(areaSelect.value) < 0 ||
    !area.dataset.area
) {
    alert("من فضلك اختار منطقة توصيل صحيحة.");
    areaSelect.focus();
    return;
}

const deliveryFee = Number(areaSelect.value);


    if (!name || !phone || !address || !areaSelect.value) {
        alert("من فضلك املأ بيانات التوصيل واختار منطقتك.");
        document.getElementById("customer").scrollIntoView({
            behavior: "smooth"
        });
        return;
    }

    

    const orderDetails = cart.map(item =>
        `${item.name} × ${item.quantity} = ${item.price * item.quantity} جنيه`
    ).join("\n");

    const foodTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const total = foodTotal + deliveryFee;
    const areaName = area.dataset.area;

    const message =
        `أهلاً مطعم تميم، عايز أطلب:\n\n` +
        `اسم العميل: ${name}\n` +
        `رقم الموبايل: ${phone}\n` +
        `العنوان: ${address}\n` +
        `منطقة التوصيل: ${areaName}\n\n` +
        `الوجبات:\n${orderDetails}\n\n` +
        `إجمالي الوجبات: ${foodTotal} جنيه\n` +
        `مصاريف التوصيل: ${deliveryFee} جنيه\n` +
        `الإجمالي النهائي: ${total} جنيه`;

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
document.getElementById("delivery-area").addEventListener("change", function () {
    renderCart();
});

/* عرض الوجبات المضافة من لوحة إدارة مطعم تميم */
async function loadAdminMealsOnWebsite() {
    const mealsGrid = document.getElementById("admin-meals-grid");

    if (!mealsGrid || !window.supabase) {
        return;
    }

    const SUPABASE_URL =
        "https://ubraxnjvtkxnyqbwrcua.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_67htyNHKtCYMm4fptsEoCg_deg0fX9F";

    const client = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    const { data: meals, error } = await client
        .from("meals")
        .select("id, name, description, price, image_url, is_available")
        .eq("is_available", true)
        .order("id", { ascending: true });

    if (error) {
        console.error("خطأ في تحميل الوجبات:", error.message);
        mealsGrid.innerHTML =
            "<p>تعذر تحميل الوجبات الجديدة حاليًا.</p>";
        return;
    }

    mealsGrid.replaceChildren();

    meals.forEach((meal) => {
        const card = document.createElement("article");
        card.className = "food-card";

        const image = document.createElement("img");
        image.src = meal.image_url || 
            "https://placehold.co/600x400?text=Tamim+Restaurant";
        image.alt = meal.name;
        image.loading = "lazy";

        const info = document.createElement("div");
        info.className = "food-info";

        const title = document.createElement("h3");
        title.textContent = meal.name;

        const description = document.createElement("p");
        description.textContent = meal.description || "";

        const bottom = document.createElement("div");
        bottom.className = "food-bottom";

        const price = document.createElement("strong");
        price.textContent = `${meal.price} جنيه`;

        const controls = document.createElement("div");
        controls.className = "food-order-controls";

        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.max = "20";
        input.value = "1";
        input.id = `admin-meal-quantity-${meal.id}`;
        input.setAttribute("aria-label", `كمية ${meal.name}`);

        const label = document.createElement("label");
        label.htmlFor = input.id;
        label.textContent = "الكمية:";

        const button = document.createElement("button");
        button.className = "food-button";
        button.type = "button";
        button.textContent = "أضف للسلة";

        button.addEventListener("click", () => {
            if (typeof addSelectedQuantity !== "function") {
                alert("تعذر إضافة الوجبة للسلة.");
                return;
            }

            addSelectedQuantity(meal.name, Number(meal.price), input.id);
        });

        controls.append(label, input, button);
        bottom.append(price, controls);
        info.append(title, description, bottom);
        card.append(image, info);
        mealsGrid.appendChild(card);
    });
}

loadAdminMealsOnWebsite();
