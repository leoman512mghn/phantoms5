// ===== Admin Auth Check =====
if (localStorage.getItem('phantoms_admin') !== 'true') {
    window.location.href = 'admin.html';
}

// ===== Data =====
function getApps() { try { return JSON.parse(localStorage.getItem('phantoms_apps')) || []; } catch { return []; } }
function saveApps(a) { localStorage.setItem('phantoms_apps', JSON.stringify(a)); }
function getUsers() { try { return JSON.parse(localStorage.getItem('phantoms_users')) || []; } catch { return []; } }

// ===== Sidebar Nav =====
document.querySelectorAll('.admin-sidebar nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.admin-sidebar nav a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
        const section = document.getElementById('section-' + this.dataset.section);
        if (section) section.style.display = 'block';
        document.getElementById('adminSidebar').classList.remove('open');
    });
});

document.getElementById('adminMenuToggle').addEventListener('click', () => {
    document.getElementById('adminSidebar').classList.toggle('open');
});

// ===== Logout =====
document.getElementById('adminLogout').addEventListener('click', () => {
    localStorage.removeItem('phantoms_admin');
    window.location.href = 'admin.html';
});

// ===== Render Stats =====
function renderStats() {
    const apps = getApps();
    document.getElementById('statTotal').textContent = apps.length;
    document.getElementById('statPending').textContent = apps.filter(a => a.status === 'pending').length;
    document.getElementById('statAccepted').textContent = apps.filter(a => a.status === 'accepted').length;
    document.getElementById('statRejected').textContent = apps.filter(a => a.status === 'rejected').length;
    document.getElementById('statUsers').textContent = getUsers().length;
}

