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
    // 3. EFECTO DE FLUIDO VISCOSO EN EL CURSOR
    // ====================
    
    const viscousCanvas = document.getElementById('viscousCanvas');
    const cursorGlow = document.querySelector('.cursor-glow');
    
    if (viscousCanvas && cursorGlow) {
        const ctx = viscousCanvas.getContext('2d');
        viscousCanvas.width = window.innerWidth;
        viscousCanvas.height = window.innerHeight;
        
        let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let particles = [];
        const particleCount = 80;
        const viscosity = 0.95;
        const attraction = 0.08;
        const repulsion = 0.3;
        const colorStops = [
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(6, 182, 212, 0.6)'
        ];
        
        class ViscousParticle {
            constructor() {
                this.x = Math.random() * viscousCanvas.width;
                this.y = Math.random() * viscousCanvas.height;
                this.vx = 0;
                this.vy = 0;
                this.radius = Math.random() * 4 + 2;
                this.color = colorStops[Math.floor(Math.random() * colorStops.length)];
                this.trail = [];
                this.maxTrail = 8;
                this.opacity = 1;
            }
            
            update() {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    if (distance < 30) {
                        const force = (30 - distance) / 30 * repulsion;
                        this.vx -= dx * force;
                        this.vy -= dy * force;
                    } else {
                        const force = (1 - distance / 150) * attraction;
                        this.vx += dx * force;
                        this.vy += dy * force;
                    }
                }
                
                this.vx *= viscosity;
                this.vy *= viscosity;
                
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > viscousCanvas.width) this.vx *= -0.8;
                if (this.y < 0 || this.y > viscousCanvas.height) this.vy *= -0.8;
                
                this.x = Math.max(0, Math.min(viscousCanvas.width, this.x));
                this.y = Math.max(0, Math.min(viscousCanvas.height, this.y));
                
                this.trail.push({ x: this.x, y: this.y });
                if (this.trail.length > this.maxTrail) {
                    this.trail.shift();
                }
            }
            
            draw() {
                for (let i = 0; i < this.trail.length; i++) {
                    const point = this.trail[i];
                    const opacity = i / this.trail.length * 0.6;
                    const radius = this.radius * (i / this.trail.length);
                    
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
                    ctx.fillStyle = this.color.replace(/[\d\.]+\)$/g, `${opacity})`);
                    ctx.fill();
                    
                    if (i > 0) {
                        const prevPoint = this.trail[i - 1];
                        ctx.beginPath();
                        ctx.moveTo(prevPoint.x, prevPoint.y);
                        ctx.lineTo(point.x, point.y);
                        ctx.strokeStyle = this.color.replace(/[\d\.]+\)$/g, `${opacity * 0.5})`);
                        ctx.lineWidth = radius * 1.5;
                        ctx.stroke();
                    }
                }
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius * 2
                );
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, '0)'));
                
                ctx.fillStyle = gradient;
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fill();
            }
        }
        
        function initViscousParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new ViscousParticle());
            }
        }
        
        function animateViscousFluid() {
            ctx.clearRect(0, 0, viscousCanvas.width, viscousCanvas.height);
            
            ctx.fillStyle = 'rgba(15, 23, 42, 0.02)';
            ctx.fillRect(0, 0, viscousCanvas.width, viscousCanvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
                
                particles.forEach(otherParticle => {
                    if (particle !== otherParticle) {
                        const dx = particle.x - otherParticle.x;
                        const dy = particle.y - otherParticle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 80) {
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(otherParticle.x, otherParticle.y);
                            ctx.strokeStyle = particle.color.replace(/[\d\.]+\)$/g, `${0.1 * (1 - distance/80)})`);
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                });
            });
            
            cursorGlow.style.left = `${mouse.x}px`;
            cursorGlow.style.top = `${mouse.y}px`;
            
            requestAnimationFrame(animateViscousFluid);
        }
        
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        
        window.addEventListener('resize', () => {
            viscousCanvas.width = window.innerWidth;
            viscousCanvas.height = window.innerHeight;
            initViscousParticles();
        });
        
        initViscousParticles();
        animateViscousFluid();
    }
    
    // ====================
    // 4. VIDEO DEL HERO CON CONTROLES (Solo index.html)
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
    // 5. EFECTO DE REVELACIÓN EN EL HERO (Solo index.html)
    // ====================
    
    const revealCanvas = document.getElementById('fluidRevealCanvas');
    const revealLayer = document.getElementById('revealLayer');
    const revealImage = document.getElementById('revealImage');
    
    if (revealCanvas && revealLayer && revealImage) {
        const revealCtx = revealCanvas.getContext('2d');
        revealCanvas.width = window.innerWidth;
        revealCanvas.height = window.innerHeight;
        
        let isMouseInHero = false;
        let revealMouse = { x: 0, y: 0 };
        let revealParticles = [];
        const revealParticleCount = 50;
        const revealRadius = 120;
        
        class RevealParticle {
            constructor() {
                this.x = revealMouse.x;
                this.y = revealMouse.y;
                this.vx = (Math.random() - 0.5) * 4;
                this.vy = (Math.random() - 0.5) * 4;
                this.radius = Math.random() * 10 + 5;
                this.life = 1;
                this.decay = Math.random() * 0.02 + 0.01;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= this.decay;
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.radius *= 0.99;
                
                return this.life > 0;
            }
            
            draw() {
                revealCtx.beginPath();
                revealCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                
                const gradient = revealCtx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                revealCtx.fillStyle = gradient;
                revealCtx.fill();
            }
        }
        
        function drawRevealEffect() {
            revealCtx.clearRect(0, 0, revealCanvas.width, revealCanvas.height);
            
            if (isMouseInHero) {
                for (let i = 0; i < 3; i++) {
                    revealParticles.push(new RevealParticle());
                }
                
                const gradient = revealCtx.createRadialGradient(
                    revealMouse.x, revealMouse.y, 0,
                    revealMouse.x, revealMouse.y, revealRadius
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                revealCtx.beginPath();
                revealCtx.arc(revealMouse.x, revealMouse.y, revealRadius, 0, Math.PI * 2);
                revealCtx.fillStyle = gradient;
                revealCtx.fill();
                
                revealImage.style.opacity = '1';
                
                const maskCanvas = document.createElement('canvas');
                maskCanvas.width = revealCanvas.width;
                maskCanvas.height = revealCanvas.height;
                const maskCtx = maskCanvas.getContext('2d');
                
                maskCtx.beginPath();
                maskCtx.arc(revealMouse.x, revealMouse.y, revealRadius, 0, Math.PI * 2);
                maskCtx.fillStyle = 'white';
                maskCtx.fill();
                
                revealParticles.forEach(particle => {
                    maskCtx.beginPath();
                    maskCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                    maskCtx.fillStyle = 'white';
                    maskCtx.fill();
                });
                
                maskCtx.filter = 'blur(15px)';
                maskCtx.drawImage(maskCanvas, 0, 0);
                
                revealImage.style.webkitMaskImage = `url(${maskCanvas.toDataURL()})`;
                revealImage.style.maskImage = `url(${maskCanvas.toDataURL()})`;
            } else {
                revealImage.style.opacity = '0';
            }
            
            revealParticles = revealParticles.filter(particle => {
                particle.update();
                particle.draw();
                return particle.life > 0;
            });
            
            requestAnimationFrame(drawRevealEffect);
        }
        
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                isMouseInHero = true;
            });
            
            heroSection.addEventListener('mouseleave', () => {
                isMouseInHero = false;
            });
            
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                revealMouse.x = e.clientX - rect.left;
                revealMouse.y = e.clientY - rect.top;
            });
        }
        
        window.addEventListener('resize', () => {
            revealCanvas.width = window.innerWidth;
            revealCanvas.height = window.innerHeight;
        });
        
        drawRevealEffect();
    }
    
    // ====================
    // 6. CONTADORES ANIMADOS (Solo index.html)
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
    // 12. PARTÍCULAS DEL HERO (Solo index.html)
    // ====================
    
    const particles = document.querySelectorAll('.particle');
    if (particles.length > 0) {
        particles.forEach((particle, index) => {
            particle.style.animationDelay = `${index * 3}s`;
            
            // Posiciones aleatorias
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
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
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-15px) scale(1.05)';
                });
                
                card.addEventListener('mouseleave', function() {
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
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
        
        // Tarjetas de contacto mini (contact.html)
        const contactMiniCards = document.querySelectorAll('.contact-mini-card');
        contactMiniCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
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
        if (viscousCanvas) {
            viscousCanvas.width = window.innerWidth;
            viscousCanvas.height = window.innerHeight;
        }
        if (revealCanvas) {
            revealCanvas.width = window.innerWidth;
            revealCanvas.height = window.innerHeight;
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