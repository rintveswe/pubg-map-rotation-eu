// PUBG EU Map Rotation – Update 37.2 (PC/EU)
// Fungerer med din HTML:
//  - <p id="week-info"></p>
//  - <table id="rotation-table"><tbody id="map-rows"></tbody></table>

(function () {
  "use strict";

  // ======= KONFIG =======
  const UPDATE = "37.2";

  // PC bytter onsdag 02:00 UTC. Dette er start for uke 1 i 37.2.
  const SCHEDULE_START_UTC = "2025-09-10T02:00:00Z";

  // Uke 1–5 (EU, Normal Matches) i 37.2
  const EU_WEEKS_37_2 = [
    ["Erangel", "Taego", "Vikendi", "Rondo", "Miramar"],       // Uke 1
    ["Erangel", "Taego", "Rondo", "Miramar", "Deston"],        // Uke 2
    ["Erangel", "Taego", "Miramar", "Vikendi", "Paramo"],      // Uke 3
    ["Erangel", "Taego", "Vikendi", "Rondo", "Deston"],        // Uke 4
    ["Erangel", "Taego", "Rondo", "Miramar", "Karakin"],       // Uke 5
  ];

  // Kartstørrelse (for basevekter)
  const MAP_SIZE = {
    Erangel: "8x8",
    Miramar: "8x8",
    Taego:   "8x8",
    Rondo:   "8x8",
    Deston:  "8x8",
    Vikendi: "6x6",
    Paramo:  "3x3",
    Karakin: "2x2",
  };

  // Miramar har ekstra boost i uke 1–3
  const MIRAMAR_BOOST_WEEKS = new Set([1, 2, 3]);

  // HTML-IDer i din side
  const IDS = {
    weekInfo: "week-info",
    table: "rotation-table",
    tbody: "map-rows",
  };

  // ======= HJELPERE =======
  const msWeek = 7 * 24 * 3600 * 1000;
  const startDate = new Date(SCHEDULE_START_UTC);
  const fmtNO = new Intl.DateTimeFormat("no-NO", { day: "2-digit", month: "2-digit", year: "numeric" });

  function positiveModulo(n, m) {
    return ((n % m) + m) % m;
  }

  function currentWeekIndex0(now = new Date()) {
    const diffWeeks = Math.floor((now - startDate) / msWeek);
    // Rotasjonen går i loop over 5 uker
    return positiveModulo(diffWeeks, EU_WEEKS_37_2.length);
  }

  function weekDates(idx0) {
    const s = new Date(startDate.getTime() + idx0 * msWeek);
    const e = new Date(s.getTime() + 6 * 24 * 3600 * 1000); // vises som til-og-med
    return { start: s, end: e };
  }

  function baseWeight(mapName) {
    return MAP_SIZE[mapName] === "8x8" ? 2 : 1;
  }

  function weightFor(mapName, weekIndex1) {
    let w = baseWeight(mapName);
    if (mapName === "Miramar" && MIRAMAR_BOOST_WEEKS.has(weekIndex1)) w *= 2;
    return w;
  }

  function probabilitiesForWeek(idx0) {
    const weekIndex1 = idx0 + 1;
    const maps = EU_WEEKS_37_2[idx0].slice();
    const weights = maps.map(m => weightFor(m, weekIndex1));
    const total = weights.reduce((a, b) => a + b, 0);

    // Rå prosenter
    let rows = maps.map((m, i) => ({ map: m, w: weights[i], pct: (100 * weights[i]) / total }));

    // Rund til 1 desimal og juster slik at summen blir 100.0
    rows.forEach(r => r.p = +r.pct.toFixed(1));
    let sumRounded = rows.reduce((a, r) => a + r.p, 0);
    const delta = +(100 - sumRounded).toFixed(1);
    if (Math.abs(delta) >= 0.1) {
      // gi differansen til den største vekten (størst sannsynlighet)
      const target = rows.slice().sort((a, b) => b.w - a.w)[0];
      target.p = +(target.p + delta).toFixed(1);
    }

    // sorter nedad
    rows.sort((a, b) => b.p - a.p || a.map.localeCompare(b.map));
    return rows.map(({ map, p }) => ({ map, prob: p }));
  }

  function updateHeaderVersion() {
    // Oppdaterer "Update 37.X" i header-paragrafen hvis den finnes
    const headerP = document.querySelector("header p");
    if (!headerP) return;
    headerP.innerHTML = headerP.innerHTML.replace(/Update\s*\d+(\.\d+)?/i, `Update ${UPDATE}`);
  }

  function ensureTbody(table) {
    let tbody = document.getElementById(IDS.tbody);
    if (tbody && tbody.tagName.toLowerCase() === "tbody") return tbody;

    // lag/bruk første tbody hvis ikke IDen finnes
    tbody = table.querySelector("tbody");
    if (!tbody) {
      tbody = document.createElement("tbody");
      table.appendChild(tbody);
    }
    tbody.id = IDS.tbody;
    return tbody;
  }

  // ======= RENDER =======
  function render() {
    const idx0 = currentWeekIndex0(new Date());
    const { start, end } = weekDates(idx0);

    // Uketekst
    const weekEl = document.getElementById(IDS.weekInfo);
    if (weekEl) {
      weekEl.textContent = `Uke ${idx0 + 1}: ${fmtNO.format(start)} – ${fmtNO.format(end)}`;
    }

    // Tabell
    const table = document.getElementById(IDS.table);
    if (!table) {
      console.error(`Fant ikke tabellen med id='${IDS.table}'.`);
      return;
    }
    const tbody = ensureTbody(table);

    const rows = probabilitiesForWeek(idx0);
    tbody.innerHTML = rows
      .map(r => `<tr><td>${r.map}</td><td>${r.prob}%</td></tr>`)
      .join("");

    // Oppdater "Update 37.x" i headeren hvis mulig
    updateHeaderVersion();
  }

  // Kjør når DOM er klar (robust uansett hvor scriptet lastes)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
