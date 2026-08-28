(function () {
  "use strict";

  const select = (el, all = false) => {
    el = el.trim();
    return all ? [...document.querySelectorAll(el)] : document.querySelector(el);
  };

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach((e) => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  const onscroll = (el, listener) => el.addEventListener("scroll", listener);

  const scrollto = (el) => {
    let header = select("#header");
    let offset = header ? header.offsetHeight : 0;
    let target = select(el);
    if (!target) return;
    window.scrollTo({ top: target.offsetTop - offset, behavior: "smooth" });
  };

  /* Header muda de aparência ao rolar a página */
  let selectHeader = select("#header");
  if (selectHeader) {
    const headerScrolled = () => {
      window.scrollY > 60
        ? selectHeader.classList.add("header-scrolled")
        : selectHeader.classList.remove("header-scrolled");
    };
    window.addEventListener("load", headerScrolled);
    onscroll(document, headerScrolled);
  }

  /* Botão voltar ao topo */
  let backtotop = select(".back-to-top");
  if (backtotop) {
    const toggleBacktotop = () => {
      window.scrollY > 100 ? backtotop.classList.add("active") : backtotop.classList.remove("active");
    };
    window.addEventListener("load", toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /* Menu mobile (hambúrguer) */
  on("click", ".mobile-nav-toggle", function () {
    select("#navbar").classList.toggle("navbar-mobile");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
  });

  /* Rolagem suave para âncoras internas, com fechamento do menu mobile */
  on(
    "click",
    ".scrollto",
    function (e) {
      if (select(this.hash)) {
        e.preventDefault();
        let navbar = select("#navbar");
        if (navbar && navbar.classList.contains("navbar-mobile")) {
          navbar.classList.remove("navbar-mobile");
          let navbarToggle = select(".mobile-nav-toggle");
          navbarToggle.classList.toggle("bi-list");
          navbarToggle.classList.toggle("bi-x");
        }
        scrollto(this.hash);
      }
    },
    true
  );

  window.addEventListener("load", () => {
    if (window.location.hash && select(window.location.hash)) scrollto(window.location.hash);
  });

  /* Reveal on scroll (elementos .rd-reveal) */
  (function () {
    let targets = select(".rd-reveal", true);
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("rd-in-view"));
      return;
    }
    let obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("rd-in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((el) => obs.observe(el));
  })();

  /* Lightbox da galeria */
  let rdLightbox = null;
  if (window.GLightbox) {
    rdLightbox = GLightbox({ selector: ".glightbox" });
  }

  /* Modal "Ver todas as fotos": grade com miniaturas de todas as fotos.
     Ao clicar numa miniatura, fecha a grade e abre o lightbox nessa foto. */
  (function () {
    const openBtn = document.getElementById("rd-open-gallery-modal");
    const modal = document.getElementById("rd-gallery-modal");
    if (!openBtn || !modal) return;

    const grid = document.getElementById("rd-gallery-modal-grid");
    const allPhotos = document.querySelectorAll(
      ".rd-gallery-grid .glightbox, .rd-gallery-more .glightbox"
    );

    allPhotos.forEach((link, index) => {
      const img = link.querySelector("img");
      if (!img) return;
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "rd-gallery-modal__thumb";
      thumb.innerHTML = `<img src="${img.src}" alt="${img.alt || ""}">`;
      thumb.addEventListener("click", () => {
        closeModal();
        if (rdLightbox) rdLightbox.openAt(index);
      });
      grid.appendChild(thumb);
    });

    function openModal() {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    openBtn.addEventListener("click", openModal);
    modal.querySelectorAll("[data-rd-gallery-close]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  })();

  /* ============================================================
     WHATSAPP — controlado por window.RD_CONFIG (assets/js/rd-config.js)
     ============================================================ */
  const cfg = window.RD_CONFIG || {};
  const hasWhatsapp = !!(cfg.whatsappNumber && cfg.whatsappNumber.trim());

  function whatsappUrl(message) {
    const text = message || cfg.whatsappMessage || "";
    return "https://wa.me/" + cfg.whatsappNumber.trim() + "?text=" + encodeURIComponent(text);
  }

  /* Botões marcados com [data-rd-whatsapp]: quando o número ainda não
     foi configurado, eles levam até o formulário de contato. */
  select("[data-rd-whatsapp]", true).forEach((btn) => {
    if (hasWhatsapp) {
      btn.setAttribute("href", whatsappUrl(btn.getAttribute("data-rd-message")));
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener");
    } else {
      btn.setAttribute("href", "#contato");
      btn.classList.add("scrollto");
    }
  });

  /* Botão flutuante do WhatsApp: some enquanto o número não é configurado */
  const floatBtn = select("#rd-whatsapp-float");
  if (floatBtn) {
    if (hasWhatsapp) {
      floatBtn.setAttribute("href", whatsappUrl());
      floatBtn.setAttribute("target", "_blank");
      floatBtn.setAttribute("rel", "noopener");
    } else {
      floatBtn.style.display = "none";
    }
  }

  /* Formulário de contato -> gera mensagem para o WhatsApp */
  const form = select("#rd-contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = select("#rd-name").value.trim();
      const phone = select("#rd-phone").value.trim();
      const message = select("#rd-message").value.trim();

      const text =
        "Olá! Meu nome é " + name + ".\n" +
        "Telefone: " + phone + "\n" +
        "Mensagem: " + message;

      const feedback = select("#rd-form-feedback");

      if (hasWhatsapp) {
        window.open(whatsappUrl(text), "_blank");
        if (feedback) {
          feedback.textContent = "Abrindo o WhatsApp para enviar sua mensagem...";
          feedback.style.display = "block";
        }
      } else if (feedback) {
        feedback.textContent =
          "O envio direto pelo WhatsApp ainda será ativado. Por enquanto, anote os dados de contato acima para falar com a RD Calhas e Rufos.";
        feedback.style.display = "block";
      }
    });
  }
})();
