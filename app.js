/* Marigo - koncepcja. Czysty JS bez bibliotek. */
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var IO = 'IntersectionObserver' in window;

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
  var mob = $('#mob'), cel = $('#szuk .btn') || $('#cta-terminy');
  if (mob && cel && IO) {
    new IntersectionObserver(function (e) {
      var r = e[0];
      mob.classList.toggle('widac', !r.isIntersecting && r.boundingClientRect.top < 0);
    }).observe(cel);
  }

  /* subtelne wejscie sekcji (tylko ponizej pierwszego ekranu) */
  var mozna = IO && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (mozna) {
    document.documentElement.classList.add('js');
    var cele = $$('.sek-head, .typ-k, .jacht, .opinia, .lista li, .kroki li, .zasady > div, .faq, .spec, .wyp > div, .tab-ram, .mapa, .foto-opis, .kal, .wycena, .kdane, .stopka-kol, .tabela');
    var obs = new IntersectionObserver(function (e) {
      e.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); obs.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    cele.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.classList.add('rv');
      el.style.transitionDelay = ((i % 3) * 70) + 'ms';
      obs.observe(el);
    });
    addEventListener('beforeprint', function () { cele.forEach(function (el) { el.classList.add('in'); }); });
  }

  /* filtr floty + podglad wyszukiwarki */
  var lista = $('#lista');
  if (lista) {
    var karty = $$('.jacht', lista), przyc = $$('.typy button'), sel = $('#osoby'), wynik = $('#wynik'), brak = $('#brak');
    var typ = 'all';
    var odm = function (n) { return n === 1 ? 'jacht' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'jachty' : 'jachtów'; };
    var filtruj = function () {
      var min = +sel.value, n = 0;
      karty.forEach(function (k) {
        var ok = (typ === 'all' || (typ === 'bp' ? k.dataset.bp === '1' : k.dataset.typ === typ)) && +k.dataset.os >= min;
        k.hidden = !ok; if (ok) { n++; k.classList.add('in'); }
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
    $$('[data-filtr]').forEach(function (a) { a.addEventListener('click', function () { sel.value = a.dataset.osoby || '0'; ustaw(a.dataset.filtr); }); });

    var szuk = $('#szuk'), kom = $('#komunikat');
    if (szuk) szuk.addEventListener('submit', function (e) {
      e.preventDefault();
      sel.value = $('#s-os').value;
      ustaw($('#s-typ').value);
      var od = $('#s-od').value, dd = $('#s-do').value;
      var f = function (v) { var p = v.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; };
      kom.textContent = (od && dd ? 'Termin ' + f(od) + ' - ' + f(dd) + ': ' : '') + 'pokazujemy jachty pasujące do typu i załogi. W docelowej wersji wolne terminy sprawdzi tu widget Yacht CMS.';
      kom.classList.add('widac');
      $('#flota').scrollIntoView({ behavior: 'smooth' });
    });
    var sOd = $('#s-od'), sDo = $('#s-do');
    if (sOd) sOd.addEventListener('change', function () { if (sOd.value) { sDo.min = sOd.value; if (sDo.value && sDo.value <= sOd.value) sDo.value = ''; } });
  }

  /* mapa ladowana po kliknieciu */
  var mapa = $('#mapa');
  if (mapa) $('button', mapa).addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = mapa.dataset.src; f.title = 'Mapa: Marigo Czarter, port Sztynort'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    mapa.appendChild(f); this.remove();
  });

  /* galeria + pelny ekran */
  var gl = $('#glowne');
  if (gl) {
    var min = $$('#miniatury button'), licz = $('#licz'), i = 0;
    var lb = $('#lightbox'), lbImg = $('#lb-img');
    var pokaz = function (n) {
      i = (n + min.length) % min.length;
      var b = min[i];
      gl.classList.add('zm');
      var im = new Image(); im.onload = im.onerror = function () { gl.src = b.dataset.src; gl.alt = b.dataset.alt; gl.classList.remove('zm'); };
      im.src = b.dataset.src;
      min.forEach(function (x, j) { x.setAttribute('aria-current', j === i ? 'true' : 'false'); });
      licz.textContent = (i + 1) + ' / ' + min.length;
      if (lb && !lb.hidden) { lbImg.src = b.dataset.src; lbImg.alt = b.dataset.alt; }
    };
    min.forEach(function (b, j) { b.addEventListener('click', function () { pokaz(j); }); });
    $$('.galeria .strz').forEach(function (b) { b.addEventListener('click', function () { pokaz(i + (+b.dataset.kier)); }); });
    var x0 = null, ruch = false;
    var dotyk = function (el, fn) {
      el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; ruch = false; }, { passive: true });
      el.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var d = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(d) > 40) { ruch = true; fn(d < 0 ? 1 : -1); }
      });
    };
    dotyk(gl, function (k) { pokaz(i + k); });
    var otworz = function () { if (ruch) return; lbImg.src = min[i].dataset.src; lbImg.alt = min[i].dataset.alt; lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lb-x').focus(); };
    var zamknij = function () { lb.hidden = true; document.body.style.overflow = ''; };
    if (lb) {
      gl.addEventListener('click', otworz); licz.addEventListener('click', otworz);
      $('#lb-x').addEventListener('click', zamknij);
      lb.addEventListener('click', function (e) { if (e.target === lb) zamknij(); });
      $$('[data-lb]', lb).forEach(function (b) { b.addEventListener('click', function () { pokaz(i + (+b.dataset.lb)); }); });
      dotyk(lbImg, function (k) { pokaz(i + k); });
      addEventListener('keydown', function (e) {
        if (lb.hidden) return;
        if (e.key === 'Escape') zamknij(); else if (e.key === 'ArrowRight') pokaz(i + 1); else if (e.key === 'ArrowLeft') pokaz(i - 1);
      });
    }
  }

  /* podglad kalendarza rezerwacji + wycena (ceny z cennika marigo.pl, zajetosc PRZYKLADOWA) */
  var kal = $('#kal');
  if (kal) {
    var D = function (s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
    var iso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
    var CENY = [['2027-04-15', 650], ['2027-04-29', 700], ['2027-05-03', 700], ['2027-05-20', 750], ['2027-05-26', 950], ['2027-05-30', 800], ['2027-06-20', 850], ['2027-06-27', 900], ['2027-07-11', 800], ['2027-08-15', 700], ['2027-08-22', 650], ['2027-08-29', null], ['2027-10-03', 'koniec']];
    var START = '2027-04-15', KONIEC = '2027-10-03';
    /* PRZYKLADOWA zajetosc - tylko do podgladu wygladu */
    var ZAJ = [['2027-04-29', '2027-05-03'], ['2027-05-20', '2027-05-26'], ['2027-06-27', '2027-07-11'], ['2027-07-18', '2027-08-01'], ['2027-08-08', '2027-08-22']];
    var cena = function (s) { var c = null; for (var k = 0; k < CENY.length - 1; k++) if (s >= CENY[k][0] && s < CENY[k + 1][0]) c = CENY[k][1]; return c; };
    var zaj = function (s) { return ZAJ.some(function (z) { return s >= z[0] && s < z[1]; }); };
    var wSez = function (s) { return s >= '2027-06-12' && s < '2027-09-01'; };
    var MIES = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
    var DNI = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
    var od = kal.dataset.start || null, doo = kal.dataset.koniec || null;
    var m0 = 4; /* indeks miesiaca (0 = styczen): start od maja */
    var ile = function () { return innerWidth >= 600 ? 2 : 1; };
    var box = $('#miesiace');
    var zl = function (v) { return Math.round(v).toLocaleString('pl-PL').replace(/ /g, ' ') + ' zł'; };

    var rysuj = function () {
      var n = ile(), h = '';
      m0 = Math.max(3, Math.min(m0, 10 - n + 1 - 1 + 0));
      for (var m = m0; m < m0 + n; m++) {
        var pierwszy = new Date(2027, m, 1), dl = new Date(2027, m + 1, 0).getDate();
        var off = (pierwszy.getDay() + 6) % 7;
        h += '<div class="mies"><h4>' + MIES[m] + ' 2027</h4><div class="dni">' + DNI.map(function (d) { return '<span class="dn">' + d + '</span>'; }).join('');
        for (var p = 0; p < off; p++) h += '<span class="dz pusty"></span>';
        for (var d = 1; d <= dl; d++) {
          var s = iso(new Date(2027, m, d)), c = cena(s), kl = 'dz', dis = false;
          if (s < START || s >= KONIEC) { kl += ' poza'; dis = true; }
          else if (zaj(s)) { kl += ' zaj'; dis = true; }
          if (od && s === od || doo && s === doo) kl += ' wyb';
          else if (od && doo && s > od && s < doo) kl += ' zakres';
          h += '<button type="button" class="' + kl + '" data-d="' + s + '"' + (dis ? ' disabled aria-disabled="true"' : '') + ' aria-label="' + d + ' ' + MIES[m] + (dis ? ', niedostępny' : '') + '">' + d + '<small>' + (c === null ? '?' : c) + '</small></button>';
        }
        h += '</div></div>';
      }
      box.innerHTML = h;
      $('#kal-tyt').textContent = n === 1 ? 'Sezon 2027' : 'Sezon 2027';
      $('#kal-l').disabled = m0 <= 3;
      $('#kal-p').disabled = m0 + n > 9;
    };
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.dz'); if (!b || b.disabled) return;
      var s = b.dataset.d;
      if (!od || doo || s <= od) { od = s; doo = null; }
      else {
        var t = D(od), ok = true;
        while (iso(t) < s) { if (zaj(iso(t))) { ok = false; break; } t.setDate(t.getDate() + 1); }
        if (ok) doo = s; else { od = s; doo = null; }
      }
      rysuj(); wycena();
    });
    $('#kal-l').addEventListener('click', function () { m0--; rysuj(); });
    $('#kal-p').addEventListener('click', function () { m0++; rysuj(); });
    var w0 = ile(); addEventListener('resize', function () { if (ile() !== w0) { w0 = ile(); rysuj(); } });

    var SPRZ = 300, POSC = 70, PIES = 200, STER = 400, DOPL = { 2: 0.7, 3: 0.3, 4: 0.2 };
    var fd = function (s) { var p = s.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; };
    var wycena = function () {
      var tab = $('#k-tab'), ter = $('#k-termin');
      if (!od || !doo) {
        ter.textContent = od ? 'Odbiór ' + fd(od) + '. Wybierz dzień zdania jachtu.' : 'Wybierz termin w kalendarzu';
        tab.innerHTML = ''; $('#k-tydz').hidden = true; $('#k-brakceny').hidden = true; return;
      }
      var t = D(od), noce = 0, suma = 0, brak = false, sez = false;
      while (iso(t) < doo) { var c = cena(iso(t)); if (c === null) brak = true; else suma += c; if (wSez(iso(t))) sez = true; noce++; t.setDate(t.getDate() + 1); }
      ter.textContent = fd(od) + ' - ' + fd(doo) + ' · ' + noce + (noce === 1 ? ' doba' : noce < 5 ? ' doby' : ' dób');
      var posc = Math.min(8, Math.max(0, parseInt($('#k-poscie').value, 10) || 0));
      var ster = Math.min(noce, Math.max(0, parseInt($('#k-sternik').value, 10) || 0));
      var w = [['Czarter (' + noce + ' × cena doby z cennika)', brak ? (suma ? zl(suma) + ' + reszta?' : 'do potwierdzenia') : suma]];
      var dop = DOPL[noce] ? suma * DOPL[noce] : 0;
      if (noce < 2) w.push(['Minimalny czarter to 2 doby', 0]);
      if (dop) w.push(['Krótki czarter +' + Math.round(DOPL[noce] * 100) + '%', dop]);
      w.push(['Sprzątanie i dezynfekcja', SPRZ]);
      if (posc) w.push(['Pościel ' + posc + ' × ' + POSC + ' zł', posc * POSC]);
      if (ster) w.push(['Sternik ' + ster + ' × ' + STER + ' zł', ster * STER]);
      if ($('#k-pies').checked) w.push(['Pies na jachcie', PIES]);
      var razem = w.reduce(function (a, r) { return a + (typeof r[1] === 'number' ? r[1] : 0); }, 0);
      tab.innerHTML = w.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + (typeof r[1] === 'number' ? zl(r[1]) : r[1]) + '</td></tr>'; }).join('') + '<tr class="suma"><td>Razem orientacyjnie</td><td>' + (brak ? 'zapytaj biuro' : zl(razem)) + '</td></tr>';
      $('#k-tydz').hidden = !(sez && (noce % 7 !== 0 || D(od).getDay() !== 0));
      $('#k-brakceny').hidden = !brak;
    };
    $$('input', $('#kalk')).forEach(function (el) { el.addEventListener('input', wycena); el.addEventListener('change', wycena); });
    rysuj(); wycena();
  }
})();
