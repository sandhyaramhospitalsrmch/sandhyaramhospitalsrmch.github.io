/* global bootstrap, AOS, Swiper */
(function () {
  const $ = window.jQuery;

  function animateNumber(el, target) {
    const duration = 900;
    const start = 0;
    const startTime = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const val = Math.round(start + (target - start) * eased);
      el.textContent = String(val);
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = document.querySelectorAll("[data-hb-counter]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = Number(el.getAttribute("data-hb-target") || 0);
          // Animate only once
          el.removeAttribute("data-hb-counter");
          animateNumber(el, target);
        });
      },
      { threshold: 0.35 }
    );

    counters.forEach((c) => obs.observe(c));
  }

  function initThemeToggle() {
    const btn = document.getElementById("hbThemeBtn");
    if (!btn) return;

    const html = document.documentElement;
    const stored = window.localStorage.getItem("hb-theme");
    if (stored === "dark" || stored === "light") {
      html.setAttribute("data-theme", stored);
    }

    function updateLabel() {
      const isDark = html.getAttribute("data-theme") === "dark";
      const label = btn.querySelector(".hb-theme-label");
      if (!label) return;
      label.textContent = isDark ? "Light Mode" : "Care Mode";
    }

    updateLabel();

    btn.addEventListener("click", () => {
      const isDark = html.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      html.setAttribute("data-theme", next);
      window.localStorage.setItem("hb-theme", next);
      updateLabel();
    });
  }

  function initSmoothScroll() {
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // jQuery-driven smooth scrolling for anchor links.
    $(document).on("click", 'a.nav-link[href^="#"], a.hb-footer-link[href^="#"], a.btn[href^="#"]', function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const header = document.getElementById("site-header");
      const headerOffset = header ? header.offsetHeight + 10 : 80;
      const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  }

  function initActiveNav() {
    const links = Array.from(document.querySelectorAll(".hb-nav .nav-link"));
    if (!links.length) return;

    const sections = links
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length) return;

    const byId = new Map();
    links.forEach((a) => byId.set(a.getAttribute("href"), a));

    const obs = new IntersectionObserver(
      (entries) => {
        // Pick the most visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (!visible) return;
        const id = "#" + visible.target.id;
        links.forEach((a) => a.classList.remove("hb-nav-active"));
        const active = byId.get(id);
        if (active) active.classList.add("hb-nav-active");
      },
      { threshold: [0.2, 0.35, 0.5] }
    );

    sections.forEach((s) => obs.observe(s));
  }

  function initDoctorModal() {
    const modalEl = document.getElementById("hbDoctorModal");
    if (!modalEl) return;

    const $modal = $(modalEl);
    const titleEl = document.getElementById("hbDoctorModalTitle");
    const roleEl = document.getElementById("hbDoctorModalRole");
    const focusEl = document.getElementById("hbDoctorModalFocus");
    const listEl = document.getElementById("hbDoctorModalList");

    $modal.on("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      if (!button) return;

      let doctor = null;
      const raw = button.getAttribute("data-doctor");
      try {
        doctor = raw ? JSON.parse(raw) : null;
      } catch (err) {
        doctor = null;
      }

      if (!doctor) {
        titleEl.textContent = "Doctor Profile";
        roleEl.textContent = "";
        focusEl.textContent = "";
        listEl.innerHTML = "";
        return;
      }

      titleEl.textContent = doctor.name || "Doctor";
      roleEl.textContent = doctor.role || "";
      focusEl.textContent = doctor.focus || "";

      const highlights = Array.isArray(doctor.highlights) ? doctor.highlights : [];
      listEl.innerHTML = "";
      highlights.forEach((h) => {
        const li = document.createElement("li");
        li.textContent = h;
        listEl.appendChild(li);
      });
    });
  }

  function initTestimonials() {
    const el = document.querySelector(".hb-swiper");
    if (!el || !window.Swiper) return;

    // eslint-disable-next-line no-new
    new window.Swiper(el, {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 18,
      autoplay: { delay: 4200, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
    });
  }

  function initContactForm() {
    const form = document.getElementById("hbContactForm");
    if (!form) return;

    const success = document.getElementById("hbFormSuccess");
    const error = document.getElementById("hbFormError");

    // Basic validation using HTML constraints; jQuery to show/hide messages.
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      success.hidden = true;
      error.hidden = true;

      // Trigger browser validation UI where supported.
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        error.hidden = false;
        return;
      }

      // Demo behavior: show success (no server).
      success.hidden = false;
      form.reset();
      form.classList.remove("was-validated");
    });
  }

  function initAOS() {
    if (window.AOS && typeof window.AOS.init === "function") {
      window.AOS.init({ duration: 650, once: true, easing: "ease-out-cubic" });
    }
  }

  function initLaparoscopicInfoPopup() {
    const backdrop = document.getElementById("hbLaparoscopicInfoPopup");
    const trigger = document.getElementById("hbMoreDetailsTrigger");
    const closeBtn = document.getElementById("hbLaparoscopicPopupClose");
    const btnEn = document.getElementById("hbLangEn");
    const btnMl = document.getElementById("hbLangMl");

    if (!backdrop || !trigger || !closeBtn || !btnEn || !btnMl) return;

    const contentEn = backdrop.querySelector('.hb-popup-langcontent[data-lang="en"]');
    const contentMl = backdrop.querySelector('.hb-popup-langcontent[data-lang="ml"]');
    if (!contentEn || !contentMl) return;

    const titleEn = document.getElementById("hbLaparoscopicPopupTitleEn");
    const titleMl = document.getElementById("hbLaparoscopicPopupTitleMl");

    let currentLang = "ml";

    const openHash = "#lapsterilization";

    function setLang(lang) {
      currentLang = lang;
      const isEn = lang === "en";
      contentEn.hidden = !isEn;
      contentMl.hidden = isEn;
      btnEn.setAttribute("aria-pressed", isEn ? "true" : "false");
      btnMl.setAttribute("aria-pressed", !isEn ? "true" : "false");

      if (titleEn && titleMl) {
        titleEn.hidden = !isEn;
        titleMl.hidden = isEn;
      }
    }

    function openPopup() {
      backdrop.hidden = false;
      document.body.classList.add("hb-popup-open");
      setLang(currentLang);
      // Focus close button for accessibility
      closeBtn.focus();
    }

    function closePopup() {
      backdrop.hidden = true;
      document.body.classList.remove("hb-popup-open");
      // Return focus to the trigger
      trigger.focus();
    }

    trigger.addEventListener("click", openPopup);
    closeBtn.addEventListener("click", closePopup);

    // Optional UX: click outside the panel closes the popup
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closePopup();
    });

    btnEn.addEventListener("click", function () {
      setLang("en");
    });
    btnMl.addEventListener("click", function () {
      setLang("ml");
    });

    // Deep link: load page with #lapsterilization to open popup immediately.
    function maybeOpenFromHash() {
      if (window.location.hash === openHash) openPopup();
    }

    maybeOpenFromHash();
    window.addEventListener("hashchange", function () {
      maybeOpenFromHash();
    });

    document.addEventListener("keydown", function (e) {
      if (backdrop.hidden) return;
      if (e.key === "Escape") closePopup();
    });
  }

  // Run initializers
  $(function () {
    initThemeToggle();
    initSmoothScroll();
    initActiveNav();
    initDoctorModal();
    initCounters();
    initTestimonials();
    initContactForm();
    initAOS();
    initLaparoscopicInfoPopup();
  });
})();

