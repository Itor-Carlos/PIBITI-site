(function () {
  "use strict";

  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setNav(false);
        navToggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (!event.target.closest(".site-header")) setNav(false);
    });
  }

  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const navLinks = Array.from(document.querySelectorAll(".nav a"));
  const sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            const active = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { observer.observe(section); });
  }

  const greeting = document.getElementById("greeting");
  if (greeting) {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) greeting.textContent = "Bom dia!";
    else if (hour >= 12 && hour < 18) greeting.textContent = "Boa tarde!";
    else greeting.textContent = "Boa noite!";
  }

  const tabs = Array.from(document.querySelectorAll(".tab"));
  const views = {
    login: document.getElementById("viewLogin"),
    chat: document.getElementById("viewChat")
  };
  const noteTitle = document.getElementById("uiNoteTitle");
  const noteText = document.getElementById("uiNoteText");

  const notes = {
    login: {
      title: "Entrar com o login da UFS",
      text: "Você entra com o mesmo login do SIGAA. Daí em diante, é só perguntar e receber a resposta, sem se perder nos menus do sistema."
    },
    chat: {
      title: "Agora é só conversar",
      text: "O ARIA entende o pedido, escolhe a ferramenta MCP certa e responde. Antes de cada resposta, ele conta qual ferramenta usou e por quê."
    }
  };

  function activateView(name, focusInput) {
    tabs.forEach(function (tab) {
      const active = tab.dataset.view === name;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    Object.keys(views).forEach(function (key) {
      if (views[key]) views[key].classList.toggle("is-active", key === name);
    });

    if (notes[name] && noteTitle && noteText) {
      noteTitle.textContent = notes[name].title;
      noteText.textContent = notes[name].text;
    }

    if (name === "chat") {
      scrollChat();
      // No celular, focar o campo abre o teclado e esconde a conversa.
      if (focusInput && finePointer && chatInput) {
        window.setTimeout(function () { chatInput.focus({ preventScroll: true }); }, 150);
      }
    }
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      activateView(tab.dataset.view, true);
    });

    // Setas do teclado trocam de aba, como em qualquer lista de abas.
    tab.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      const next = tabs[(index + step + tabs.length) % tabs.length];
      activateView(next.dataset.view, false);
      next.focus();
    });
  });

  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  const chatStatus = document.getElementById("chatStatus");
  const suggestions = document.getElementById("chatSuggestions");
  const avatarSrc = "assets/aria-avatar.png";
  let busy = false;
  let loggedIn = false;
  let missCount = 0;

  const replies = {
    historico: {
      tool: "coletar_historico",
      why: "você pediu um resumo do seu histórico",
      html:
        "Dei uma olhada no seu histórico. Nos dados de exemplo, você tem <strong>128 créditos</strong> integralizados, " +
        "<strong>CRA 8,4</strong> e 3 disciplinas em andamento. As que mais se destacam: Cálculo I, Estruturas de Dados e Inteligência Artificial."
    },
    atividades: {
      tool: "get_minhas_atividades",
      why: "você perguntou pelas tarefas do semestre",
      html:
        "Achei 3 tarefas pendentes neste semestre:" +
        "<ul><li>Relatório do PIBITI, entrega 12/11</li>" +
        "<li>Lista 4 de Aprendizagem de Máquina, entrega 18/11</li>" +
        "<li>Seminário de Prática Orientada a Computação, 25/11</li></ul>" +
        "A do PIBITI é a mais urgente, hein."
    },
    caixa: {
      tool: "marcar_caixa_postal",
      why: "você pediu para limpar a caixa postal",
      html: "Prontinho! Marquei <strong>12 mensagens</strong> como lidas na sua caixa postal do SIGAA."
    },
    aviso: {
      tool: "gerar_avisos",
      why: "você pediu para avisar uma turma",
      html:
        "Feito! Publiquei o aviso na turma Inteligência Artificial (COMP0427)." +
        "<br><br><strong>Título:</strong> Prova mantida<br>" +
        "<strong>Mensagem:</strong> A prova de amanhã está mantida."
    },
    oi: {
      text:
        "Oi! Tudo bem por aí? Nesta demonstração eu sei falar de histórico, atividades, caixa postal e avisos. " +
        "Pode escolher uma das sugestões aqui embaixo."
    },
    obrigado: {
      text: "Imagina! Se quiser, testa outra sugestão. Eu não canso."
    }
  };

  const misses = [
    "Hmm, essa eu não sei responder aqui, porque sou só uma demonstração. Num sistema de verdade, eu escolheria a ferramenta MCP certa, faria a chamada e te contaria o resultado. Que tal tentar uma das sugestões?",
    "Essa me pegou! Nesta versão eu só conheço histórico, atividades, caixa postal e avisos. Tenta perguntar sobre um desses.",
    "Ainda não aprendi isso aqui na demo. Mas a ideia é exatamente essa: se existisse uma ferramenta para isso, eu saberia qual chamar."
  ];

  function scrollChat() {
    if (!chatMessages) return;
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function botRow() {
    const row = el("div", "msg bot");
    const img = el("img", "msg-avatar");
    img.src = avatarSrc;
    img.alt = "";
    img.width = 28;
    img.height = 28;
    row.appendChild(img);
    const stack = el("div", "msg-stack");
    row.appendChild(stack);
    return { row: row, stack: stack };
  }

  function addUserMessage(text) {
    if (!chatMessages) return;
    const row = el("div", "msg user");
    const stack = el("div", "msg-stack");
    stack.appendChild(el("div", "msg-bubble", text));
    row.appendChild(stack);
    chatMessages.appendChild(row);
    scrollChat();
  }

  function toolNote(tool, why) {
    const note = el("div", "msg-tool");
    note.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.6 17.2a1.4 1.4 0 0 0 2 2l5.7-5.7a4 4 0 0 0 5.2-5.4l-2.4 2.4-2-.4-.4-2z"/></svg>';
    const text = el("span");
    text.append("Usei ");
    text.appendChild(el("code", null, tool));
    text.append(" porque " + why + ".");
    note.appendChild(text);
    return note;
  }

  function addBotMessage(reply) {
    if (!chatMessages) return;
    const parts = botRow();
    if (reply.tool) parts.stack.appendChild(toolNote(reply.tool, reply.why));
    const bubble = el("div", "msg-bubble");
    if (reply.html) bubble.innerHTML = reply.html;
    else bubble.textContent = reply.text;
    parts.stack.appendChild(bubble);
    chatMessages.appendChild(parts.row);
    scrollChat();
  }

  function showTyping() {
    const parts = botRow();
    parts.row.id = "typingRow";
    parts.row.setAttribute("aria-label", "ARIA está digitando");
    const dots = el("div", "typing");
    dots.innerHTML = "<span></span><span></span><span></span>";
    parts.stack.appendChild(dots);
    chatMessages.appendChild(parts.row);
    if (chatStatus) chatStatus.lastChild.textContent = " digitando…";
    scrollChat();
  }

  function hideTyping() {
    const row = document.getElementById("typingRow");
    if (row) row.remove();
    if (chatStatus) chatStatus.lastChild.textContent = " online";
  }

  function pickReply(text) {
    const value = text.toLowerCase().trim();

    if (/^(oi+|ol[aá]|opa|e a[ií]|eae|salve|bom dia|boa tarde|boa noite)(?![a-z])/.test(value)) return replies.oi;
    if (/(obrigad|valeu|brigad|agrade[cç])/.test(value)) return replies.obrigado;
    if (/(hist[oó]rico|resum|cra\b|cr[eé]ditos?)/.test(value)) return replies.historico;
    if (/(atividade|tarefa|semestre|prazo|entrega)/.test(value)) return replies.atividades;
    if (/(caixa|mensage|postal|\blid[ao]s?\b)/.test(value)) return replies.caixa;
    if (/(aviso|avise|turma|prova|aula)/.test(value)) return replies.aviso;

    const miss = misses[missCount % misses.length];
    missCount += 1;
    return { text: miss };
  }

  function typingTime(reply) {
    const length = (reply.html || reply.text || "").replace(/<[^>]+>/g, "").length;
    const base = 600 + length * 9 + Math.random() * 400;
    return Math.min(Math.max(base, 900), 2400);
  }

  function respond(text) {
    busy = true;
    const reply = pickReply(text);

    window.setTimeout(function () {
      showTyping();
      window.setTimeout(function () {
        hideTyping();
        addBotMessage(reply);
        busy = false;
      }, typingTime(reply));
    }, 350);
  }

  function send(text) {
    const clean = text.trim();
    if (!clean || busy) return false;
    addUserMessage(clean);
    respond(clean);
    return true;
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      activateView("chat", true);
      if (loggedIn) return;
      loggedIn = true;
      busy = true;
      showTyping();
      window.setTimeout(function () {
        hideTyping();
        addBotMessage({ text: "Pronto, você entrou! Relaxa que nenhuma senha foi enviada: é tudo simulado. O que vamos ver primeiro?" });
        busy = false;
      }, 1100);
    });
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (send(chatInput.value)) chatInput.value = "";
    });
  }

  if (suggestions) {
    suggestions.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-prompt]");
      if (!button) return;
      if (send(button.textContent)) {
        // Sugestão usada sai da lista, como numa conversa que anda.
        button.remove();
        if (!suggestions.querySelector("button")) suggestions.textContent = "";
      }
    });
  }

  activateView("login", false);

  const lightbox = document.getElementById("lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    const lbImg = lightbox.querySelector("img");

    document.querySelectorAll(".photo-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        const thumb = button.querySelector("img");
        lbImg.src = button.dataset.full;
        lbImg.alt = thumb ? thumb.alt : "";
        lightbox.showModal();
      });
    });

    lightbox.addEventListener("click", function () { lightbox.close(); });
  }
})();
