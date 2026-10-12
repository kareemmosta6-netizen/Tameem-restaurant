
const restaurantWhatsApp = "201020025623";

function orderOnWhatsApp(productName, price) {
    const message =
        `أهلاً مطعم تميم، عايز أطلب ${productName} بسعر ${price} جنيه.`;

    const whatsappURL =
        `https://wa.me/${restaurantWhatsApp}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");
}
