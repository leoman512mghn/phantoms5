// ===== Admin Login =====
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;

    if (localStorage.getItem('phantoms_admin') === 'true') {
        window.location.href = 'admin-dashboard.html';
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('adminUser').value.trim();
        const password = document.getElementById('adminPass').value;
        const error = document.getElementById('adminLoginError');

        error.classList.remove('show');

        // Get saved admin credentials or use defaults
        const savedUser = localStorage.getItem('phantoms_admin_user') || 'admin';
        const savedPass = localStorage.getItem('phantoms_admin_pass') || 'PhantomsAdmin2026';

        if (username === savedUser && password === savedPass) {
            localStorage.setItem('phantoms_admin', 'true');
            showToast('✅ مرحباً Admin');
            setTimeout(() => window.location.href = 'admin-dashboard.html', 500);
        } else {
            error.textContent = 'بيانات الدخول غير صحيحة';
            error.classList.add('show');
        }
    });
});
