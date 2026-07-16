/* ==========================================================================
   Peek Mee — interactivity
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".nav__burger");
  const menu = document.getElementById("nav-menu");

  function closeMenu() {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }

  if (burger) {
    burger.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    // Close menu when a link is tapped
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    // Close on Escape / resize to desktop
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 620) closeMenu(); });
  }

  /* ---------- Showreel play ---------- */
  const showreel = document.querySelector(".showreel");
  if (showreel) {
    showreel.addEventListener("click", function () {
      // Placeholder: no video source in the design. Signal intent gracefully.
      showreel.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0.98)" }, { transform: "scale(1)" }],
        { duration: 220, easing: "ease-out" }
      );
      console.info("Showreel play clicked — hook up a video source here.");
    });
  }

  /* ---------- Contact form validation ---------- */
  const form = document.querySelector(".contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const rules = {
      "f-name": (v) => (v.trim() ? "" : "Please enter your name."),
      "f-email": (v) =>
        !v.trim() ? "Please enter your email." : emailRe.test(v.trim()) ? "" : "Please enter a valid email.",
      "f-message": (v) => (v.trim().length >= 5 ? "" : "Please write a short message (5+ characters)."),
    };

    function validateField(el) {
      const rule = rules[el.id];
      if (!rule) return true;
      const msg = rule(el.value);
      const errEl = form.querySelector('.field__error[data-for="' + el.id + '"]');
      if (errEl) errEl.textContent = msg;
      el.classList.toggle("invalid", Boolean(msg));
      return !msg;
    }

    // Live-clear errors as the user fixes them
    form.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("blur", () => validateField(el));
      el.addEventListener("input", () => {
        if (el.classList.contains("invalid")) validateField(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      status.classList.remove("ok");

      let ok = true;
      form.querySelectorAll("input, textarea").forEach((el) => {
        if (!validateField(el)) ok = false;
      });

      if (!ok) {
        const firstBad = form.querySelector(".invalid");
        if (firstBad) firstBad.focus();
        return;
      }

      // No backend in this static build — simulate a successful send.
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Sending…";
      setTimeout(function () {
        form.reset();
        btn.disabled = false;
        btn.textContent = "Submit";
        status.textContent = "Thanks! Your message has been sent. We'll be in touch soon.";
        status.classList.add("ok");
      }, 700);
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = ["games", "services", "about", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const linkFor = {};
  document.querySelectorAll(".nav__link").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && href.startsWith("#")) linkFor[href.slice(1)] = a;
  });

  if ("IntersectionObserver" in window && sections.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            Object.values(linkFor).forEach((a) => a.classList.remove("active"));
            const a = linkFor[entry.target.id];
            if (a) a.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
  }
})();
