
const SUPABASE_URL = "https://ubraxnjvtkxnyqbwrcua.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_67htyNHKtCYMm4fptsEoCg_deg0fX9F";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const resetForm = document.getElementById("reset-form");
const message = document.getElementById("message");

resetForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const password = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password.length < 8) {
        message.textContent = "كلمة المرور لازم تكون 8 أحرف على الأقل.";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "كلمتا المرور مش متطابقتين.";
        return;
    }

    const button = resetForm.querySelector("button");
    button.disabled = true;
    message.textContent = "جاري تغيير كلمة المرور...";

    try {
        const { error } = await supabaseClient.auth.updateUser({
            password: password
        });

        if (error) {
            message.textContent =
                "تعذر تغيير كلمة المرور: " + error.message;
            return;
        }

        message.textContent =
            "تم تغيير كلمة المرور بنجاح. ارجع وسجّل دخول المدير بكلمة المرور الجديدة.";

        resetForm.reset();
    } catch (error) {
        message.textContent = "حصل خطأ في الاتصال. حاول مرة تانية.";
    } finally {
        button.disabled = false;
    }
});
