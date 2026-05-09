document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-ready');
    const navbar = document.getElementById('mainNavbar');
    const navLinks = document.querySelectorAll('.nav-link');

    function syncNavbarOffset() {
        if (!navbar) return;
        document.documentElement.style.setProperty('--navbar-offset', `${navbar.offsetHeight}px`);
    }

    function onScrollNavbar() {
        if (!navbar) return;
        if (window.scrollY > 24) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    function initSmoothScroll() {
        const getNavbarOffset = () => (navbar ? navbar.offsetHeight + 16 : 120);

        navLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href') || '';
                if (!href.startsWith('#')) return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - getNavbarOffset();
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });
    }

    function setActiveLinkByPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach((link) => {
            const href = link.getAttribute('href') || '';
            link.classList.remove('active');

            if ((currentPage === 'index.html' || currentPage === '') && href === 'index.html') {
                link.classList.add('active');
            }
            if (currentPage === 'landing.html' && href === 'landing.html') {
                link.classList.add('active');
            }
            if (currentPage === 'about.html' && href === 'about.html') {
                link.classList.add('active');
            }
            if (currentPage === 'contact.html' && href === 'contact.html') {
                link.classList.add('active');
            }
        });
    }

    function initRevealAnimations() {
        const revealItems = document.querySelectorAll('.reveal');
        if (!revealItems.length || !('IntersectionObserver' in window)) {
            revealItems.forEach((item) => item.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        revealItems.forEach((item) => observer.observe(item));
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        requestAnimationFrame(() => notification.classList.add('show'));

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 250);
        }, 2800);
    }

    function getProyectoText(value) {
        const proyectos = {
            web: 'Pagina para conseguir consultas',
            data: 'Analisis de oportunidades',
            both: 'Pagina + estrategia completa',
            consulting: 'Asesoria para crecimiento',
            automation: 'Automatizacion comercial'
        };
        return proyectos[value] || value;
    }

    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        const submitBtn = document.getElementById('submitBtn');

        if (!contactForm || !submitBtn) return;

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre')?.value.trim() || '';
            const email = document.getElementById('email')?.value.trim() || '';
            const telefono = document.getElementById('telefono')?.value.trim() || '';
            const tipoProyecto = document.getElementById('tipoProyecto')?.value || '';
            const mensaje = document.getElementById('mensaje')?.value.trim() || '';
            const privacyPolicy = document.getElementById('privacyPolicy');

            if (!privacyPolicy || !privacyPolicy.checked) {
                showNotification('Debes aceptar la politica de privacidad.', 'danger');
                return;
            }

            if (!nombre || !email || !mensaje) {
                showNotification('Completa los campos requeridos para continuar.', 'danger');
                return;
            }

            const proyectoText = tipoProyecto ? `*Necesita:* ${getProyectoText(tipoProyecto)}%0A` : '';
            const telefonoText = telefono ? `*Telefono:* ${telefono}%0A` : '';

            const whatsappMessage =
                `*Nueva consulta - DataVantex*%0A%0A` +
                `*Nombre:* ${nombre}%0A` +
                `*Email:* ${email}%0A` +
                telefonoText +
                proyectoText +
                `*Mensaje:*%0A${mensaje}%0A%0A` +
                `*Fecha:* ${new Date().toLocaleDateString()}`;

            const phoneNumber = '542954217949';
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'contact_form_submit',
                contact_channel: 'whatsapp',
                page_path: window.location.pathname
            });

            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Abriendo WhatsApp...';
            submitBtn.disabled = true;

            setTimeout(() => {
                window.open(whatsappURL, '_blank', 'noopener');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                showNotification('Te redirigimos a WhatsApp para continuar.', 'success');
                contactForm.reset();
            }, 800);
        });
    }

    function initWhatsAppTracking() {
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
        if (!whatsappLinks.length) return;

        whatsappLinks.forEach((link) => {
            link.addEventListener('click', () => {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'whatsapp_click',
                    link_url: link.href,
                    link_text: (link.textContent || '').trim(),
                    page_path: window.location.pathname
                });
            });
        });
    }

    function applyTheme(theme) {
        const sunIcon = document.querySelector('#themeToggle .fa-sun');
        const moonIcon = document.querySelector('#themeToggle .fa-moon');

        document.body.classList.remove('light-mode');
        if (sunIcon) sunIcon.style.display = 'inline-block';
        if (moonIcon) moonIcon.style.display = 'none';
    }

    function initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        applyTheme('dark');
        localStorage.setItem('datavantex-theme', 'dark');
        if (!themeToggle) return;
        themeToggle.setAttribute('aria-hidden', 'true');
    }

    window.addEventListener('scroll', onScrollNavbar);
    window.addEventListener('resize', syncNavbarOffset);

    onScrollNavbar();
    syncNavbarOffset();
    setActiveLinkByPage();
    initSmoothScroll();
    initRevealAnimations();
    initContactForm();
    initWhatsAppTracking();
    initThemeToggle();
});
