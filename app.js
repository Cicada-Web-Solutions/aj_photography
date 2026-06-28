(() => {
  "use strict";

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealFallback() {
    const loader = qs(".preloader");
    if (loader) loader.style.display = "none";
    qsa(".gallery-item__mask").forEach((item) => {
      item.style.clipPath = "inset(0 0 0% 0)";
    });
  }

  if (!window.gsap || !window.ScrollTrigger || !window.SplitType) {
    revealFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  let lenis;
  if (window.Lenis && !reducedMotion) {
    lenis = new Lenis({
      duration: 1.15,
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.88,
      touchMultiplier: 1.25
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function splitText() {
    qsa("[data-split-title], .split-heading").forEach((element) => {
      new SplitType(element, { types: "lines, words", lineClass: "line" });
    });
    if (qs(".about-copy")) {
      new SplitType(".about-copy", { types: "words" });
    }
  }

  function introAnimation() {
    const preloader = qs(".preloader");
    const title = qs(".hero__title");
    const titleWords = title ? qsa(".word", title) : [];
    const nav = qs(".nav");

    if (title && titleWords.length) {
      gsap.set(titleWords, { yPercent: 115, rotate: 2 });
    }
    if (nav) {
      gsap.set(nav, { y: -100, opacity: 0 });
    }
    gsap.set(qsa(".hero__eyebrow, .hero__footer, .hero-wheel, .hero__scroll"), { opacity: 0 });

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (preloader) {
      timeline
        .to(".preloader__line i", { xPercent: 0, duration: 0.75, ease: "power2.inOut" })
        .to(".preloader__monogram", { y: -15, opacity: 0, duration: 0.45 }, "+=0.12")
        .to(".preloader p", { opacity: 0, duration: 0.3 }, "<")
        .to(".preloader", { yPercent: -100, duration: 1.05, ease: "power4.inOut" }, "-=0.15");
    }
    if (nav) {
      timeline.to(nav, { y: 0, opacity: 1, duration: 0.85 }, preloader ? "-=0.45" : undefined);
    }
    if (title && titleWords.length) {
      timeline.to(titleWords, { yPercent: 0, rotate: 0, duration: 1.15, stagger: 0.045 }, "-=0.62");
    }
    timeline
      .to(qsa(".hero__eyebrow"), { opacity: 1, duration: 0.65 }, "-=0.9")
      .fromTo(qsa(".hero__orb"), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2 }, "-=0.9")
      .to(qsa(".hero-wheel"), { opacity: 1, duration: 1 }, "-=1.05")
      .to(qsa(".hero__footer, .hero__scroll"), { opacity: 1, duration: 0.8 }, "-=0.55");
      
    if (preloader) {
      timeline.set(preloader, { display: "none" });
    }
  }

  function heroStory() {
    gsap.set(".wheel-card", { opacity: 1 });
  }

  function textReveals() {
    if (qs(".about__statement")) {
      gsap.fromTo(".about-copy .word", {
        color: "#777168"
      }, {
        color: "#f5f1e9",
        stagger: 0.075,
        ease: "none",
        scrollTrigger: {
          trigger: ".about__statement",
          start: "top 72%",
          end: "bottom 42%",
          scrub: true
        }
      });
    }

    qsa(".split-heading").forEach((heading) => {
      const words = qsa(".word", heading);
      if (!words.length) return;
      gsap.from(words, {
        yPercent: 115,
        rotate: 1.5,
        duration: 1.05,
        stagger: 0.035,
        ease: "power4.out",
        scrollTrigger: {
          trigger: heading,
          start: "top 86%",
          toggleActions: "play none none reverse"
        }
      });
    });
  }

  function serviceMotion() {
    const cards = qsa(".service-card");
    if (!cards.length) return;
    const hoverMedia = qs(".services__hover-media");
    const hoverImg = hoverMedia ? qs("img", hoverMedia) : null;
    const cursor = qs(".cursor");

    gsap.from(cards, {
      y: 75,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".service-grid",
        start: "top 82%"
      }
    });

    if (window.matchMedia("(pointer: coarse)").matches) return;

    gsap.set(hoverMedia, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(hoverMedia, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(hoverMedia, "y", { duration: 0.45, ease: "power3.out" });

    cards.forEach((card) => {
      const originalImg = qs("img", card);

      card.addEventListener("mouseenter", () => {
        if (originalImg && hoverImg) {
          hoverImg.src = originalImg.getAttribute("src") || "";
          hoverImg.alt = originalImg.getAttribute("alt") || "";
        }
        gsap.to(hoverMedia, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
        if (cursor) {
          cursor.classList.add("is-expanded");
          qs("span", cursor).textContent = "Explore";
        }
      });

      card.addEventListener("mousemove", (event) => {
        xTo(event.clientX);
        yTo(event.clientY);
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(hoverMedia, { opacity: 0, scale: 0.85, duration: 0.3, ease: "power3.out", overwrite: "auto" });
        if (cursor) {
          cursor.classList.remove("is-expanded");
        }
      });
    });
  }

  function galleryMotion() {
    qsa(".portfolio .gallery-item").forEach((item) => {
      const mask = qs(".gallery-item__mask", item);
      const image = qs("img", item);
      const caption = qs("figcaption", item);
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          toggleActions: "play none none reverse"
        }
      });
      timeline
        .to(mask, { clipPath: "inset(0 0 0% 0)", duration: 1.25, ease: "power4.inOut" })
        .to(image, { scale: 1, filter: "blur(0px)", duration: 1.4, ease: "power3.out" }, "-=0.9")
        .from(caption, { y: 18, opacity: 0, duration: 0.65 }, "-=0.65");

      gsap.to(image, {
        yPercent: 7,
        ease: "none",
        scrollTrigger: {
          trigger: item,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }

  function cinematicStory() {
    const section = qs(".cinematic");
    const track = qs(".cinematic__track");
    const panels = qsa(".film-panel");

    const horizontal = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    panels.slice(1, -1).forEach((panel) => {
      const image = qs("img", panel);
      const copy = qs(".film-panel__copy", panel);
      gsap.fromTo(image, { xPercent: -8 }, {
        xPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: panel,
          containerAnimation: horizontal,
          start: "left right",
          end: "right left",
          scrub: true
        }
      });
      gsap.from(copy, {
        x: 100,
        opacity: 0,
        scrollTrigger: {
          trigger: panel,
          containerAnimation: horizontal,
          start: "left 70%",
          end: "left 35%",
          scrub: true
        }
      });
    });
  }

  function memoryMotion() {
    const stage = qs(".memory-stage");
    const photos = qsa(".memory-photo");
    const rotations = [-7, 3, 8];

    photos.forEach((photo, index) => {
      gsap.from(photo, {
        y: 150 + index * 35,
        rotation: rotations[index] + (index - 1) * 10,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: stage,
          start: `top ${88 - index * 7}%`
        }
      });
      gsap.to(photo, {
        y: index % 2 ? -95 : -55,
        ease: "none",
        scrollTrigger: {
          trigger: stage,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });
    });

    gsap.to(".memory-ring--one", {
      rotation: 65,
      scale: 1.07,
      ease: "none",
      scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true }
    });
    gsap.to(".memory-ring--two", {
      rotation: -85,
      ease: "none",
      scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true }
    });

    if (!window.matchMedia("(pointer: coarse)").matches) {
      stage.addEventListener("mousemove", (event) => {
        const rect = stage.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        photos.forEach((photo) => {
          const depth = Number(photo.dataset.depth || 0.5);
          gsap.to(photo, { x: px * 55 * depth, y: py * 35 * depth, duration: 1, ease: "power3.out", overwrite: "auto" });
        });
      });
    }
  }

  function testimonialMotion() {
    const stage = qs(".testimonial-stage");
    const cards = qsa(".quote-card");
    if (!stage || !cards.length) return;
    gsap.from(cards, {
      y: 130,
      opacity: 0,
      rotation: 0,
      duration: 1.15,
      stagger: 0.14,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".testimonial-stage",
        start: "top 82%"
      }
    });

    cards.forEach((card, index) => {
      gsap.to(card, {
        y: index === 1 ? -55 : -90,
        ease: "none",
        scrollTrigger: {
          trigger: ".testimonials",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4
        }
      });
    });
  }

  function footerMotion() {
    // Wordmark AJ Photography remains static as requested.
  }

  function navigation() {
    const nav = qs(".nav");
    const menuButton = qs(".nav__menu");
    const menu = qs(".mobile-menu");
    if (!nav || !menuButton || !menu) return;

    qsa(".dark-section").forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 55px",
        end: "bottom 55px",
        onEnter: () => nav.classList.add("is-dark"),
        onEnterBack: () => nav.classList.add("is-dark"),
        onLeave: () => nav.classList.remove("is-dark"),
        onLeaveBack: () => nav.classList.remove("is-dark")
      });
    });

    const cinematicTrack = qs(".cinematic__track");
    if (qs(".cinematic") && cinematicTrack) {
      ScrollTrigger.create({
        trigger: ".cinematic",
        start: "top top",
        end: () => `+=${Math.max(1, cinematicTrack.scrollWidth - window.innerWidth)}`,
        onEnter: () => gsap.to(nav, { autoAlpha: 0, y: -25, duration: 0.25, overwrite: "auto" }),
        onEnterBack: () => gsap.to(nav, { autoAlpha: 0, y: -25, duration: 0.25, overwrite: "auto" }),
        onLeave: () => gsap.to(nav, { autoAlpha: 1, y: 0, duration: 0.35, overwrite: "auto" }),
        onLeaveBack: () => gsap.to(nav, { autoAlpha: 1, y: 0, duration: 0.35, overwrite: "auto" }),
        invalidateOnRefresh: true
      });
    }

    menuButton.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      gsap.to(menu, { autoAlpha: open ? 1 : 0, duration: 0.5, ease: "power3.inOut" });
      if (lenis) open ? lenis.stop() : lenis.start();
    });

    qsa('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = qs(link.getAttribute("href"));
        if (!target) return;
        if (document.body.classList.contains("menu-open")) {
          document.body.classList.remove("menu-open");
          menuButton.setAttribute("aria-expanded", "false");
          menu.setAttribute("aria-hidden", "true");
          gsap.set(menu, { autoAlpha: 0 });
          if (lenis) lenis.start();
        }
        if (lenis) {
          event.preventDefault();
          lenis.scrollTo(target, { offset: 0, duration: 1.4 });
        }
      });
    });
  }

  function pointerInteractions() {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = qs(".cursor");
    const cursorText = qs("span", cursor);
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.22, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.22, ease: "power3.out" });

    window.addEventListener("mousemove", (event) => {
      xTo(event.clientX);
      yTo(event.clientY);
    });

    // Expand cursor with label for interactive gallery elements
    qsa("[data-cursor]").forEach((element) => {
      if (element.classList.contains("service-card")) return;

      element.addEventListener("mouseenter", () => {
        cursorText.textContent = element.dataset.cursor || "";
        cursor.classList.add("is-expanded");
      });
      element.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-expanded");
      });
    });

    // Morph cursor on standard links, actions and inputs
    qsa("a, button, select, input, textarea, .nav__cta").forEach((element) => {
      if (element.hasAttribute("data-cursor") || element.closest("[data-cursor]")) return;

      element.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hovered");
      });
      element.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hovered");
      });
    });

    qsa(".magnetic").forEach((element) => {
      element.addEventListener("mousemove", (event) => {
        const rect = element.getBoundingClientRect();
        gsap.to(element, {
          x: (event.clientX - rect.left - rect.width / 2) * 0.22,
          y: (event.clientY - rect.top - rect.height / 2) * 0.22,
          duration: 0.55,
          ease: "power3.out"
        });
      });
      element.addEventListener("mouseleave", () => {
        gsap.to(element, { x: 0, y: 0, duration: 0.75, ease: "elastic.out(1, .45)" });
      });
    });
  }

  function formInteraction() {
    const form = qs(".contact-form");
    const success = qs(".form-success");
    if (!form || !success) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      gsap.to(success, { height: "auto", opacity: 1, marginTop: 16, duration: 0.5 });
    });
  }

  function init() {
    splitText();
    navigation();
    pointerInteractions();
    formInteraction();

    if (reducedMotion) {
      revealFallback();
      return;
    }

    heroStory();
    introAnimation();
    textReveals();
    serviceMotion();
    galleryMotion();
    cinematicStory();
    memoryMotion();
    testimonialMotion();
    footerMotion();

    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  window.addEventListener("load", init, { once: true });
})();