// ===== Render Recent Apps =====
function renderRecent() {
    const apps = getApps().slice(-5).reverse();
    const container = document.getElementById('recentApps');
    if (!apps.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد طلبات</p></div>';
        return;
    }
    let html = '<table class="admin-table"><thead><tr><th>اللاعب</th><th>اسم اللعبة</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>';
    apps.forEach(a => {
        html += `<tr>
            <td><strong>${a.username}</strong></td>
            <td>${a.gameName || '—'}</td>
            <td>${a.date || '—'}</td>
            <td><span class="status-badge status-${a.status}">${statusText(a.status)}</span></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===== Render All Apps =====
function renderAllApps(filter) {
    const apps = getApps().reverse();
    const container = document.getElementById('allAppsContainer');
    const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد طلبات ${filter !== 'all' ? statusText(filter) : ''}</p></div>`;
        return;
    }

    let html = '<table class="admin-table"><thead><tr><th>#</th><th>المستخدم</th><th>اسم اللعبة</th><th>العمر</th><th>ساعات</th><th>التاريخ</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>';
    filtered.forEach((a, i) => {
        html += `<tr>
            <td>${i+1}</td>
            <td><strong>${a.username}</strong><br><span style="color:#55406a;font-size:11px;">${a.email}</span></td>
            <td>${a.gameName || '—'}</td>
            <td>${a.age || '—'}</td>
            <td>${a.hours || '—'}</td>
            <td>${a.date || '—'}</td>
            <td><span class="status-badge status-${a.status}">${statusText(a.status)}</span></td>
            <td>
                <button class="action-btn view" onclick="viewApp('${a.id}')"><i class="fas fa-eye"></i></button>
                ${a.status === 'pending' ? `
                    <button class="action-btn accept" onclick="acceptApp('${a.id}')"><i class="fas fa-check"></i></button>
                    <button class="action-btn reject" onclick="rejectApp('${a.id}')"><i class="fas fa-times"></i></button>
                ` : ''}
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function statusText(s) {
    return s === 'pending' ? 'معلق' : s === 'accepted' ? 'مقبول' : s === 'rejected' ? 'مرفوض' : s;
}

// ===== Accept / Reject =====
function viewApp(id) {
    const app = getApps().find(a => a.id === id);
    if (!app) return;
    alert(`المستخدم: ${app.username} (${app.email})\nاسم اللعبة: ${app.gameName}\nالعمر: ${app.age}\nساعات اللعب: ${app.hours || '—'}\nالخبرة: ${app.exp || '—'}\n\nسبب التقديم:\n${app.reason}\n\nالمهارات:\n${app.skills || '—'}\n\nتاريخ التقديم: ${app.date}`);
}

function acceptApp(id) {
    let apps = getApps();
    const idx = apps.findIndex(a => a.id === id);
    if (idx === -1) return;
    apps[idx].status = 'accepted';
    apps[idx].rejectReason = '';
    saveApps(apps);
    renderStats(); renderRecent(); renderAllApps(getCurrentFilter());
    showToast('✅ تم قبول الطلب');
    sendDiscordNotification(apps[idx], 'accepted');
}

function rejectApp(id) {
    const reason = prompt('أدخل سبب الرفض (سيظهر للمتقدم):');
    if (reason === null) return;
    if (!reason.trim()) {
        showToast('❌ يجب إدخال سبب الرفض', false);
        return;
    }
    let apps = getApps();
    const idx = apps.findIndex(a => a.id === id);
    if (idx === -1) return;
    apps[idx].status = 'rejected';
    apps[idx].rejectReason = reason.trim();
    saveApps(apps);
    renderStats(); renderRecent(); renderAllApps(getCurrentFilter());
    showToast('✅ تم رفض الطلب مع إرسال السبب');
    sendDiscordNotification(apps[idx], 'rejected');
}

function getCurrentFilter() {
    const active = document.querySelector('#section-applications .tab.active');
    return active ? active.dataset.filter : 'all';
}

function sendDiscordNotification(app, status) {
    fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'status_update',
            data: { ...app, newStatus: status }
        })
    }).catch(() => {});
}

// ===== Apps Tabs =====
document.querySelectorAll('#section-applications .tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('#section-applications .tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderAllApps(this.dataset.filter);
    });
});

// ===== Members =====
function renderMembers() {
    const users = getUsers();
    const container = document.getElementById('membersContainer');
    if (!users.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>لا يوجد أعضاء</p></div>';
        return;
    }
    let html = '<table class="admin-table"><thead><tr><th>#</th><th>اسم المستخدم</th><th>البريد</th><th>تاريخ التسجيل</th><th>حالة التقديم</th></tr></thead><tbody>';
    const apps = getApps();
    users.forEach((u, i) => {
        const app = apps.find(a => a.userId === u.id);
        const status = app ? app.status : 'none';
        const statusLabel = status === 'none' ? '—' : statusText(status);
        const statusClass = status === 'none' ? '' : `status-${status}`;
        html += `<tr>
            <td>${i+1}</td>
            <td><strong>${u.username}</strong></td>
            <td>${u.email}</td>
            <td>${new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
            <td>${status !== 'none' ? `<span class="status-badge ${statusClass}">${statusLabel}</span>` : '—'}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===== Application Toggle =====
const appToggle = document.getElementById('appToggle');
const toggleStatus = document.getElementById('toggleStatus');

function loadToggleState() {
    const isOpen = localStorage.getItem('phantoms_apps_open') !== 'false';
    appToggle.checked = isOpen;
    toggleStatus.innerHTML = `حالة التقديم: <strong style="color:${isOpen ? '#4ade80' : '#ef4444'};">${isOpen ? 'مفتوح' : 'مغلق'}</strong>`;
}

appToggle.addEventListener('change', () => {
    localStorage.setItem('phantoms_apps_open', appToggle.checked);
    toggleStatus.innerHTML = `حالة التقديم: <strong style="color:${appToggle.checked ? '#4ade80' : '#ef4444'};">${appToggle.checked ? 'مفتوح' : 'مغلق'}</strong>`;
    showToast(appToggle.checked ? '✅ التقديم مفتوح الآن' : '🔴 التقديم مغلق الآن');
});

// ===== Admin Settings =====
document.getElementById('adminSettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newUser = document.getElementById('adminNewUser').value.trim();
    const newPass = document.getElementById('adminNewPass').value.trim();
    if (!newUser || !newPass) { showToast('❌ يرجى تعبئة الحقول', false); return; }
    localStorage.setItem('phantoms_admin_user', newUser);
    localStorage.setItem('phantoms_admin_pass', newPass);
    showToast('✅ تم حفظ الإعدادات');
});

// ===== Init =====
renderStats();
renderRecent();
renderAllApps('all');
renderMembers();
loadToggleState();
