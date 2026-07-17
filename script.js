/* ==========================================================================
   Peek Mee — interactivity
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".nav__burger");
  const menu = document.getElementById("nav-menu");
  const close = document.querySelector(".nav__close");

  function closeMenu() {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }

  if (burger) {
    burger.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    // Close menu when a link or the close button is tapped
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    if (close) close.addEventListener("click", closeMenu);
    // Close on Escape / resize to desktop
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 620) closeMenu(); });
  }

  /* ---------- Showreel: click-to-play YouTube embed ---------- */
  const showreel = document.querySelector(".showreel");
  if (showreel) {
    // Accept a raw ID or any YouTube URL in data-video-id.
    function youTubeId(raw) {
      if (!raw) return "";
      raw = raw.trim();
      if (/^[\w-]{11}$/.test(raw)) return raw; // already an ID
      const m = raw.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);
      return m ? m[1] : "";
    }

    const videoId = youTubeId(showreel.dataset.videoId);

    // Use the real video thumbnail as the poster.
    if (videoId) {
      showreel.style.backgroundImage = "url(https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg)";
      // Upgrade to high-res poster when it exists (YouTube returns a 120px stub if not).
      const hi = new Image();
      hi.onload = function () {
        if (hi.naturalWidth > 120) {
          showreel.style.backgroundImage = "url(https://i.ytimg.com/vi/" + videoId + "/maxresdefault.jpg)";
        }
      };
      hi.src = "https://i.ytimg.com/vi/" + videoId + "/maxresdefault.jpg";
    }

    showreel.addEventListener("click", function play() {
      if (showreel.classList.contains("playing")) return;
      if (!videoId) {
        console.info("Showreel: set data-video-id on .showreel to embed a video.");
        return;
      }
      const iframe = document.createElement("iframe");
      iframe.src =
        "https://www.youtube-nocookie.com/embed/" + videoId +
        "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      iframe.title = "Peek Mee showreel";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      showreel.appendChild(iframe);
      showreel.classList.add("playing");
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
      status.classList.remove("ok", "error");

      let ok = true;
      form.querySelectorAll("input, textarea").forEach((el) => {
        if (!validateField(el)) ok = false;
      });

      if (!ok) {
        const firstBad = form.querySelector(".invalid");
        if (firstBad) firstBad.focus();
        return;
      }

      // Send via FormSubmit.co, which forwards the message to the studio inbox.
      // NOTE: the first-ever submission triggers a one-time activation email
      // to this address — it must be clicked before messages are delivered.
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Sending…";
      status.classList.remove("error");

      fetch("https://formsubmit.co/ajax/59bbfe290866842f69a0969fa08bc8a5", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.querySelector("#f-name").value.trim(),
          email: form.querySelector("#f-email").value.trim(),
          message: form.querySelector("#f-message").value.trim(),
          _subject: "New message from the Peek Mee website",
          _template: "table",
          _captcha: "false",
        }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function () {
          form.reset();
          status.textContent = "Thanks! Your message has been sent. We'll be in touch soon.";
          status.classList.add("ok");
        })
        .catch(function () {
          status.textContent = "Sorry, something went wrong sending your message. Please try again, or email us at contact@peekmee.com.";
          status.classList.add("error");
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = "Submit";
        });
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

  const hero = document.querySelector(".hero");

  if ("IntersectionObserver" in window && sections.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          Object.values(linkFor).forEach((a) => a.classList.remove("active"));
          // No link highlighted while the hero is on screen
          if (entry.target === hero) return;
          const a = linkFor[entry.target.id];
          if (a) a.classList.add("active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
    if (hero) obs.observe(hero);
  }
})();
