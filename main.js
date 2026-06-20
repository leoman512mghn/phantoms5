// ===== Particles =====
(function() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.3 + 0.05;
            this.color = Math.random() > 0.5 ? '168, 85, 247' : '0, 255, 255';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                this.x -= dx * 0.005;
                this.y -= dy * 0.005;
            }
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle());

    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
})();

// ===== Hamburger =====
(function() {
    const btn = document.getElementById('hamburger');
    const menu = document.querySelector('nav ul');
    if (btn && menu) {
        btn.addEventListener('click', () => menu.classList.toggle('open'));
    }
})();

// ===== Nav Active =====
(function() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav ul a').forEach(a => {
        if (a.getAttribute('href') === page) a.classList.add('active');
    });
})();

// ===== Toast =====
function showToast(msg, isSuccess = true) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.color = isSuccess ? '#4ade80' : '#ef4444';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
}
