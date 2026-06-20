// ===== User Dashboard =====
document.addEventListener('DOMContentLoaded', () => {
    const loginPrompt = document.getElementById('loginPrompt');
    const userPanel = document.getElementById('userPanel');
    const statusSection = document.getElementById('statusSection');
    const applicationSection = document.getElementById('applicationSection');

    const userId = localStorage.getItem('phantoms_logged_in');
    if (!userId) {
        loginPrompt.style.display = 'block';
        userPanel.style.display = 'none';
        return;
    }

    loginPrompt.style.display = 'none';
    userPanel.style.display = 'block';

    // Get user
    let users = [];
    try { users = JSON.parse(localStorage.getItem('phantoms_users')) || []; } catch {}
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) {
        localStorage.removeItem('phantoms_logged_in');
        window.location.reload();
        return;
    }

    document.getElementById('dashUsername').textContent = currentUser.username;
    document.getElementById('dashAvatar').textContent = currentUser.username.charAt(0).toUpperCase();

    // Get applications
    let apps = [];
    try { apps = JSON.parse(localStorage.getItem('phantoms_apps')) || []; } catch {}
    const myApp = apps.find(a => a.userId === userId);

    // Check if applications are open
    const appsOpen = localStorage.getItem('phantoms_apps_open') !== 'false';

    function renderStatus() {
        if (!myApp) {
            statusSection.innerHTML = '';
            if (appsOpen) {
                applicationSection.style.display = 'block';
                document.getElementById('appStatusMsg').textContent = 'املأ النموذج للتقديم على الانضمام إلى Phantoms';
            } else {
                applicationSection.style.display = 'none';
                statusSection.innerHTML = `
                    <div class="status-card">
                        <span class="big-icon"><i class="fas fa-door-closed" style="color:#ef4444;"></i></span>
                        <div class="status-text" style="color:#ef4444;">التقديم مغلق حالياً</div>
                        <div class="status-desc">سيتم فتح التقديم قريباً — تابعنا لمعرفة الموعد</div>
                    </div>
                `;
            }
            return;
        }

        applicationSection.style.display = 'none';

        const icons = { pending: 'fa-hourglass', accepted: 'fa-check-circle', rejected: 'fa-times-circle' };
        const colors = { pending: '#facc15', accepted: '#4ade80', rejected: '#ef4444' };
        const texts = { pending: 'طلبك قيد المراجعة', accepted: '🎉 تم قبولك في Phantoms!', rejected: 'تم رفض الطلب' };
        const descs = { pending: 'فريق الإدارة يراجع طلبك حالياً. سنرد عليك في أقرب وقت.', accepted: 'تهانينا! أنت الآن عضو رسمي في عصابة Phantoms. سنتواصل معك عبر البريد.', rejected: 'نأسف لرفض طلبك. يمكنك التقديم مرة أخرى في المستقبل.' };

        let extra = '';
        if (myApp.status === 'rejected' && myApp.rejectReason) {
            extra = `<div class="reject-reason"><i class="fas fa-exclamation-circle"></i> سبب الرفض: ${myApp.rejectReason}</div>`;
        }
        if (myApp.status === 'accepted') {
            extra = `<div class="accept-msg"><i class="fas fa-crown"></i> تهانينا! انتظر رسالة البريد الإلكتروني للتفاصيل</div>`;
        }

        statusSection.innerHTML = `
            <div class="status-card">
                <span class="big-icon"><i class="fas ${icons[myApp.status]}" style="color:${colors[myApp.status]};"></i></span>
                <div class="status-text" style="color:${colors[myApp.status]};">${texts[myApp.status]}</div>
                <div class="status-desc">${descs[myApp.status]}</div>
                ${extra}
            </div>
        `;
    }

    renderStatus();

    // ===== Application Form =====
    const form = document.getElementById('applicationForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const gameName = document.getElementById('appGameName').value.trim();
            const age = document.getElementById('appAge').value;
            const hours = document.getElementById('appHours').value;
            const exp = document.getElementById('appExp').value;
            const reason = document.getElementById('appReason').value.trim();
            const skills = document.getElementById('appSkills').value.trim();
            const error = document.getElementById('appError');

            error.classList.remove('show');

            if (!gameName || !age || !reason) {
                error.textContent = 'يرجى تعبئة الحقول الإلزامية';
                error.classList.add('show');
                return;
            }
            if (age < 14) {
                error.textContent = 'العمر يجب أن يكون 14 سنة على الأقل';
                error.classList.add('show');
                return;
            }

            const application = {
                id: 'app_' + Date.now(),
                userId: userId,
                username: currentUser.username,
                email: currentUser.email,
                gameName,
                age,
                hours,
                exp,
                reason,
                skills,
                status: 'pending',
                rejectReason: '',
                date: new Date().toLocaleDateString('ar-EG'),
                createdAt: new Date().toISOString()
            };

            let apps = [];
            try { apps = JSON.parse(localStorage.getItem('phantoms_apps')) || []; } catch {}
            apps.push(application);
            localStorage.setItem('phantoms_apps', JSON.stringify(apps));

            // Webhook
            fetch('/api/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'application', data: application })
            }).catch(() => {});

            showToast('✅ تم إرسال طلبك بنجاح!');
            setTimeout(() => window.location.reload(), 1000);
        });
    }

    // ===== Logout =====
    document.getElementById('userLogout').addEventListener('click', () => {
        localStorage.removeItem('phantoms_logged_in');
        window.location.reload();
    });
});
