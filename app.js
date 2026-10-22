/* Marigo - koncepcja. Czysty JS bez bibliotek (ok. 4 KB). */
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* menu na telefonie */
  var burger = $('.burger'), panel = $('#panel');
  if (burger && panel) {
    burger.addEventListener('click', function () {
      var o = panel.classList.toggle('otw');
      burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { panel.classList.remove('otw'); burger.setAttribute('aria-expanded', 'false'); }); });
  }

  /* dolny pasek: dopiero gdy glowny przycisk zniknie z ekranu */
  var mob = $('#mob'), cel = $('.hero .btn') || $('#cta-terminy');
  if (mob && cel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      var r = e[0];
      mob.classList.toggle('widac', !r.isIntersecting && r.boundingClientRect.top < 0);
    }).observe(cel);
  }

  /* filtr floty */
  var lista = $('#lista');
  if (lista) {
    var karty = $$('.jacht', lista), przyc = $$('.typy button'), sel = $('#osoby'), wynik = $('#wynik'), brak = $('#brak');
    var typ = 'all';
    var odm = function (n) { return n === 1 ? 'jacht' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'jachty' : 'jachtów'; };
    var filtruj = function () {
      var min = +sel.value, n = 0;
      karty.forEach(function (k) {
        var ok = (typ === 'all' || (typ === 'bp' ? k.dataset.bp === '1' : k.dataset.typ === typ)) && +k.dataset.os >= min;
        k.hidden = !ok; if (ok) n++;
      });
      wynik.textContent = n + ' ' + odm(n);
      brak.classList.toggle('widac', n === 0);
    };
    var ustaw = function (t) {
      typ = t;
      przyc.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.typ === t ? 'true' : 'false'); });
      filtruj();
    };
    przyc.forEach(function (b) { b.addEventListener('click', function () { ustaw(b.dataset.typ); }); });
    sel.addEventListener('change', filtruj);
    $$('[data-filtr]').forEach(function (a) { a.addEventListener('click', function () { ustaw(a.dataset.filtr); }); });
  }

  /* galeria podstrony jachtu */
  var gl = $('#glowne');
  if (gl) {
    var min = $$('#miniatury button'), licz = $('#licz'), i = 0;
    var pokaz = function (n) {
      i = (n + min.length) % min.length;
      var b = min[i];
      gl.src = b.dataset.src; gl.alt = b.dataset.alt;
      min.forEach(function (x, j) { x.setAttribute('aria-current', j === i ? 'true' : 'false'); });
      licz.textContent = (i + 1) + ' / ' + min.length;
    };
    min.forEach(function (b, j) { b.addEventListener('click', function () { pokaz(j); }); });
    $$('.galeria .strz').forEach(function (b) { b.addEventListener('click', function () { pokaz(i + (+b.dataset.kier)); }); });
    var x0 = null;
    gl.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    gl.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var d = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(d) > 40) pokaz(i + (d < 0 ? 1 : -1));
    });
  }

  /* kalkulator kosztu rejsu (dane z cennika marigo.pl) */
  var kalk = $('#kalk');
  if (kalk) {
    var SPRZ = 300, POSC = 70, PIES = 200, STER = 400;
    var DOPL = { 2: 0.7, 3: 0.3, 4: 0.2 };
    var zl = function (v) { return Math.round(v).toLocaleString('pl-PL') + ' zł'; };
    var licz2 = function () {
      var t = $('#k-termin'), o = t.options[t.selectedIndex];
      var stawka = +t.value;
      var doby = Math.min(21, Math.max(2, parseInt($('#k-doby').value, 10) || 2));
      var posc = Math.min(8, Math.max(0, parseInt($('#k-poscie').value, 10) || 0));
      var ster = Math.min(doby, Math.max(0, parseInt($('#k-sternik').value, 10) || 0));
      var pies = $('#k-pies').checked;
      var baza = stawka * doby, dop = DOPL[doby] ? baza * DOPL[doby] : 0;
      var w = [['Czarter: ' + doby + ' × ' + zl(stawka), baza]];
      if (dop) w.push(['Dopłata za krótki czarter (+' + Math.round(DOPL[doby] * 100) + '%)', dop]);
      w.push(['Sprzątanie i dezynfekcja', SPRZ]);
      if (posc) w.push(['Pościel: ' + posc + ' × ' + POSC + ' zł', posc * POSC]);
      if (ster) w.push(['Sternik: ' + ster + ' × ' + STER + ' zł', ster * STER]);
      if (pies) w.push(['Pies na jachcie', PIES]);
      var suma = w.reduce(function (s, r) { return s + r[1]; }, 0);
      var h = w.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + zl(r[1]) + '</td></tr>'; }).join('');
      h += '<tr class="suma"><td>Razem orientacyjnie</td><td>' + zl(suma) + '</td></tr>';
      $('#k-tab').innerHTML = h;
      $('#k-tydz').hidden = !(o.dataset.sezon === '1' && doby % 7 !== 0);
    };
    $$('input,select', kalk).forEach(function (el) { el.addEventListener('input', licz2); el.addEventListener('change', licz2); });
    licz2();
  }
})();
