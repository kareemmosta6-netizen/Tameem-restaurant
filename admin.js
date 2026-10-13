
const SUPABASE_URL =
    "https://ubraxnjvtkxnyqbwrcua.supabase.co";

// ضع هنا نفس Publishable key الموجود في مشروعك
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
const forgotPasswordButton = document.getElementById(
    "forgot-password-button"
);

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
        showLogin(
            "تعذر التحقق من صلاحيات المدير. راجع إعدادات Supabase."
        );
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

// تسجيل الدخول
loginForm.addEventListener("submit", async function (event) {
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
            console.error("Login error:", error.code, error.message);
            showLogin("فشل تسجيل الدخول. راجع البريد وكلمة المرور.");
            return;
        }

        await verifyAdmin();
    } catch (error) {
        console.error(error);
        showLogin("حصل خطأ في الاتصال. حاول مرة تانية.");
    } finally {
        loginButton.disabled = false;
    }
});

// إرسال رابط استعادة كلمة المرور
forgotPasswordButton.addEventListener("click", async function () {
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
            console.error("Recovery error:", error.message);

            if (error.message.includes("rate limit")) {
                loginMessage.textContent =
                    "طلبات الاستعادة كتير. استنى لحد ما حد الإرسال يتجدد.";
            } else {
                loginMessage.textContent =
                    "تعذر إرسال رابط الاستعادة: " + error.message;
            }

            return;
        }

        loginMessage.textContent =
            "لو البريد مسجل، هتوصلك رسالة استعادة. راجع الوارد وSpam.";
    } catch (error) {
        console.error(error);
        loginMessage.textContent =
            "حصل خطأ في الاتصال. حاول مرة تانية.";
    } finally {
        forgotPasswordButton.disabled = false;
    }
});

// تسجيل الخروج
logoutButton.addEventListener("click", async function () {
    logoutButton.disabled = true;

    try {
        await supabaseClient.auth.signOut();
        showLogin("تم تسجيل الخروج.");
    } finally {
        logoutButton.disabled = false;
    }
});

// التحقق من الجلسة عند فتح الصفحة
async function initializeAdmin() {
    showLogin();

    try {
        await verifyAdmin();
    } catch (error) {
        console.error(error);
        showLogin("تعذر الاتصال. راجع إعدادات المشروع.");
    }
}

initializeAdmin();
