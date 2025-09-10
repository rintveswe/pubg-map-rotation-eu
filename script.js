<script>
(() => {
/** PUBG EU Map Rotation – Update 37.2 (PC, EU)
 * - PC roterer onsdager 02:00 UTC
 * - 8x8-kart vekt = 2, mindre kart vekt = 1
 * - Miramar får ekstra boost (×2) i uke 1–3
 */

// --- KONFIG ---
const UPDATE = "37.2";
const msWeek = 7 * 24 * 3600 * 1000;

// Start for uke 1 i 37.2 (PC, 02:00 UTC)
const rotation = {
  startDate: new Date("2025-09-10T02:00:00Z"),
  // Uke 1–5 (EU, Normal Match)
  weeks: [
    // Wk1: Erangel, Taego, Vikendi, Rondo, Miramar
    { fixed: ["Erangel", "Taego"], favored: ["Rondo"],  etc: ["Vikendi", "Miramar"] },
    // Wk2: Erangel, Taego, Rondo, Miramar, Deston
    { fixed: ["Erangel", "Taego"], favored: ["Rondo", "Deston"],  etc: ["Miramar"] },
    // Wk3: Erangel, Taego, Miramar, Vikendi, Paramo
    { fixed: ["Erangel", "Taego"], favored: ["Vikendi", "Paramo"], etc: ["Miramar"] },
    // Wk4: Erangel, Taego, Vikendi, Rondo, Deston
    { fixed: ["Erangel", "Taego"], favored: ["Rondo", "Deston"],  etc: ["Vikendi"] },
    // Wk5: Erangel, Taego, Rondo, Miramar, Karakin
    { fixed: ["Erangel", "Taego"], favored: ["Rondo", "Karakin"], etc: ["Miramar"] },
  ],
};

// Kartstørrelse (for base-vekter)
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

// Miramar boost i uke 1–3 (1-indeksert)
const MIRAMAR_BOOST_WEEKS = [1, 2, 3];

// --- HJELPEFUNKSJONER ---
function clampWeekIndex(idx) {
  if (idx < 0) return 0;
  // rull rundt dersom datoen er langt frem i tid
  return idx % rotation.weeks.length;
}

function currentWeekIndex(now = new Date()) {
  const diffWeeks = Math.floor((now - rotation.startDate) / msWeek);
  return clampWeekIndex(diffWeeks);
}

function weekDates(idx0) {
  const start = new Date(rotation.startDate.getTime() + idx0 * msWeek);
  const end = new Date(start.getTime() + 6 * 24 * 3600 * 1000); // til-og-med
  return { start, end };
}

function mapsForWeek(idx0) {
  const w = rotation.weeks[idx0];
  return [...(w.fixed || []), ...(w.favored || []), ...(w.etc || [])];
}

function baseWeight(mapName) {
  return MAP_SIZE[mapName] === "8x8" ? 2 : 1;
}

function weightFor(mapName, weekIndex1) {
  let w = baseWeight(mapName);
  if (mapName === "Miramar" && MIRAMAR_BOOST_WEEKS.includes(weekIndex1)) {
    w *= 2; // ekstra boost i uke 1–3
  }
  return w;
}

function probabilitiesForWeek(idx0) {
  const weekIndex1 = idx0 + 1;
  const maps = mapsForWeek(idx0);
  const weights = maps.map((m) => weightFor(m, weekIndex1));
  const total = weights.reduce((a, b) => a + b, 0);
  return maps
    .map((m, i) => ({ map: m, prob: +(100 * weights[i] / total).toFixed(1) }))
    .sort((a, b) => b.prob - a.prob || a.map.localeCompare(b.map));
}

function render() {
  // Uketekst
  const idx0 = currentWeekIndex(new Date());
  const { start, end } = weekDates(idx0);
  const fmtNO = new Intl.DateTimeFormat("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const weekEl = document.querySelector("[data-week-label]");
  if (weekEl) {
    weekEl.textContent = `Uke ${idx0 + 1}: ${fmtNO.format(start)} – ${fmtNO.format(end)}`;
  }

  // Versjonstekst
  const updEl = document.querySelector("[data-update]");
  if (updEl) updEl.textContent = `Update ${UPDATE}`;

  // Tabell
  const tbody = document.querySelector("#rotation tbody");
  if (tbody) {
    const rows = probabilitiesForWeek(idx0);
    tbody.innerHTML = rows
      .map((r) => `<tr><td>${r.map}</td><td>${r.prob}%</td></tr>`)
      .join("");
  }
}

render();
})();
</script>

