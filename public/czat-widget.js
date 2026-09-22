/* =============================================================
   Czat — wstępne rozpoznanie sprawy
   Samodzielny widget do osadzenia na dowolnej stronie.

   Wersja dla emigrante.pl (kopia widgetu z ekartapobytu.pl + język RU). Różnice wobec pierwowzoru:

   1. Cały interfejs żyje w Shadow DOM. Style strony gospodarza nie
      wpływają na widget, a style widgetu nie psują strony.
   2. Nie zakłada niczego o stronie. Tworzy własną zaczepkę i sam się otwiera.
   3. Kontakt rozbity na dwa kroki: TELEFON (wymagany) i E-MAIL (opcjonalny).
      Telefon pytamy dopiero na końcu — po tym, jak rozmówca opisał sprawę.
      Pytanie o numer na starcie ucina rozmowę i nie daje wiedzy o sprawie.
   4. Każde zgłoszenie niesie pole `site` (host) i pełną ścieżkę wejścia,
      więc wszystkie projekty mogą pisać do JEDNEGO arkusza i dają się
      filtrować kolumną, a nie parsowaniem adresu.
   5. Ekran końcowy zgodny z konwencją kontaktu eKartaPobytu: przycisk
      WhatsApp, a pod nim link telefoniczny.

   OSADZENIE — jeden znacznik przed </body>:

     <script src="/czat-widget.js"
             data-endpoint="https://script.google.com/macros/s/…/exec"
             data-whatsapp="48539999549"
             defer></script>

   Pełna konfiguracja z własnymi tekstami — obiekt PRZED znacznikiem:

     <script>window.PRC_CZAT = { endpoint: "…", whatsapp: "48…",
       akcent: "#D4213D", teksty: { … } };</script>

   ============================================================= */
