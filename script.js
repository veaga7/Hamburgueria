/* ==========================================================================
   Burger House — script.js
   JavaScript nativo, sem dependências. Seções:
   1. Configuração (edite aqui)   2. Produtos (edite aqui)   3. Utilitários
   4. Carrinho (estado)           5. Interface: menu, cardápio, pedido, avisos
   6. Contato                     7. Rolagem e efeitos       8. Inicialização
   ========================================================================== */
(() => {
  "use strict";

  /* ------------------------------------------------------------------------
     1. CONFIGURAÇÃO
     Campos vazios não aparecem no site. Nenhum dado abaixo é verificado:
     substitua pelos dados reais da hamburgueria.
     ------------------------------------------------------------------------ */
  const CONFIG = {
    // WhatsApp com DDI + DDD, só dígitos. Ex.: "5511987654321".
    // Vazio = o botão de pedido funciona em MODO DEMONSTRAÇÃO (nada é enviado).
    whatsapp: "",
    instagram: "",   // URL completa. Ex.: "https://instagram.com/seuperfil"
    email: "",       // Ex.: "contato@seudominio.com.br"
    address: "",     // Ex.: "Rua Exemplo, 123 - Bairro, Cidade/UF"
    mapsUrl: "",     // Link do Google Maps do endereço
    hours: [         // Horários de exemplo (vieram do site original): confirme.
      { days: "Terça a quinta", time: "18h às 23h" },
      { days: "Sexta e sábado", time: "18h à 1h" },
      { days: "Domingo", time: "17h às 22h" }
    ],
    storageKey: "burgerhouse.cart.v1",
    maxQtyPerItem: 20
  };

  /* ------------------------------------------------------------------------
     2. PRODUTOS
     category: burgers | combos | sides | drinks
     image: ID de foto do Unsplash, URL/caminho próprio (ex.: "assets/classic.jpg")
            ou null (mostra um quadro "Foto em breve").
     Preços e itens marcados com sample:true são exemplos criados para esta
     versão: confirme antes de publicar.
     ------------------------------------------------------------------------ */
  const PRODUCTS = [
    { id: "house-classic", name: "House Classic", category: "burgers", price: 29.9, badge: "Mais pedido",
      desc: "Blend 160g, cheddar, alface e o molho que ninguém conseguiu copiar.",
      image: "1586190848861-99aa4a171e90", alt: "Hambúrguer House Classic com cheddar e alface" },
    { id: "cheese-explosion", name: "Cheese Explosion", category: "burgers", price: 34.9,
      desc: "Dois blends, cheddar cremoso e cebola caramelizada bem devagar.",
      image: "1571091718767-18b5b1457add", alt: "Hambúrguer duplo com cheddar derretido" },
    { id: "bacon-smash", name: "Bacon Smash", category: "burgers", price: 36.9,
      desc: "Dois smashes na chapa, bacon crocante e picles da casa.",
      image: "1550547660-d9450f859349", alt: "Hambúrguer smash com bacon" },
    { id: "combo-house", name: "Combo House", category: "combos", price: 42.9, badge: "Combo",
      desc: "House Classic, batata crocante e bebida gelada.",
      image: "1551782450-a2132b4ba21d", alt: "Combo com hambúrguer, batata e bebida" },
    { id: "combo-smash", name: "Combo Smash", category: "combos", price: 49.9, sample: true,
      desc: "Bacon Smash, batata crocante e bebida gelada.",
      image: "1581966626689-b63d790b3d49", alt: "Combo Smash" },
    { id: "batata-da-casa", name: "Batata da Casa", category: "sides", price: 16.9,
      desc: "Porção para dividir (ou não), com sal de ervas e molho à parte.",
      image: "1573080496219-bb080dd4f877", alt: "Porção de batatas fritas crocantes" },
    { id: "onion-rings", name: "Onion Rings", category: "sides", price: 18.9,
      desc: "Anéis de cebola empanados na hora, com maionese defumada.",
      image: "1639024471283-03518883512d", alt: "Porção de onion rings" },
    { id: "milkshake-chocolate", name: "Milkshake de Chocolate", category: "drinks", price: 19.9, sample: true,
      desc: "Cremoso, batido na hora e bem gelado.",
      image: "1572490122747-3968b75cc699", alt: "Milkshake de chocolate" },
    { id: "refrigerante-lata", name: "Refrigerante lata", category: "drinks", price: 6.9, sample: true,
      desc: "Lata de 350 ml, servida gelada.",
      image: "1593023669551-3c9cb301ce81", alt: "Refrigerante em lata" }
  ];

  const CATEGORY_LABEL = { burgers: "Hambúrgueres", combos: "Combos", sides: "Acompanhamentos", drinks: "Bebidas e shakes", todos: "Todos" };

  /* ------------------------------------------------------------------------
     3. UTILITÁRIOS
     ------------------------------------------------------------------------ */
  const $ = (id) => document.getElementById(id);
  const money = (cents) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='#1d1b1a'/>" +
    "<g fill='none' stroke='#cf2f18' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'>" +
    "<path d='M140 135c0-28 27-45 60-45s60 17 60 45z'/><path d='M135 165h130'/><path d='M140 195h120'/>" +
    "<path d='M150 195c0 14 11 22 25 22h50c14 0 25-8 25-22'/></g>" +
    "<text x='200' y='262' text-anchor='middle' font-family='sans-serif' font-size='16' fill='#aaa39d'>Foto em breve</text></svg>"
  );

  const imageUrl = (img, w) => {
    if (!img) return PLACEHOLDER;
    if (/^(https?:|assets\/|\.\/|\/)/.test(img)) return img;
    return `https://images.unsplash.com/photo-${img}?auto=format&fit=crop&w=${w}&h=${Math.round(w * 0.75)}&q=80`;
  };
  const imageSrcset = (img) => (!img || /^(https?:|assets\/|\.\/|\/)/.test(img))
    ? "" : `srcset="${imageUrl(img, 400)} 400w, ${imageUrl(img, 700)} 700w, ${imageUrl(img, 1000)} 1000w"`;

  const store = {
    read() { try { return JSON.parse(localStorage.getItem(CONFIG.storageKey) || "{}"); } catch { return {}; } },
    write(data) { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(data)); } catch { /* armazenamento indisponível */ } }
  };

  // Imagens que falham ao carregar viram o quadro "Foto em breve" (uma vez só, sem loop).
  const useFallback = (img) => {
    if (img.dataset.fallback) return;
    img.dataset.fallback = "1";
    img.removeAttribute("srcset");
    img.classList.add("is-placeholder");
    img.src = PLACEHOLDER;
  };
  document.addEventListener("error", (e) => { if (e.target instanceof HTMLImageElement) useFallback(e.target); }, true);
  // Imagens que já falharam antes deste script carregar
  const recoverBrokenImages = () => document.querySelectorAll("img").forEach((img) => { if (img.complete && img.naturalWidth === 0) useFallback(img); });

  /* ------------------------------------------------------------------------
     4. CARRINHO (estado puro, sem DOM)
     ------------------------------------------------------------------------ */
  const productById = new Map(PRODUCTS.map((p) => [p.id, { ...p, cents: Math.round(p.price * 100) }]));

  const Cart = (() => {
    const items = new Map(); // id -> quantidade
    const listeners = new Set();

    const notify = () => { store.write(Object.fromEntries(items)); listeners.forEach((fn) => fn()); };

    return {
      load() {
        Object.entries(store.read()).forEach(([id, qty]) => {
          if (productById.has(id) && Number.isInteger(qty) && qty > 0) items.set(id, Math.min(qty, CONFIG.maxQtyPerItem));
        });
      },
      onChange(fn) { listeners.add(fn); },
      qty(id) { return items.get(id) || 0; },
      add(id) {
        if (!productById.has(id)) return { ok: false, reason: "unknown" };
        const next = this.qty(id) + 1;
        if (next > CONFIG.maxQtyPerItem) return { ok: false, reason: "max" };
        items.set(id, next); notify();
        return { ok: true, qty: next };
      },
      change(id, delta) {
        const next = this.qty(id) + delta;
        if (next > CONFIG.maxQtyPerItem) return false;
        if (next <= 0) items.delete(id); else items.set(id, next);
        notify(); return true;
      },
      remove(id) { items.delete(id); notify(); },
      clear() { items.clear(); notify(); },
      lines() { return [...items].map(([id, qty]) => { const p = productById.get(id); return { ...p, qty, lineCents: p.cents * qty }; }); },
      count() { return [...items.values()].reduce((a, b) => a + b, 0); },
      subtotal() { return this.lines().reduce((a, l) => a + l.lineCents, 0); }
    };
  })();

  /* ------------------------------------------------------------------------
     5. INTERFACE
     ------------------------------------------------------------------------ */

  /* 5.1 Avisos */
  const Toast = (() => {
    const el = $("toast"); let timer;
    const hide = () => el.classList.remove("is-shown");
    $("closeToast").addEventListener("click", hide);
    return {
      show(title, detail = "", isError = false) {
        $("toastTitle").textContent = title;
        $("toastDetail").textContent = detail;
        $("toastIcon").textContent = isError ? "!" : "✓";
        el.classList.toggle("is-error", isError);
        el.classList.add("is-shown");
        clearTimeout(timer); timer = setTimeout(hide, 3500);
      }
    };
  })();

  /* 5.2 Menu mobile */
  const MobileNav = (() => {
    const toggle = $("menuToggle"), nav = $("mainNav");
    const set = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    };
    toggle.addEventListener("click", () => set(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { set(false); toggle.focus(); } });
    document.addEventListener("click", (e) => { if (!e.target.closest("#mainNav, #menuToggle")) set(false); });
    matchMedia("(min-width: 900px)").addEventListener("change", () => set(false));
    return { close: () => set(false) };
  })();

  /* 5.3 Cardápio: renderização e filtros */
  const Menu = (() => {
    const grid = $("productGrid"), empty = $("menuEmpty"), status = $("filterStatus");
    const buttons = [...document.querySelectorAll(".filter")];
    let current = "todos";

    const card = (p) => {
      const src = imageUrl(p.image, 700);
      return `<article class="product-card" data-category="${p.category}">
        <div class="product-image">
          ${p.badge ? `<span class="product-badge">${esc(p.badge)}</span>` : ""}
          <img src="${src}" ${imageSrcset(p.image)} sizes="(min-width: 900px) 380px, (min-width: 640px) 45vw, 40vw" width="700" height="525" loading="lazy" alt="${esc(p.alt)}"${p.image ? "" : ' class="is-placeholder" data-fallback="1"'}>
        </div>
        <div class="product-body">
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.desc)}</p>
          <div class="product-foot">
            <strong class="price">${money(Math.round(p.price * 100))}</strong>
            <button class="add-btn" type="button" data-add="${p.id}" aria-label="Adicionar ${esc(p.name)} ao pedido"><span aria-hidden="true">+</span> Adicionar</button>
          </div>
        </div>
      </article>`;
    };

    function setFilter(category, { scroll = false } = {}) {
      current = CATEGORY_LABEL[category] ? category : "todos";
      buttons.forEach((b) => {
        const on = b.dataset.filter === current;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      let visible = 0;
      grid.querySelectorAll(".product-card").forEach((c) => {
        const show = current === "todos" || c.dataset.category === current;
        c.hidden = !show;
        c.classList.remove("is-entering");
        if (show) { visible++; if (!reduceMotion) { void c.offsetWidth; c.classList.add("is-entering"); } }
      });
      empty.hidden = visible > 0;
      status.textContent = `${visible} ${visible === 1 ? "item" : "itens"} em ${CATEGORY_LABEL[current]}.`;
      if (scroll) $("cardapio").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }

    function init() {
      grid.innerHTML = PRODUCTS.map(card).join("");
      buttons.forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));
      $("showAll").addEventListener("click", () => setFilter("todos", { scroll: true }));
      // Links do site que levam ao cardápio já filtrado
      document.querySelectorAll("[data-filter-link]").forEach((a) => a.addEventListener("click", () => setFilter(a.dataset.filterLink)));
      // Adicionar ao pedido (delegação)
      grid.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-add]");
        if (!btn) return;
        const res = Cart.add(btn.dataset.add);
        const p = productById.get(btn.dataset.add);
        if (!res.ok) {
          Toast.show("Limite atingido", `O máximo é ${CONFIG.maxQtyPerItem} unidades de cada item. Para mais, fale com a gente.`, true);
          return;
        }
        btn.classList.add("is-added");
        btn.lastChild.textContent = " Adicionado";
        setTimeout(() => { btn.classList.remove("is-added"); btn.lastChild.textContent = " Adicionar"; }, 900);
        const bag = $("cartBtn"); bag.classList.remove("bump"); void bag.offsetWidth; bag.classList.add("bump");
        Toast.show(`${p.name} no pedido`, `${res.qty}x · abra a sacola para revisar`);
      });
    }
    return { init, setFilter };
  })();

  /* 5.4 Pedido (gaveta) e finalização */
  const OrderUI = (() => {
    const drawer = $("drawer"), overlay = $("overlay"), trigger = $("cartBtn");
    const list = $("cartList"), status = $("checkoutStatus");
    const inertTargets = ["siteHeader", "conteudo", "siteFooter"].map($);

    const validWhatsapp = () => /^\d{12,13}$/.test(CONFIG.whatsapp);

    function render() {
      const lines = Cart.lines();
      list.innerHTML = lines.map((l) => `<li data-id="${l.id}">
          <div><b class="ci-name">${esc(l.name)}</b><span class="ci-unit">${money(l.cents)} cada</span></div>
          <strong class="ci-total">${money(l.lineCents)}</strong>
          <div class="ci-controls" style="grid-column:1 / -1">
            <button type="button" data-act="dec" aria-label="Diminuir quantidade de ${esc(l.name)}">−</button>
            <output aria-label="Quantidade">${l.qty}</output>
            <button type="button" data-act="inc" aria-label="Aumentar quantidade de ${esc(l.name)}">+</button>
            <button type="button" class="ci-remove" data-act="remove" aria-label="Remover ${esc(l.name)} do pedido">Remover</button>
          </div></li>`).join("");
      const subtotal = money(Cart.subtotal());
      $("cartSubtotal").textContent = subtotal;
      $("cartTotal").textContent = subtotal;
      $("cartEmpty").hidden = lines.length > 0;
      list.hidden = lines.length === 0;
      $("checkout").disabled = lines.length === 0;
      $("clearCart").disabled = lines.length === 0;
      const count = Cart.count(), badge = $("cartCount");
      badge.textContent = count;
      badge.classList.toggle("is-on", count > 0);
      trigger.setAttribute("aria-label", count ? `Abrir pedido, ${count} ${count === 1 ? "item" : "itens"}` : "Abrir pedido");
      if (!lines.length) status.textContent = "";
    }

    function setOpen(open) {
      drawer.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      inertTargets.forEach((el) => { if (el) el.inert = open; });
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.toggle("is-shown", open));
      if (!open) setTimeout(() => { if (!drawer.classList.contains("is-open")) overlay.hidden = true; }, 300);
      document.body.style.overflow = open ? "hidden" : "";
      if (open) { MobileNav.close(); $("closeDrawer").focus(); } else { trigger.focus(); }
    }

    function buildMessage() {
      const lines = Cart.lines().map((l) => `• ${l.qty}x ${l.name} (${money(l.lineCents)})`);
      const note = $("orderNote").value.trim();
      return `Oi, Burger House! Quero fazer um pedido:\n${lines.join("\n")}\n\nTotal dos itens: ${money(Cart.subtotal())}\nEntrega: a combinar\n\nEndereço e observações: ${note || "(informar)"}`;
    }

    function setStatus(kind, html) {
      status.className = "checkout-status" + (kind ? ` is-${kind}` : "");
      status.innerHTML = html;
    }

    function checkout() {
      if (Cart.count() === 0) { setStatus("error", "Adicione ao menos um item antes de finalizar."); return; }
      const message = buildMessage();
      if (!validWhatsapp()) {
        // Modo demonstração: nada é enviado.
        setStatus("", `<b>Modo demonstração.</b> Nenhum pedido foi enviado, porque o WhatsApp da loja ainda não está configurado (<code>CONFIG.whatsapp</code> em script.js).<pre>${esc(message)}</pre>`);
        return;
      }
      const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
      const win = window.open(url, "_blank", "noopener");
      if (win) setStatus("ok", "Abrimos o WhatsApp com o resumo. O pedido só é enviado quando você confirmar por lá.");
      else setStatus("error", `Seu navegador bloqueou a nova aba. <a href="${url}" target="_blank" rel="noopener">Abrir o WhatsApp</a>.`);
    }

    function init() {
      Cart.onChange(render);
      trigger.addEventListener("click", () => setOpen(true));
      $("closeDrawer").addEventListener("click", () => setOpen(false));
      overlay.addEventListener("click", () => setOpen(false));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("is-open")) setOpen(false); });
      list.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-act]");
        if (!btn) return;
        const id = btn.closest("li").dataset.id, act = btn.dataset.act;
        if (act === "remove") Cart.remove(id);
        else if (!Cart.change(id, act === "inc" ? 1 : -1)) Toast.show("Limite atingido", `O máximo é ${CONFIG.maxQtyPerItem} unidades de cada item.`, true);
      });
      $("clearCart").addEventListener("click", () => { Cart.clear(); Toast.show("Pedido limpo", "Todos os itens foram removidos."); });
      $("checkout").addEventListener("click", checkout);
      render();
    }
    return { init };
  })();

  /* ------------------------------------------------------------------------
     6. CONTATO, HORÁRIOS E RODAPÉ (renderizados a partir de CONFIG)
     ------------------------------------------------------------------------ */
  function renderContact() {
    $("hoursList").innerHTML = CONFIG.hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join("");

    const wa = /^\d{12,13}$/.test(CONFIG.whatsapp) ? `https://wa.me/${CONFIG.whatsapp}` : "";
    const channels = [];
    if (wa) channels.push({ label: "WhatsApp", value: "Chamar agora", href: wa, ext: true });
    if (CONFIG.instagram) channels.push({ label: "Instagram", value: CONFIG.instagram.replace(/^https?:\/\/(www\.)?/, ""), href: CONFIG.instagram, ext: true });
    if (CONFIG.email) channels.push({ label: "E-mail", value: CONFIG.email, href: `mailto:${CONFIG.email}` });
    if (CONFIG.address) channels.push({ label: "Endereço", value: CONFIG.address, href: CONFIG.mapsUrl, ext: true });

    $("contactList").innerHTML = channels.length
      ? channels.map((c) => {
          const inner = `<small>${esc(c.label)}</small><b>${esc(c.value)}</b>`;
          return `<li>${c.href ? `<a href="${esc(c.href)}"${c.ext ? ' target="_blank" rel="noopener"' : ""}>${inner}</a>` : `<div class="contact-item">${inner}</div>`}</li>`;
        }).join("")
      : `<li><div class="contact-item"><small>Pedidos</small><b>Use a sacola do cardápio para montar seu pedido.</b></div></li>`;

    $("footerLinks").innerHTML = channels.filter((c) => c.href).map((c) => `<li><a href="${esc(c.href)}"${c.ext ? ' target="_blank" rel="noopener"' : ""}>${esc(c.label)}</a></li>`).join("");
    $("year").textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------------
     7. ROLAGEM E EFEITOS
     ------------------------------------------------------------------------ */
  function initScrollEffects() {
    const header = $("siteHeader"), progress = $("progress");
    const onScroll = () => {
      header.classList.toggle("is-scrolled", scrollY > 30);
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Destaque do link da seção atual
    const links = [...document.querySelectorAll("#mainNav a")];
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["cardapio", "acompanhamentos", "historia", "contato"].forEach((id) => $(id) && spy.observe($(id)));

    // Revelar blocos selecionados ao rolar
    const reveals = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) { reveals.forEach((el) => el.classList.add("is-in")); }
    else {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { threshold: .15 });
      reveals.forEach((el) => io.observe(el));
    }

    // Hero: leve movimento do burger com o mouse (só com mouse e sem movimento reduzido)
    const burger = $("heroBurger");
    if (burger && !reduceMotion && matchMedia("(hover: hover)").matches) {
      const visual = burger.parentElement;
      visual.addEventListener("mousemove", (e) => {
        const r = visual.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        burger.style.translate = `${x * 16}px ${y * 12}px`;
        burger.style.rotate = `${x * 4}deg`;
      });
      visual.addEventListener("mouseleave", () => { burger.style.translate = ""; burger.style.rotate = ""; });
    }
  }

  /* ------------------------------------------------------------------------
     8. INICIALIZAÇÃO
     ------------------------------------------------------------------------ */
  Cart.load();
  Menu.init();
  OrderUI.init();
  renderContact();
  initScrollEffects();
  recoverBrokenImages();
})();
