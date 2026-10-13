
const SUPABASE_URL =
    "https://ubraxnjvtkxnyqbwrcua.supabase.co";

// مهم: ضع هنا نفس Publishable Key الموجود في ملفك الحالي
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_67htyNHKtCYMm4fptsEoCg_deg0fX9F";

const RESET_PASSWORD_URL =
    "https://kareemmosta6-netizen.github.io/Tameem-restaurant/reset-password.html";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginMessage = document.getElementById("login-message");
const logoutButton = document.getElementById("logout-button");
const forgotPasswordButton =
    document.getElementById("forgot-password-button");

const mealForm = document.getElementById("meal-form");
const mealIdInput = document.getElementById("meal-id");
const mealNameInput = document.getElementById("meal-name");
const mealDescriptionInput =
    document.getElementById("meal-description");
const mealPriceInput = document.getElementById("meal-price");
const mealImageInput = document.getElementById("meal-image");
const mealAvailableInput = document.getElementById("meal-available");
const saveMealButton = document.getElementById("save-meal-button");
const cancelEditButton = document.getElementById("cancel-edit-button");
const refreshMealsButton =
    document.getElementById("refresh-meals-button");
const mealsTableBody = document.getElementById("meals-table-body");
const mealMessage = document.getElementById("meal-message");
const mealsListMessage =
    document.getElementById("meals-list-message");

function showLogin(message = "") {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
    loginMessage.textContent = message;
}

function showDashboard() {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
    loginMessage.textContent = "";
}

async function verifyAdmin() {
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        showLogin();
        return false;
    }

    const { data, error } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Admin verification error:", error);
        showLogin("تعذر التحقق من صلاحيات المدير.");
        return false;
    }

    if (!data) {
        await supabaseClient.auth.signOut();
        showLogin("الحساب ده مش مصرح له بإدارة المطعم.");
        return false;
    }

    showDashboard();
    return true;
}

function resetMealForm() {
    mealForm.reset();
    mealIdInput.value = "";
    mealAvailableInput.checked = true;
    saveMealButton.textContent = "إضافة الوجبة";
    cancelEditButton.hidden = true;
}

function updateMealStats(meals) {
    const totalElement = document.getElementById("total-meals");
    const availableElement = document.getElementById("available-meals");
    const unavailableElement = document.getElementById("unavailable-meals");

    const total = meals.length;
    const available = meals.filter(meal => meal.is_available).length;
    const unavailable = total - available;

    if (totalElement) totalElement.textContent = total;
    if (availableElement) availableElement.textContent = available;
    if (unavailableElement) unavailableElement.textContent = unavailable;
}

function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
}

async function loadMeals() {
    refreshMealsButton.disabled = true;
    mealsListMessage.textContent = "جاري تحميل الوجبات...";
    mealsTableBody.replaceChildren();

    try {
        const { data: meals, error } = await supabaseClient
            .from("meals")
            .select("id, name, price, is_available, description, image_url")
            .order("id", { ascending: false });

        if (error) {
            console.error("Load meals error:", error);
            mealsListMessage.textContent =
                "تعذر تحميل الوجبات. راجع صلاحيات جدول meals.";
            return;
        }
updateMealStats(meals || []);

        if (!meals || meals.length === 0) {
            mealsListMessage.textContent =
                "لسه مفيش وجبات مضافة لقاعدة البيانات.";
            return;
        }

        mealsListMessage.textContent =
            `عدد الوجبات: ${meals.length}`;

        meals.forEach((meal) => {
            const row = document.createElement("tr");

            addCell(row, meal.name);
            addCell(row, `${Number(meal.price).toFixed(2)} جنيه`);
            addCell(row, meal.is_available ? "متاحة" : "غير متاحة");

            const actionsCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "تعديل";
            editButton.addEventListener("click", () => {
                mealIdInput.value = meal.id;
                mealNameInput.value = meal.name;
                mealDescriptionInput.value = meal.description || "";
                mealPriceInput.value = meal.price;
                mealImageInput.value = meal.image_url || "";
                mealAvailableInput.checked = meal.is_available;

                saveMealButton.textContent = "حفظ التعديلات";
                cancelEditButton.hidden = false;
                mealMessage.textContent =
                    `أنت بتعدّل وجبة: ${meal.name}`;

                mealForm.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "حذف";
            deleteButton.className = "logout-button";
            deleteButton.addEventListener("click", async () => {
                const confirmed = window.confirm(
                    `هل أنت متأكد إنك عايز تحذف وجبة "${meal.name}"؟`
                );

                if (!confirmed) return;

                deleteButton.disabled = true;

                const { error: deleteError } = await supabaseClient
                    .from("meals")
                    .delete()
                    .eq("id", meal.id);

                if (deleteError) {
                    console.error("Delete meal error:", deleteError);
                    mealsListMessage.textContent =
                        "فشل حذف الوجبة. راجع صلاحيات الحذف.";
                    deleteButton.disabled = false;
                    return;
                }

                if (mealIdInput.value === String(meal.id)) {
                    resetMealForm();
                }

                mealMessage.textContent = "";
                await loadMeals();
            });

            actionsCell.append(editButton, deleteButton);
            row.appendChild(actionsCell);
            mealsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        mealsListMessage.textContent =
            "حصل خطأ أثناء الاتصال بقاعدة البيانات.";
    } finally {
        refreshMealsButton.disabled = false;
    }
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const loginButton = document.getElementById("login-button");

    loginButton.disabled = true;
    loginMessage.textContent = "جاري التحقق من البيانات...";

    try {
        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Login error:", error);
            showLogin("فشل تسجيل الدخول. راجع البريد وكلمة المرور.");
            return;
        }

        const isAdmin = await verifyAdmin();

        if (isAdmin) {
            await loadMeals();
        }
    } catch (error) {
        console.error(error);
        showLogin("حصل خطأ في الاتصال. حاول مرة تانية.");
    } finally {
        loginButton.disabled = false;
    }
});

forgotPasswordButton.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();

    if (!email) {
        loginMessage.textContent =
            "اكتب البريد الإلكتروني الأول، وبعدها اضغط نسيت كلمة المرور.";
        document.getElementById("email").focus();
        return;
    }

    forgotPasswordButton.disabled = true;
    loginMessage.textContent = "جاري إرسال رابط الاستعادة...";

    try {
        const { error } =
            await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: RESET_PASSWORD_URL
            });

        if (error) {
            console.error("Recovery error:", error);
            loginMessage.textContent =
                "تعذر إرسال رابط الاستعادة. حاول لاحقًا أو راجع إعدادات Supabase.";
            return;
        }

        loginMessage.textContent =
            "لو البريد مسجل، هتوصلك رسالة استعادة. راجع الوارد وSpam.";
    } catch (error) {
        console.error(error);
        loginMessage.textContent = "حصل خطأ في الاتصال.";
    } finally {
        forgotPasswordButton.disabled = false;
    }
});

mealForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = mealNameInput.value.trim();
    const description = mealDescriptionInput.value.trim();
    const price = Number(mealPriceInput.value);
    const imageUrl = mealImageInput.value.trim();
    const isAvailable = mealAvailableInput.checked;
    const mealId = mealIdInput.value;

    if (!name || !Number.isFinite(price) || price <= 0) {
        mealMessage.textContent =
            "اكتب اسم الوجبة وسعرًا أكبر من صفر.";
        return;
    }

    if (imageUrl) {
        try {
            const parsedUrl = new URL(imageUrl);

            if (parsedUrl.protocol !== "https:" &&
                parsedUrl.protocol !== "http:") {
                throw new Error("Invalid image URL");
            }
        } catch {
            mealMessage.textContent =
                "رابط الصورة غير صحيح. اكتب رابطًا يبدأ بـ https:// أو http://";
            return;
        }
    }

    saveMealButton.disabled = true;
    mealMessage.textContent = "جاري حفظ الوجبة...";

    const mealData = {
        name,
        description,
        price,
        image_url: imageUrl,
        is_available: isAvailable
    };

    try {
        let result;

        if (mealId) {
            result = await supabaseClient
                .from("meals")
                .update(mealData)
                .eq("id", mealId)
                .select("id");
        } else {
            result = await supabaseClient
                .from("meals")
                .insert([mealData])
                .select("id");
        }

        if (result.error) {
            console.error("Save meal error:", result.error);
            mealMessage.textContent =
                "تعذر حفظ الوجبة. تأكد من صلاحيات المدير وجدول meals.";
            return;
        }

        if (!result.data || result.data.length === 0) {
            mealMessage.textContent =
                "لم يتم تأكيد حفظ الوجبة. راجع صلاحيات قاعدة البيانات.";
            return;
        }

        mealMessage.textContent = mealId
            ? "تم تعديل الوجبة بنجاح."
            : "تمت إضافة الوجبة بنجاح.";

        resetMealForm();
        await loadMeals();
    } catch (error) {
        console.error(error);
        mealMessage.textContent =
            "حصل خطأ أثناء حفظ الوجبة. حاول مرة تانية.";
    } finally {
        saveMealButton.disabled = false;
    }
});

cancelEditButton.addEventListener("click", () => {
    resetMealForm();
    mealMessage.textContent = "تم إلغاء التعديل.";
});

refreshMealsButton.addEventListener("click", loadMeals);

logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;

    try {
        await supabaseClient.auth.signOut();
        showLogin("تم تسجيل الخروج.");
    } catch (error) {
        console.error(error);
        loginMessage.textContent = "تعذر تسجيل الخروج. حاول مرة تانية.";
    } finally {
        logoutButton.disabled = false;
    }
});

async function initializeAdmin() {
    showLogin();

    try {
        const isAdmin = await verifyAdmin();

        if (isAdmin) {
            await loadMeals();
        }
    } catch (error) {
        console.error(error);
        showLogin("تعذر الاتصال. راجع إعدادات المشروع.");
    }
}

initializeAdmin();
