(function () {
    "use strict";

    var MOBILE_BREAKPOINT = 860;

    var header = document.getElementById("header");
    var navToggle = document.getElementById("nav-toggle");
    var navMenu = document.getElementById("nav-menu");
    var navBackdrop = document.getElementById("nav-backdrop");
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
    var backToTop = document.getElementById("back-to-top");
    var currentYear = document.getElementById("current-year");

    /* ---------- Menu mobile ---------- */

    function isMenuOpen() {
        return navToggle.getAttribute("aria-expanded") === "true";
    }

    function openMenu() {
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.setAttribute("aria-label", "Fechar menu");
        navMenu.classList.add("is-open");
        navBackdrop.hidden = false;
        document.body.classList.add("no-scroll");

        // No próximo quadro, para que a transição do fundo aconteça após remover o "hidden".
        // O foco permanece no botão do menu; o próximo Tab leva ao primeiro link.
        requestAnimationFrame(function () {
            navBackdrop.classList.add("is-visible");
        });
    }

    function closeMenu(returnFocus) {
        if (!isMenuOpen()) {
            return;
        }
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Abrir menu");
        navMenu.classList.remove("is-open");
        navBackdrop.classList.remove("is-visible");
        document.body.classList.remove("no-scroll");

        window.setTimeout(function () {
            if (!isMenuOpen()) {
                navBackdrop.hidden = true;
            }
        }, 300);

        if (returnFocus) {
            navToggle.focus();
        }
    }

    navToggle.addEventListener("click", function () {
        if (isMenuOpen()) {
            closeMenu(false);
        } else {
            openMenu();
        }
    });

    navBackdrop.addEventListener("click", function () {
        closeMenu(false);
    });

    // Fecha o menu ao escolher um link.
    navMenu.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
            closeMenu(false);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && isMenuOpen()) {
            closeMenu(true);
        }
    });

    // Se a janela for ampliada para desktop com o menu aberto, fecha o menu.
    window.addEventListener("resize", function () {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            closeMenu(false);
        }
    });

    /* ---------- Header e botão "voltar ao topo" ---------- */

    var ticking = false;

    function updateOnScroll() {
        var scrollY = window.scrollY || window.pageYOffset;
        header.classList.toggle("is-scrolled", scrollY > 10);
        backToTop.classList.toggle("is-visible", scrollY > 600);
        ticking = false;
    }

    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    }, { passive: true });

    updateOnScroll();

    backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* ---------- Link ativo conforme a seção visível ---------- */

    var sections = navLinks
        .map(function (link) {
            return document.querySelector(link.getAttribute("href"));
        })
        .filter(Boolean);

    function setActiveLink(id) {
        navLinks.forEach(function (link) {
            var isActive = link.getAttribute("href") === "#" + id;
            link.classList.toggle("is-active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function updateActiveSection() {
        var offset = header.offsetHeight + window.innerHeight * 0.3;
        var position = (window.scrollY || window.pageYOffset) + offset;
        var currentId = sections.length ? sections[0].id : "";

        sections.forEach(function (section) {
            if (section.offsetTop <= position) {
                currentId = section.id;
            }
        });

        // No final da página, ativa a última seção.
        var atBottom = window.innerHeight + (window.scrollY || window.pageYOffset)
            >= document.documentElement.scrollHeight - 2;
        if (atBottom && sections.length) {
            currentId = sections[sections.length - 1].id;
        }

        setActiveLink(currentId);
    }

    var sectionTicking = false;
    window.addEventListener("scroll", function () {
        if (!sectionTicking) {
            window.requestAnimationFrame(function () {
                updateActiveSection();
                sectionTicking = false;
            });
            sectionTicking = true;
        }
    }, { passive: true });

    window.addEventListener("resize", updateActiveSection);
    updateActiveSection();

    /* ---------- Animações de entrada ---------- */

    var revealElements = document.querySelectorAll(".reveal");

    // Pequeno atraso escalonado entre elementos irmãos (ex.: cards em grade).
    Array.prototype.forEach.call(revealElements, function (element) {
        var siblings = Array.prototype.filter.call(element.parentElement.children, function (child) {
            return child.classList.contains("reveal");
        });
        var index = siblings.indexOf(element);
        if (index > 0) {
            element.style.setProperty("--reveal-delay", Math.min(index * 0.08, 0.4) + "s");
        }
    });

    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        Array.prototype.forEach.call(revealElements, function (element) {
            observer.observe(element);
        });
    } else {
        // Navegadores antigos: exibe tudo imediatamente.
        Array.prototype.forEach.call(revealElements, function (element) {
            element.classList.add("is-visible");
        });
    }

    /* ---------- Ano atual no rodapé ---------- */

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
})();
