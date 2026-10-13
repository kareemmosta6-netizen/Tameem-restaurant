
const SUPABASE_URL =
    "https://ubraxnjvtkxnyqbwrcua.supabase.co";

// استخدم نفس Publishable key الموجود في admin.js
const SUPABASE_PUBLISHABLE_KEY =
    "ضع_هنا_مفتاح_Publishable_الخاص_بمشروعك";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const resetForm = document.getElementById("reset-form");
const resetMessage = document.getElementById("reset-message");
const resetButton = document.getElementById("reset-button");

resetForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const password = document.getElementById("new-password").value;
    const confirmation =
        document.getElementById("confirm-password").value;

    if (password.length < 8) {
        resetMessage.textContent =
            "كلمة المرور لازم تكون 8 أحرف على الأقل.";
        return;
    }

    if (password !== confirmation) {
        resetMessage.textContent =
            "كلمتا المرور مش متطابقتين.";
        return;
    }

    resetButton.disabled = true;
    resetMessage.textContent = "جاري التحقق وتغيير كلمة المرور...";

    try {
        // نتأكد إن رابط الاستعادة أنشأ جلسة صالحة
        const {
            data: { session },
            error: sessionError
        } = await supabaseClient.auth.getSession();

        if (sessionError || !session) {
            resetMessage.textContent =
                "رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا.";
            return;
        }

        const { error } = await supabaseClient.auth.updateUser({
            password
        });

        if (error) {
            resetMessage.textContent =
                "تعذر تغيير كلمة المرور: " + error.message;
            return;
        }

        await supabaseClient.auth.signOut();

        resetForm.reset();

        resetMessage.textContent =
            "تم تغيير كلمة المرور بنجاح. تقدر دلوقتي ترجع لصفحة المدير وتسجّل دخولك.";
    } catch (error) {
        console.error(error);
        resetMessage.textContent =
            "حصل خطأ في الاتصال. حاول مرة تانية.";
    } finally {
        resetButton.disabled = false;
    }
});