(function () {
  'use strict';

  /* ---------- Konfiguracja ---------- */
  var skrypt = document.currentScript;
  var dane = (skrypt && skrypt.dataset) || {};
  var U = window.PRC_CZAT || {};

  var CFG = {
    endpoint: U.endpoint || dane.endpoint || '',
    whatsapp: U.whatsapp || dane.whatsapp || '',
    telefon:  U.telefon  || dane.telefon  || '',   // wersja do wyświetlenia, np. "+48 539 999 549"
    akcent:   U.akcent   || dane.akcent   || '#D4213D',
    tlo:      U.tlo      || dane.tlo      || '#16244C',
    /* Adres polityki prywatności — mapa język → ścieżka, np.
       { pl: '/polityka-prywatnosci', en: '/en/privacy-policy' }.
       Serwis ma przetłumaczone adresy, więc nie sklejamy ich tutaj z prefiksu.
       Brak wpisu = brak checkboxa zgody; wtedy zgłoszenie idzie bez niego. */
    polityka: (function () {
      var p = U.polityka || dane.polityka || null;
      if (!p) return null;
      if (typeof p === 'string') {
        try { return JSON.parse(p); } catch (e) { return { '*': p }; }
      }
      return p;
    })(),
    /* Krój strony gospodarza. Podaj pełny stos CSS, np.
       '"IBM Plex Sans", sans-serif' — widget posłuży się nim zamiast systemowego.
       Sam kroju nie wczytuje: jeśli strona już go ładuje, po prostu zadziała. */
    kroj:     U.kroj     || dane.kroj     || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    /* Po ilu sekundach ukrycia strony uznajemy rozmowę za porzuconą.
       Krócej = fałszywe alarmy przy zwykłej zmianie zakładki. */
    powrotMs: Number(U.powrotMs || dane.powrotMs || 30000)
  };

  /* ---------- Języki ----------
     Teksty mieszkają w czat-jezyki.js. Tutaj tylko wybór właściwego zestawu.

     Serwis przełącza język bez przeładowania strony, więc nie wystarczy
     odczytać go raz przy starcie. Sprawdzamy go za każdym otwarciem czatu
     i nasłuchujemy zmiany atrybutu lang na <html>. */
  var JEZYKI = window.PRC_CZAT_JEZYKI || {};
  var DOMYSLNY = U.domyslnyJezyk || dane.domyslnyJezyk || 'pl';
  var WYMUSZONY = null;

  var ZAPAS = {
    zaczepka: 'Masz pytanie o swoją sprawę?', naglowek: 'Wstępne rozpoznanie sprawy',
    podtytul: '5 pytań', zamknij: 'Zamknij',
    intro: 'Dzień dobry. Kilka krótkich pytań i skierujemy sprawę do właściwej osoby.',
    q1: 'Czego dotyczy Twoja sprawa?', q1opcje: ['Pobyt i praca', 'Studia', 'Rodzina', 'Inne'],
    q2: 'Na jakim etapie jest sprawa?', q2opcje: ['Przed złożeniem', 'Wniosek złożony', 'Mam wezwanie', 'Odmowa'],
    q3: 'Opisz sprawę w kilku słowach.', q3pole: '',
    q4: 'Podaj numer telefonu.', q4pole: '+48 …',
    telefonZly: 'To nie wygląda na numer telefonu.',
    q5: 'Podaj adres e-mail albo pomiń ten krok.', q5pole: '',
    mailZly: 'To nie wygląda na adres e-mail.',
    pomin: 'Pomiń', wyslij: 'Wyślij',
    koniec: 'Dziękujemy. Odezwiemy się wkrótce.', koniecWa: 'Kontynuuj na WhatsAppie',
    koniecTel: '', koniecNota: '',
    waPrefiks: 'Dzień dobry, wypełniłem/-am czat na Waszej stronie.',
    etSprawa: 'Sprawa', etEtap: 'Etap', etOpis: 'Opis', etTelefon: 'Telefon', etMail: 'E-mail',
    mikStart: 'Dyktuj', mikStop: 'Zakończ dyktowanie',
    mikBrakZgody: 'Brak dostępu do mikrofonu — wpisz tekst.',
    mikCisza: 'Nic nie usłyszeliśmy.', mikBlad: 'Dyktowanie nie zadziałało.'
  };

  function kodJezyka() {
    if (WYMUSZONY) return WYMUSZONY;
    var l = (U.jezyk || dane.jezyk || document.documentElement.lang || DOMYSLNY).toLowerCase();
    return l.split('-')[0];
  }

  /* Kolejność: dokładny język → angielski → domyślny → zapas wbudowany.
     Nakładki użytkownika (teksty / jezyki) mają pierwszeństwo nad wszystkim. */
  function tekstyDla(kod) {
    var nakladki = (U.jezyki && U.jezyki[kod]) || {};
    var wybrany = JEZYKI[kod] || JEZYKI.en || JEZYKI[DOMYSLNY] || {};
    return Object.assign({}, ZAPAS, wybrany, U.teksty || {}, nakladki);
  }

  var T = tekstyDla(kodJezyka());

  if (!CFG.endpoint) {
    try { console.warn('[czat] brak data-endpoint — zgłoszenia nie będą wysyłane'); } catch (e) {}
  }

  /* ---------- Walidacja kontaktu ----------
     Telefon: co najmniej 9 cyfr po odjęciu spacji, nawiasów, myślników i plusa.
     Polski numer ma 9 cyfr, zagraniczne bywają dłuższe — górnej granicy nie
     stawiamy sztywno, bo numery z kierunkowym potrafią mieć 15 cyfr (E.164). */
  function telefonOk(v) {
    var cyfry = String(v).replace(/[^\d]/g, '');
    return cyfry.length >= 9 && cyfry.length <= 15;
  }
  function mailOk(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
  }

  /* ---------- Analityka: to samo API co na stronie ---------- */
  window.dataLayer = window.dataLayer || [];
  function slad(zdarzenie, params) {
    var p = Object.assign({ event: zdarzenie, page_path: location.pathname }, params || {});
    window.dataLayer.push(p);
    if (typeof window.gtag === 'function') window.gtag('event', zdarzenie, p);
  }

  /* ---------- Źródło wejścia ---------- */
  function zrodlo() {
    try {
      var z = sessionStorage.getItem('prc_attr');
      if (z) return JSON.parse(z);
      var q = new URLSearchParams(location.search);
      var a = {
        source: q.get('utm_source') || (document.referrer ? new URL(document.referrer).hostname : 'wejscie bezposrednie'),
        medium: q.get('utm_medium') || '',
        campaign: q.get('utm_campaign') || '',
        /* Pełny adres z domeną — dzięki temu w arkuszu widać, z KTÓREJ strony
           przyszedł lead, gdy widget stoi na kilku serwisach naraz. */
        landing: location.hostname + location.pathname
      };
      sessionStorage.setItem('prc_attr', JSON.stringify(a));
      return a;
    } catch (e) { return { source: 'nieznane', landing: location.hostname }; }
  }

  var idRozmowy = (function () {
    try {
      var i = sessionStorage.getItem('prc_sid');
      if (!i) { i = Math.random().toString(36).slice(2, 8).toUpperCase(); sessionStorage.setItem('prc_sid', i); }
      return i;
    } catch (e) { return '------'; }
  })();

  function wyslij(ladunek, beacon) {
    if (!CFG.endpoint) { try { console.info('[czat] lead:', ladunek); } catch (e) {} return; }
    var body = JSON.stringify(ladunek);
    if (beacon && navigator.sendBeacon) {
      try { navigator.sendBeacon(CFG.endpoint, new Blob([body], { type: 'text/plain;charset=utf-8' })); return; } catch (e) {}
    }
    fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, keepalive: !!beacon }).catch(function () {});
  }

  /* ---------- Style widgetu (wewnątrz Shadow DOM) ---------- */
  var CSS = `
/* UWAGA: reguły strony gospodarza (np. gwiazdkowa reguła font-family) mają
   pierwszeństwo przed :host, więc krój ustawiamy na korzeniach WEWNĄTRZ
   cienia. Tam żadna reguła z zewnątrz nie sięga. */
:host { all: initial; }
.zaczepka, .panel {
  font-family: var(--kroj);
  font-size: 14px; font-weight: 400; font-style: normal; line-height: 1.5;
  letter-spacing: normal; word-spacing: normal; text-transform: none;
  text-align: left; color: #111; direction: ltr;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
button { font: inherit; color: inherit; cursor: pointer; border: 0; background: none; }

.zaczepka {
  position: fixed; right: 24px; bottom: 24px; z-index: 2147483000;
  display: inline-flex; align-items: center; gap: 10px;
  min-height: 58px; padding: 0 24px;
  background: var(--tlo); color: #fff; border-radius: 999px;
  font-size: 15.5px; font-weight: 600; white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0,0,0,.32), 0 32px 64px -24px rgba(0,0,0,.6);
  opacity: 0; transform: translateY(20px); pointer-events: none;
  transition: opacity .3s ease, transform .3s ease;
}
.zaczepka.widoczna { opacity: 1; transform: none; pointer-events: auto; }
.kropka { width: 7px; height: 7px; border-radius: 50%; background: #1DA851; }
@media (max-width: 599px) { .zaczepka { right: 16px; bottom: 16px; min-height: 52px; padding: 0 18px; font-size: 14.5px; } }

.panel {
  position: fixed; right: 24px; bottom: 24px; z-index: 2147483001;
  width: min(390px, calc(100vw - 32px)); max-height: min(640px, calc(100dvh - 48px));
  display: none; flex-direction: column;
  background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,.2), 0 32px 64px -24px rgba(0,0,0,.5);
}
.panel[data-otwarty="true"] { display: flex; }
@media (max-width: 599px) { .panel { inset: auto 0 0 0; width: 100%; max-height: 88dvh; border-radius: 12px 12px 0 0; } }

.glowa { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: var(--tlo); color: #fff; }
.znak { width: 30px; height: 30px; border-radius: 6px; background: rgba(255,255,255,.16); display: grid; place-items: center; font-size: 14px; font-weight: 700; }
.tytul { display: block; font-size: 14px; font-weight: 600; }
.podtytul { display: block; font-size: 11px; opacity: .68; margin-top: 2px; }
.zamknij { margin-left: auto; background: transparent; color: rgba(255,255,255,.8); padding: 6px; border-radius: 5px; line-height: 0; }
.zamknij:hover { background: rgba(255,255,255,.14); color: #fff; }

.postep { height: 2px; background: #e9e9ee; }
.postep i { display: block; height: 100%; width: 0; background: var(--akcent); transition: width .35s ease; }

.log { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 10px; }
.wiad { max-width: 88%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
.bot { background: #f2f3f5; color: #111; border-bottom-left-radius: 3px; align-self: flex-start; }
.user { background: var(--tlo); color: #fff; border-bottom-right-radius: 3px; align-self: flex-end; }
.pisze { display: flex; gap: 4px; padding: 14px; }
.pisze i { width: 5px; height: 5px; border-radius: 50%; background: #9aa0a6; animation: mig 1.2s infinite; }
.pisze i:nth-child(2) { animation-delay: .18s; } .pisze i:nth-child(3) { animation-delay: .36s; }
@keyframes mig { 0%,60%,100% { opacity: .25; } 30% { opacity: 1; } }

.stopa { border-top: 1px solid #e9e9ee; padding: 14px; background: #fafafb; }
.opcje { display: flex; flex-wrap: wrap; gap: 7px; }
.opcja { padding: 9px 13px; background: #fff; border: 1px solid #d7d9de; border-radius: 20px; font-size: 13px; color: #111; }
.opcja:hover { border-color: var(--tlo); }
.pole { display: flex; gap: 8px; align-items: flex-end; }
.otoczka { position: relative; flex: 1; }
.otoczka textarea, .otoczka input {
  width: 100%; padding: 12px 46px 12px 14px; border: 1px solid #d7d9de; border-radius: 8px;
  font: inherit; font-size: 15px; resize: none; min-height: 46px; max-height: 120px; color: #111; background: #fff;
}
.otoczka input.bezMik { padding-right: 14px; }
.otoczka textarea:focus, .otoczka input:focus { outline: 2px solid var(--akcent); outline-offset: -1px; border-color: transparent; }
.slij { width: 46px; height: 46px; flex: none; border-radius: 8px; background: var(--tlo); color: #fff; display: grid; place-items: center; }

.mik { position: absolute; right: 6px; bottom: 6px; width: 34px; height: 34px; border-radius: 6px; background: #eef0f2; color: #4a4f57; display: grid; place-items: center; }
.mik:hover { color: #111; }
.mik.gra { background: var(--akcent); color: #fff; }
.mik.gra svg { display: none; }
.fala { display: none; align-items: flex-end; gap: 2px; height: 13px; }
.mik.gra .fala { display: flex; }
.fala i { width: 2px; background: currentColor; border-radius: 1px; animation: fala .9s ease-in-out infinite; }
.fala i:nth-child(1) { height: 6px; } .fala i:nth-child(2) { height: 12px; animation-delay: .15s; } .fala i:nth-child(3) { height: 8px; animation-delay: .3s; }
@keyframes fala { 0%,100% { transform: scaleY(.4); } 50% { transform: scaleY(1); } }
@media (prefers-reduced-motion: reduce) { .fala i, .pisze i { animation: none; } }

.zgoda { display: flex; gap: 8px; align-items: flex-start; margin-top: 10px; font-size: 11px; line-height: 1.5; color: #4a4f57; }
.zgoda input { width: 16px; height: 16px; flex: none; margin-top: 1px; accent-color: var(--akcent); cursor: pointer; }
.zgoda label { cursor: pointer; }
.zgoda a { color: inherit; text-decoration: underline; }

.nota { margin-top: 10px; font-size: 11px; color: #6b7280; text-align: center; }
.podpowiedz { margin-top: 8px; font-size: 11px; color: var(--akcent); line-height: 1.5; }
.koniecBox { display: grid; gap: 8px; }
.przyciskWa { display: block; text-align: center; padding: 13px; border-radius: 8px; background: #1DA851; color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; }
.linkTel { display: block; text-align: center; font-size: 12px; color: #4a4f57; text-decoration: none; }
.linkTel:hover { color: #111; text-decoration: underline; }
`;

  /* ---------- Budowa ---------- */
  var host = document.createElement('div');
  host.setAttribute('data-prc-czat', '');
  /* Odcinamy sam element-gospodarz od stylów strony (np. `div { border: 1px }`).
     Zmiennych CSS to nie dotyczy — `all` ich nie resetuje. */
  host.style.setProperty('all', 'initial', 'important');
  var cien = host.attachShadow({ mode: 'open' });
  var style = document.createElement('style');
  style.textContent = ':host{--akcent:' + CFG.akcent + ';--tlo:' + CFG.tlo + ';--kroj:' + CFG.kroj + ';}' + CSS;
  cien.appendChild(style);

  /* Teksty wstawiamy przez textContent, nie przez innerHTML — tłumaczenie
     z apostrofem albo znakiem < nie może rozsypać znacznika. */
  function ustaw(sel, tekst) { var el = cien.querySelector(sel); if (el) el.textContent = tekst; }

  var korzen = document.createElement('div');
  korzen.innerHTML =
    '<button class="zaczepka" type="button"><span class="kropka"></span><span class="zaczepkaTekst"></span></button>' +
    '<div class="panel" data-otwarty="false" role="dialog">' +
      '<div class="glowa"><span class="znak">e</span><span><span class="tytul"></span>' +
      '<span class="podtytul"></span></span>' +
      '<button class="zamknij" type="button">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>' +
      '<div class="postep"><i></i></div>' +
      '<div class="log" role="log" aria-live="polite"></div>' +
      '<div class="stopa"></div>' +
    '</div>';
  cien.appendChild(korzen);

  function gotowe() { document.body.appendChild(host); start(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', gotowe); else gotowe();

  /* ---------- Logika rozmowy ---------- */
  function start() {
    var $ = function (s) { return cien.querySelector(s); };
    var zaczepka = $('.zaczepka'), panel = $('.panel'), log = $('.log'), stopa = $('.stopa'), postep = $('.postep i');

    var odp = {}, krok = -1, otwarty = false, porzuconeWyslane = false, ukonczone = false;
    var zgodaPole = null, zgodaData = '';

    function KROKI() {
      return [
        { klucz: 'topic',   pyt: T.q1, tryb: 'opcje', opcje: T.q1opcje },
        { klucz: 'stage',   pyt: T.q2, tryb: 'opcje', opcje: T.q2opcje },
        { klucz: 'details', pyt: T.q3, tryb: 'tekst', pole: T.q3pole, pomijalny: true, mikrofon: true },
        /* Telefon — ostatni moment rozmowy, świadomie. Rozmówca zdążył już
           opisać sprawę, więc podanie numeru jest domknięciem, nie wstępem. */
        { klucz: 'phone',   pyt: T.q4, tryb: 'telefon', pole: T.q4pole, zgoda: true },
        { klucz: 'email',   pyt: T.q5, tryb: 'email', pole: T.q5pole, pomijalny: true }
      ];
    }
    var ILE_KROKOW = 5;

    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var aktywnyMik = null;

    function bąbel(tekst, kto) {
      var d = document.createElement('div');
      d.className = 'wiad ' + kto;
      d.textContent = tekst;
      log.appendChild(d); log.scrollTop = log.scrollHeight;
    }
    function pisze(potem, ms) {
      var d = document.createElement('div');
      d.className = 'wiad bot pisze';
      d.innerHTML = '<i></i><i></i><i></i>';
      log.appendChild(d); log.scrollTop = log.scrollHeight;
      setTimeout(function () { d.remove(); potem(); }, ms || 650);
    }
    function podpowiedz(t) {
      var stara = stopa.querySelector('.podpowiedz'); if (stara) stara.remove();
      var p = document.createElement('p'); p.className = 'podpowiedz'; p.textContent = t;
      stopa.appendChild(p); setTimeout(function () { p.remove(); }, 6000);
    }

    function mikrofon(input) {
      if (!SR) return null;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mik'; b.title = T.mikStart; b.setAttribute('aria-label', T.mikStart);
      b.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
        '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/></svg>' +
        '<span class="fala"><i></i><i></i><i></i></span>';
      var rec = null, baza = '', gra = false;

      function stop() { if (rec) { try { rec.stop(); } catch (e) {} } gra = false; b.classList.remove('gra'); if (aktywnyMik === stop) aktywnyMik = null; }
      b.addEventListener('click', function () {
        if (gra) return stop();
        if (aktywnyMik) aktywnyMik();
        rec = new SR();
        rec.lang = { pl: 'pl-PL', en: 'en-GB', es: 'es-ES', uk: 'uk-UA', ru: 'ru-RU' }[kodJezyka()] || 'pl-PL';
        rec.continuous = true; rec.interimResults = true;
        baza = input.value ? input.value.replace(/\s+$/, '') + ' ' : '';
        rec.onstart = function () { gra = true; b.classList.add('gra'); aktywnyMik = stop; slad('dictation_start', { field: 'czat' }); };
        rec.onresult = function (e) {
          var fin = '', tmp = '';
          for (var i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) fin += e.results[i][0].transcript; else tmp += e.results[i][0].transcript;
          }
          if (fin) baza += fin.replace(/^\s+/, '') + ' ';
          input.value = (baza + tmp).replace(/\s+/g, ' ').replace(/^\s/, '');
        };
        rec.onerror = function (e) {
          stop();
          podpowiedz(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? T.mikBrakZgody : e.error === 'no-speech' ? T.mikCisza : T.mikBlad);
        };
        rec.onend = function () { stop(); };
        try { rec.start(); } catch (e) { stop(); }
      });
      return b;
    }

    function pokazPole(k) {
      stopa.innerHTML = '';
      zgodaPole = null;
      if (k.tryb === 'opcje') {
        var box = document.createElement('div'); box.className = 'opcje';
        k.opcje.forEach(function (o) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'opcja'; b.textContent = o;
          b.addEventListener('click', function () { odpowiedz(o); });
          box.appendChild(b);
        });
        stopa.appendChild(box);
        return;
      }
      var form = document.createElement('form'); form.className = 'pole';
      var ot = document.createElement('div'); ot.className = 'otoczka';
      var input = document.createElement(k.tryb === 'tekst' ? 'textarea' : 'input');
      input.placeholder = k.pole || '';
      /* Klawiatura numeryczna na telefonie i podpowiedź autouzupełniania
         przeglądarki — dwie rzeczy, które najbardziej skracają ten krok. */
      if (k.tryb === 'telefon') { input.type = 'tel'; input.autocomplete = 'tel'; input.inputMode = 'tel'; input.className = 'bezMik'; }
      if (k.tryb === 'email')   { input.type = 'email'; input.autocomplete = 'email'; input.inputMode = 'email'; input.className = 'bezMik'; }
      ot.appendChild(input);
      if (k.mikrofon) { var m = mikrofon(input); if (m) ot.appendChild(m); }
      var s = document.createElement('button');
      s.type = 'submit'; s.className = 'slij'; s.setAttribute('aria-label', T.wyslij);
      s.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
      form.appendChild(ot); form.appendChild(s);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (aktywnyMik) aktywnyMik();
        var v = input.value.trim(); if (!v) return;
        if (k.tryb === 'telefon' && !telefonOk(v)) { podpowiedz(T.telefonZly); return; }
        if (k.tryb === 'email' && !mailOk(v))      { podpowiedz(T.mailZly); return; }
        if (zgodaPole && !zgodaPole.checked) { podpowiedz(T.zgodaPodpowiedz); return; }
        if (zgodaPole) zgodaData = new Date().toISOString();
        odpowiedz(v);
      });
      if (k.tryb === 'tekst') {
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); }
        });
      }
      stopa.appendChild(form);

      /* Zgoda na kontakt — ta sama konwencja, co przy przycisku WhatsApp
         na stronie: checkbox z odnośnikiem do polityki, bez niego nie wysyłamy.
         Stoi przy telefonie, bo to pierwszy krok, w którym pada dana osobowa
         pozwalająca się z kimś skontaktować. */
      if (k.zgoda && CFG.polityka) {
        var adres = CFG.polityka[kodJezyka()] || CFG.polityka['*'] || CFG.polityka.pl;
        if (adres) {
          var wrap = document.createElement('div'); wrap.className = 'zgoda';
          var chk = document.createElement('input');
          chk.type = 'checkbox'; chk.id = 'prc-zgoda';
          var lab = document.createElement('label'); lab.htmlFor = 'prc-zgoda';
          lab.appendChild(document.createTextNode(T.zgodaPrzed));
          var lnk = document.createElement('a');
          lnk.href = adres; lnk.target = '_blank'; lnk.rel = 'noopener noreferrer';
          lnk.textContent = T.zgodaLink;
          lab.appendChild(lnk);
          lab.appendChild(document.createTextNode(T.zgodaPo));
          wrap.appendChild(chk); wrap.appendChild(lab);
          stopa.appendChild(wrap);
          zgodaPole = chk;
        }
      }

      if (k.pomijalny) {
        var p = document.createElement('div'); p.className = 'nota';
        var bp = document.createElement('button');
        bp.type = 'button'; bp.textContent = T.pomin;
        bp.style.cssText = 'background:none;color:inherit;text-decoration:underline;font-size:11px;padding:0';
        bp.addEventListener('click', function () { odpowiedz('—'); });
        p.appendChild(bp); stopa.appendChild(p);
      }
      if (window.innerWidth > 599) setTimeout(function () { input.focus(); }, 80);
    }

    function dalej() {
      krok++;
      postep.style.width = Math.round(((krok + 1) / (ILE_KROKOW + 1)) * 100) + '%';
      if (krok >= ILE_KROKOW) return koniec();
      var k = KROKI()[krok];
      pisze(function () { bąbel(k.pyt, 'bot'); pokazPole(k); }, krok === 0 ? 500 : 700);
      slad('chat_step_shown', { step: krok + 1 });
    }
    function odpowiedz(v) {
      odp[KROKI()[krok].klucz] = v;
      bąbel(v, 'user'); stopa.innerHTML = '';
      slad('chat_step_answered', { step: krok + 1 });
      dalej();
    }
    function ladunek(status) {
      return Object.assign({}, odp, {
        /* `contact` zostaje dla zgodności ze starszymi wierszami arkusza:
           jedna kolumna, w której zawsze jest cokolwiek, czym da się oddzwonić. */
        contact: odp.phone || odp.email || '',
        /* Ślad zgody: znacznik czasu jej udzielenia. Sama treść klauzuli
           mieszka w polityce prywatności, więc tu wystarczy „kiedy". */
        consent: zgodaData ? 'tak' : '',
        consentAt: zgodaData,
        site: location.hostname,
        attribution: zrodlo(), lang: kodJezyka(),
        channel: 'czat', status: status, sessionId: idRozmowy,
        supersedes: status === 'kompletny' && porzuconeWyslane ? idRozmowy : '',
        stoppedAt: status === 'porzucony' ? (krok + 1) + '/' + ILE_KROKOW : ''
      });
    }
    function koniec() {
      ukonczone = true;
      try { sessionStorage.setItem('prc_chat_done', '1'); } catch (e) {}
      wyslij(ladunek('kompletny'));
      slad('chat_completed', { case_type: odp.topic });
      pisze(function () {
        bąbel(T.koniec, 'bot');
        var box = document.createElement('div'); box.className = 'koniecBox';
        var tresc = [T.waPrefiks, '', T.etSprawa + ': ' + (odp.topic || '—'), T.etEtap + ': ' + (odp.stage || '—'),
                     T.etOpis + ': ' + (odp.details || '—'), T.etTelefon + ': ' + (odp.phone || '—'),
                     T.etMail + ': ' + (odp.email && odp.email !== '—' ? odp.email : '—')].join('\n');
        if (CFG.whatsapp) {
          var a = document.createElement('a');
          a.className = 'przyciskWa'; a.target = '_blank'; a.rel = 'noopener noreferrer';
          a.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(tresc);
          a.textContent = T.koniecWa;
          a.addEventListener('click', function () { slad('whatsapp_click', { cta_location: 'czat_koniec' }); });
          box.appendChild(a);
        }
        /* Konwencja kontaktu eKartaPobytu: pod każdym przyciskiem WhatsApp
           stoi link telefoniczny. */
        var numer = CFG.telefon || (CFG.whatsapp ? '+' + CFG.whatsapp : '');
        if (numer && T.koniecTel) {
          var tel = document.createElement('a');
          tel.className = 'linkTel';
          tel.href = 'tel:' + numer.replace(/[^\d+]/g, '');
          tel.textContent = T.koniecTel;
          tel.addEventListener('click', function () { slad('phone_click', { cta_location: 'czat_koniec' }); });
          box.appendChild(tel);
        }
        if (T.koniecNota) {
          var n = document.createElement('p'); n.className = 'nota'; n.textContent = T.koniecNota;
          box.appendChild(n);
        }
        stopa.appendChild(box);
        postep.style.width = '100%';
      }, 800);
    }

    /* Ratowanie porzuconych rozmów. Rozmowa urwana po kroku 3 ma już opis
       sprawy, ale nie ma numeru — i tak warto ją zapisać, bo pokazuje,
       na czym ludzie się zatrzymują. */
    var timer = null;
    function porzucone(natychmiast) {
      if (ukonczone || porzuconeWyslane || !Object.keys(odp).length) return;
      porzuconeWyslane = true;
      wyslij(ladunek('porzucony'), true);
      slad('chat_abandoned', { step: krok + 1, trigger: natychmiast ? 'zamkniecie' : 'brak_powrotu' });
    }
    window.addEventListener('pagehide', function () { porzucone(true); });
    document.addEventListener('visibilitychange', function () {
      clearTimeout(timer);
      if (document.visibilityState === 'hidden') timer = setTimeout(function () { porzucone(false); }, CFG.powrotMs);
    });

    function otworz(powod) {
      panel.setAttribute('data-otwarty', 'true');
      zaczepka.classList.remove('widoczna');
      if (otwarty) return;
      otwarty = true;
      T = tekstyDla(kodJezyka());   // rozmowa poleci w języku wybranym przez użytkownika
      odswiezEtykiety();
      slad('chat_opened', { trigger: powod });
      pisze(function () { bąbel(T.intro, 'bot'); dalej(); }, 420);
    }
    function zamknij() {
      if (aktywnyMik) aktywnyMik();
      panel.setAttribute('data-otwarty', 'false');
      zaczepka.classList.add('widoczna');
      slad('chat_closed', { step: krok + 1 });
    }

    /* Serwis przełącza język bez przeładowania. Aktualizujemy wtedy etykiety,
       których użytkownik nie widzi w toku rozmowy. Rozpoczętej rozmowy nie
       tłumaczymy w locie — zmiana języka w połowie byłaby myląca. */
    function odswiezEtykiety() {
      T = tekstyDla(kodJezyka());
      ustaw('.zaczepkaTekst', T.zaczepka);
      ustaw('.tytul', T.naglowek);
      ustaw('.podtytul', T.podtytul);
      cien.querySelector('.zamknij').setAttribute('aria-label', T.zamknij);
      panel.setAttribute('aria-label', T.naglowek);
    }
    odswiezEtykiety();

    new MutationObserver(function () { if (!otwarty) odswiezEtykiety(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    /* Furtka dla aplikacji, które nie zmieniają atrybutu lang na <html>:
       window.PRC_CZAT_jezyk('en') przełącza widget ręcznie. */
    window.PRC_CZAT_jezyk = function (kod) {
      WYMUSZONY = kod ? String(kod).toLowerCase().split('-')[0] : null;
      if (!otwarty) odswiezEtykiety();
    };

    zaczepka.addEventListener('click', function () { otworz('zaczepka'); });
    cien.querySelector('.zamknij').addEventListener('click', zamknij);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.getAttribute('data-otwarty') === 'true') zamknij(); });

    /* Dowolny element strony gospodarza z atrybutem data-prc-otworz-czat
       otwiera widget — dzięki temu można podpiąć własny przycisk.
       Używamy delegacji, bo przyciski w React/TanStack powstają po starcie widgetu. */
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-prc-otworz-czat]');
      if (!el) return;
      e.preventDefault();
      otworz(el.getAttribute('data-prc-otworz-czat') || 'przycisk');
    });

    /* Zaczepka pojawia się po zachowaniu, nie po zegarze. */
    var juz = false;
    try { if (sessionStorage.getItem('prc_chat_done') === '1') juz = true; } catch (e) {}
    if (!juz) {
      var pokazana = false;
      var pokaz = function (why) {
        if (pokazana || panel.getAttribute('data-otwarty') === 'true') return;
        pokazana = true; zaczepka.classList.add('widoczna');
        slad('chat_prompt_shown', { trigger: why });
      };
      var naScroll = function () {
        var h = document.body.scrollHeight - window.innerHeight;
        if (h > 0 && window.scrollY / h > 0.45) { pokaz('gleboko_przewiniete'); window.removeEventListener('scroll', naScroll); }
      };
      window.addEventListener('scroll', naScroll, { passive: true });
      setTimeout(function () { pokaz('czas'); }, 4000);
      var autoOtwarte = false;
      try { if (sessionStorage.getItem('prc_chat_auto') === '1') autoOtwarte = true; } catch (e) {}
      if (!autoOtwarte && window.innerWidth >= 940) {
        setTimeout(function () {
          if (otwarty || panel.getAttribute('data-otwarty') === 'true') return;
          try { sessionStorage.setItem('prc_chat_auto', '1'); } catch (e) {}
          otworz('auto');
        }, 15000);
      }
      var nudge = false;
      document.addEventListener('mouseout', function (e) {
        if (nudge || e.relatedTarget || e.clientY > 24 || window.innerWidth < 940) return;
        nudge = true; pokaz('zamiar_wyjscia');
        setTimeout(function () { if (!otwarty) otworz('zamiar_wyjscia'); }, 250);
      });
    }
  }
})();
