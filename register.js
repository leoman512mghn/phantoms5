// ===== Registration =====
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        const error = document.getElementById('registerError');

        error.classList.remove('show');

        if (!username || !email || !password || !confirm) {
            error.textContent = 'يرجى تعبئة جميع الحقول';
            error.classList.add('show');
            return;
        }
        if (password.length < 6) {
            error.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
            error.classList.add('show');
            return;
        }
        if (password !== confirm) {
            error.textContent = 'كلمة المرور غير متطابقة';
            error.classList.add('show');
            return;
        }

        let users = [];
        try { users = JSON.parse(localStorage.getItem('phantoms_users')) || []; } catch {}

        if (users.find(u => u.username === username)) {
            error.textContent = 'اسم المستخدم موجود مسبقاً';
            error.classList.add('show');
            return;
        }
        if (users.find(u => u.email === email)) {
            error.textContent = 'البريد الإلكتروني مستخدم مسبقاً';
            error.classList.add('show');
            return;
        }

        const newUser = {
            id: 'u_' + Date.now(),
            username,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('phantoms_users', JSON.stringify(users));

        // Send webhook
        fetch('/api/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'registration',
                data: { username, email }
            })
        }).catch(() => {});

        showToast('✅ تم إنشاء الحساب بنجاح! مرحباً بك');
        setTimeout(() => window.location.href = 'login.html', 1000);
    });
});
