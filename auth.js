// ===== Login =====
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPassword').value;
        const error = document.getElementById('loginError');

        error.classList.remove('show');

        if (!user || !password) {
            error.textContent = 'يرجى إدخال اسم المستخدم وكلمة المرور';
            error.classList.add('show');
            return;
        }

        let users = [];
        try { users = JSON.parse(localStorage.getItem('phantoms_users')) || []; } catch {}

        const found = users.find(u => (u.username === user || u.email === user) && u.password === password);

        if (!found) {
            error.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
            error.classList.add('show');
            return;
        }

        localStorage.setItem('phantoms_logged_in', found.id);
        showToast('✅ تم تسجيل الدخول بنجاح');
        setTimeout(() => window.location.href = 'dashboard.html', 800);
    });
});
