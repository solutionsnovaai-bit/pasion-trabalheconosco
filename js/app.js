/* Ficha de candidatura: confere os campos, monta a mensagem e abre o WhatsApp.
   As perguntas ficam no index.html. Cada bloco com data-field vira uma linha da mensagem:
     data-kind   = text | phone | choice | note
     data-rotulo = nome da linha na mensagem ("Nome", "Função"...)
     data-falta  = como o campo aparece no aviso "Falta ...". Sem data-falta o campo é opcional.
     data-min    = mínimo de letras (só para text) */
(function () {
  var CONFIG = window.FICHA_CONFIG || {};
  var NUMERO = String(CONFIG.whatsapp || "").replace(/\D/g, "");
  var form = document.getElementById("ficha");
  if (!form || !NUMERO) return;

  var enviar = document.getElementById("enviar");
  var reabrir = document.getElementById("reabrir");
  var statusEl = document.getElementById("status");
  var meterFill = document.getElementById("meter-fill");
  var meterText = document.getElementById("meter-text");
  var formView = document.getElementById("form-view");
  var doneView = document.getElementById("done-view");
  var doneTitle = document.getElementById("done-title");
  var preview = document.getElementById("preview");
  var touched = {};
  var BASE = "https://wa.me/" + NUMERO;

  function digits(v) { return v.replace(/\D/g, ""); }
  function clean(v) { return v.replace(/\s+/g, " ").trim(); }

  function maskPhone(v) {
    var d = digits(v).slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  // O número aparece escrito na página a partir do config, para trocar em um lugar só.
  var local = NUMERO.indexOf("55") === 0 && NUMERO.length > 11 ? NUMERO.slice(2) : NUMERO;
  Array.prototype.forEach.call(document.querySelectorAll("[data-whats-text]"), function (el) {
    el.textContent = maskPhone(local);
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-whats-link]"), function (el) {
    el.href = BASE;
  });

  var fields = Array.prototype.map.call(form.querySelectorAll("[data-field]"), function (el) {
    return {
      el: el,
      key: el.getAttribute("data-field"),
      kind: el.getAttribute("data-kind"),
      rotulo: el.getAttribute("data-rotulo"),
      falta: el.getAttribute("data-falta"),
      min: parseInt(el.getAttribute("data-min") || "1", 10),
      msg: el.querySelector(".msg")
    };
  });
  var required = fields.filter(function (f) { return !!f.falta; });

  function valueOf(f) {
    if (f.kind === "choice") {
      return Array.prototype.map.call(f.el.querySelectorAll("input:checked"), function (i) { return i.value; }).join(", ");
    }
    return clean(f.el.querySelector("input, textarea").value);
  }

  function isOk(f) {
    var v = valueOf(f);
    if (f.kind === "phone") { var n = digits(v).length; return n === 10 || n === 11; }
    if (f.kind === "text") return v.length >= f.min;
    return v.length > 0;
  }

  function buildMessage() {
    var lines = ["*" + CONFIG.titulo + "*", CONFIG.saudacao, ""];
    fields.forEach(function (f) {
      var v = valueOf(f);
      if (v) lines.push("*" + f.rotulo + ":* " + v);
    });
    return lines.join("\n");
  }

  function joinList(items) {
    if (items.length <= 1) return items.join("");
    return items.slice(0, -1).join(", ") + " e " + items[items.length - 1];
  }

  function refresh() {
    var missing = [];
    required.forEach(function (f) {
      var good = isOk(f);
      var showError = !good && !!touched[f.key];
      f.el.classList.toggle("is-done", good);
      f.el.classList.toggle("has-error", showError);
      if (f.msg) f.msg.hidden = !showError;
      if (!good) missing.push(f.falta);
    });
    var doneCount = required.length - missing.length;
    meterFill.style.width = (doneCount / required.length * 100) + "%";
    meterText.textContent = doneCount + " de " + required.length;
    if (missing.length === 0) {
      statusEl.textContent = "Tudo certo. É só enviar.";
      statusEl.classList.add("is-ready");
    } else {
      statusEl.textContent = "Falta " + joinList(missing) + ".";
      statusEl.classList.remove("is-ready");
    }
    var url = BASE + "?text=" + encodeURIComponent(buildMessage());
    enviar.href = url;
    reabrir.href = url;
    return missing.length === 0;
  }

  function keyOf(target) {
    var wrap = target.closest("[data-field]");
    return wrap ? wrap.getAttribute("data-field") : null;
  }

  form.addEventListener("input", function (e) {
    if (e.target.type === "tel") e.target.value = maskPhone(e.target.value);
    refresh();
  });
  form.addEventListener("change", function (e) {
    var key = keyOf(e.target);
    if (key) touched[key] = true;
    refresh();
  });
  form.addEventListener("focusout", function (e) {
    var key = keyOf(e.target);
    if (key && e.target.matches('input[type="text"], input[type="tel"]') && e.target.value) {
      touched[key] = true;
      refresh();
    }
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); });

  // O botão é um link de verdade: com a ficha completa, o próprio toque abre o WhatsApp.
  enviar.addEventListener("click", function (e) {
    required.forEach(function (f) { touched[f.key] = true; });
    if (!refresh()) {
      e.preventDefault();
      var first = form.querySelector(".has-error");
      if (first) {
        var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        first.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" });
        var control = first.querySelector("input, textarea");
        if (control) control.focus({ preventScroll: true });
      }
      return;
    }
    preview.textContent = buildMessage();
    setTimeout(function () {
      formView.hidden = true;
      doneView.hidden = false;
      doneTitle.focus({ preventScroll: true });
      doneView.closest(".sheet").scrollIntoView({ block: "start" });
    }, 350);
  });

  document.getElementById("corrigir").addEventListener("click", function () {
    doneView.hidden = true;
    formView.hidden = false;
    form.querySelector("input").focus();
  });

  document.getElementById("copiar").addEventListener("click", function (e) {
    var btn = e.currentTarget;
    function selectFallback() {
      var range = document.createRange();
      range.selectNodeContents(preview);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      btn.textContent = "Mensagem selecionada, agora copie";
    }
    try {
      navigator.clipboard.writeText(preview.textContent).then(function () {
        btn.textContent = "Mensagem copiada";
        setTimeout(function () { btn.textContent = "Copiar a mensagem"; }, 2400);
      }, selectFallback);
    } catch (err) { selectFallback(); }
  });

  refresh();
})();
