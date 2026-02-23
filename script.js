document.addEventListener('DOMContentLoaded', () => {
    // ====================
    // 1. INICIALIZACIÓN
    // ====================

    // Inicializar AOS (Animate on Scroll)
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // ====================
    // 2. NAVBAR - OCULTAR AL SCROLL HACIA ABAJO
    // ====================

    const navbar = document.getElementById('mainNavbar');
    let lastScrollTop = 0;
    const scrollThreshold = 100;

    function handleNavbarScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
            // Scroll hacia abajo - ocultar navbar
            navbar.classList.add('navbar-hidden');
            navbar.classList.remove('navbar-transparent');
        } else {
            // Scroll hacia arriba - mostrar navbar
            navbar.classList.remove('navbar-hidden');

            if (scrollTop > 50) {
                navbar.classList.add('scrolled');
                navbar.classList.add('navbar-transparent');
            } else {
                navbar.classList.remove('scrolled');
                navbar.classList.remove('navbar-transparent');
            }
        }

        lastScrollTop = scrollTop;
    }

    // ====================
    // 3. VIDEO DEL HERO CON CONTROLES (Solo index.html)
    // ====================

    const heroVideo = document.getElementById('heroVideo');
    const videoControl = document.getElementById('videoControl');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const videoFallback = document.getElementById('videoFallback');

    if (heroVideo && videoControl) {
        // Verificar si el video se puede reproducir
        heroVideo.addEventListener('loadeddata', () => {
            videoFallback.style.opacity = '0';
        });

        heroVideo.addEventListener('error', () => {
            // Si hay error con el video, mostrar imagen de fallback
            videoFallback.style.opacity = '1';
            videoControl.style.display = 'none';
        });

        // Control de reproducción
        videoControl.addEventListener('click', () => {
            if (heroVideo.paused) {
                heroVideo.play();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                heroVideo.pause();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        });

        // Actualizar icono cuando el video se pausa automáticamente
        heroVideo.addEventListener('pause', () => {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        });

        heroVideo.addEventListener('play', () => {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        });

        // Intentar reproducir automáticamente
        const playPromise = heroVideo.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Autoplay no permitido, mostrar controles
                videoControl.style.display = 'flex';
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            });
        }
    }

    // ====================
    // 4. CONTADORES ANIMADOS (Solo index.html)
    // ====================

    const statNumbers = document.querySelectorAll('.stat-number[data-count]');

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    animateCounter(element);
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => observer.observe(stat));
    }

    // ====================
    // 7. EFECTOS PARALLAX
    // ====================

    const parallaxElements = document.querySelectorAll('[data-depth]');

    function handleParallax() {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-depth'));
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });

        const impactSection = document.querySelector('.impact-section');
        if (impactSection) {
            const rect = impactSection.getBoundingClientRect();
            const speed = 0.5;
            const yPos = -(rect.top * speed);
            impactSection.style.backgroundPositionY = `${yPos}px`;
        }
    }

    // ====================
    // 8. NAVEGACIÓN SUAVE PARA ANCLAS EN LA MISMA PÁGINA
    // ====================

    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            // Si es un ancla dentro de la misma página
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });

                    // Actualizar enlaces activos
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
            // Si es un enlace a otra página, dejar que el navegador maneje la navegación
        });
    });

    function updateActiveNav() {
        const scrollPosition = window.scrollY + 100;
        const sections = document.querySelectorAll('section[id]');

        // Obtener la página actual
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    // Solo actualizar si estamos en la misma página que el enlace
                    const linkHref = link.getAttribute('href');
                    if (linkHref === `#${sectionId}` ||
                        (linkHref === currentPage && sectionId === 'inicio')) {
                        link.classList.add('active');
                    } else if (!linkHref.startsWith('#')) {
                        // Enlaces a otras páginas
                        if (linkHref === currentPage) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    }
                });
            }
        });
    }

    // ====================
    // 9. FORMULARIO DE CONTACTO - REDIRECCIÓN A WHATSAPP
    // ====================

    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Obtener los valores del formulario
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const telefono = document.getElementById('telefono').value;
            const tipoProyecto = document.getElementById('tipoProyecto').value;
            const mensaje = document.getElementById('mensaje').value;

            // Validar que se aceptó la política de privacidad
            const privacyPolicy = document.getElementById('privacyPolicy');
            if (!privacyPolicy.checked) {
                showNotification('Debes aceptar la política de privacidad', 'danger');
                return;
            }

            // Validar campos requeridos
            if (!nombre || !email || !mensaje) {
                showNotification('Por favor completa los campos requeridos', 'danger');
                return;
            }

            // Crear mensaje para WhatsApp
            const proyectoText = tipoProyecto ? `*Tipo de proyecto:* ${getProyectoText(tipoProyecto)}%0A` : '';
            const telefonoText = telefono ? `*Teléfono:* ${telefono}%0A` : '';

            const whatsappMessage =
                `*Nueva Consulta - DataVantex*%0A%0A` +
                `*Nombre:* ${nombre}%0A` +
                `*Email:* ${email}%0A` +
                telefonoText +
                proyectoText +
                `*Mensaje:*%0A${mensaje}%0A%0A` +
                `*Fecha:* ${new Date().toLocaleDateString()}`;

            // Número de WhatsApp (cambia este número por el tuyo)
            const phoneNumber = '+542954682932';

            // Crear URL de WhatsApp
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

            // Mostrar mensaje de envío
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirigiendo a WhatsApp...';
            submitBtn.disabled = true;

            // Esperar 1.5 segundos antes de redirigir (para dar feedback visual)
            setTimeout(() => {
                // Abrir WhatsApp en nueva pestaña
                window.open(whatsappURL, '_blank');

                // Restaurar botón
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;

                    // Mostrar notificación de éxito
                    showNotification('Redirigiendo a WhatsApp para completar la consulta', 'success');

                    // Opcional: Limpiar formulario
                    contactForm.reset();
                }, 500);
            }, 1500);
        });
    }

    // Función para obtener texto del tipo de proyecto
    function getProyectoText(value) {
        const proyectos = {
            'web': 'Desarrollo Web',
            'data': 'Análisis de Datos',
            'both': 'Ambos (Web + Datos)',
            'consulting': 'Consultoría',
            'automation': 'Automatización'
        };
        return proyectos[value] || value;
    }

    // ====================
    // 10. NOTIFICACIONES
    // ====================

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // ====================
    // 11. BOTÓN DE WHATSAPP ANIMADO
    // ====================

    const whatsappBtn = document.querySelector('.whatsapp-float');

    if (whatsappBtn) {
        // Añadir tooltip en hover
        whatsappBtn.addEventListener('mouseenter', () => {
            const tooltip = whatsappBtn.querySelector('.whatsapp-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateX(-50%) translateY(0)';
            }
        });

        whatsappBtn.addEventListener('mouseleave', () => {
            const tooltip = whatsappBtn.querySelector('.whatsapp-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateX(-50%) translateY(10px)';
            }
        });
    }


    // ====================
    // 13. INICIALIZACIÓN DEL CARRUSEL DE HERRAMIENTAS (Solo about.html)
    // ====================

    function initToolsCarousel() {
        const toolsCarousel = document.getElementById('toolsCarousel');
        if (toolsCarousel) {
            const carousel = new bootstrap.Carousel(toolsCarousel, {
                interval: 3000,
                ride: 'carousel',
                wrap: true,
                pause: 'hover'
            });

            // Añadir efecto de hover a las tarjetas
            const toolCards = document.querySelectorAll('.tool-card');
            toolCards.forEach(card => {
                card.addEventListener('mouseenter', function () {
                    this.style.transform = 'translateY(-15px) scale(1.05)';
                });

                card.addEventListener('mouseleave', function () {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
        }
    }

    // ====================
    // 14. EFECTOS DE HOVER PARA TARJETAS
    // ====================

    function initHoverEffects() {
        // Tarjetas de experiencia (about.html)
        const expCards = document.querySelectorAll('.exp-card');
        expCards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-10px)';
            });

            card.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(0)';
            });
        });

        // Tarjetas de contacto mini (contact.html)
        const contactMiniCards = document.querySelectorAll('.contact-mini-card');
        contactMiniCards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-5px)';
            });

            card.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    // ====================
    // 15. CAMBIO DE TEMA OSCURO/CLARO
    // ====================

    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle ? themeToggle.querySelector('.fa-sun') : null;
    const moonIcon = themeToggle ? themeToggle.querySelector('.fa-moon') : null;

    // Función para aplicar el tema
    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        } else {
            document.body.classList.remove('light-mode');
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        }
    }

    // Verificar preferencia guardada o del sistema
    function initTheme() {
        const savedTheme = localStorage.getItem('datavantex-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            applyTheme(savedTheme);
        } else if (!systemPrefersDark) {
            applyTheme('light');
        } else {
            applyTheme('dark');
        }
    }

    // Cambiar tema al hacer clic
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLightMode = document.body.classList.contains('light-mode');

            if (isLightMode) {
                applyTheme('dark');
                localStorage.setItem('datavantex-theme', 'dark');
            } else {
                applyTheme('light');
                localStorage.setItem('datavantex-theme', 'light');
            }
        });

        // Escuchar cambios en la preferencia del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('datavantex-theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // ====================
    // 16. ANIMACIONES DE ENTRADA PARA NUEVAS SECCIONES
    // ====================

    function initSectionAnimations() {
        // Animación para secciones de experiencia (about.html)
        const expCards = document.querySelectorAll('.exp-card');
        expCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 * index);
        });

        // Animación para FAQ (contact.html)
        const accordionItems = document.querySelectorAll('.accordion-item');
        accordionItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';

            setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 150 * index);
        });
    }

    // ====================
    // 17. EVENT LISTENERS
    // ====================

    window.addEventListener('scroll', () => {
        handleNavbarScroll();
        handleParallax();
        updateActiveNav();
    });

    window.addEventListener('resize', () => {
        const vCanvas = document.getElementById('viscousCanvas');
        const rCanvas = document.getElementById('fluidRevealCanvas');
        if (vCanvas) {
            vCanvas.width = window.innerWidth;
            vCanvas.height = window.innerHeight;
        }
        if (rCanvas) {
            rCanvas.width = window.innerWidth;
            rCanvas.height = window.innerHeight;
        }
    });

    // ====================
    // 18. INICIALIZACIÓN FINAL
    // ====================

    // Fade in inicial
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.8s ease-in';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // Inicializar componentes
    handleNavbarScroll();
    handleParallax();
    updateActiveNav();
    initToolsCarousel();
    initTheme();
    initHoverEffects();
    initSectionAnimations();

    // Inicializar activo en navegación basado en página actual
    function setActiveNavBasedOnPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');

            // Si estamos en la página de inicio
            if (currentPage === 'index.html' || currentPage === '') {
                if (linkHref === 'index.html' || linkHref === '#inicio') {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
            // Si estamos en about.html
            else if (currentPage === 'about.html') {
                if (linkHref === 'about.html') {
                    link.classList.add('active');
                } else if (linkHref.startsWith('#')) {
                    // Para anclas dentro de about.html
                    link.classList.remove('active');
                } else {
                    link.classList.remove('active');
                }
            }
            // Si estamos en contact.html
            else if (currentPage === 'contact.html') {
                if (linkHref === 'contact.html') {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }

    setActiveNavBasedOnPage();
});