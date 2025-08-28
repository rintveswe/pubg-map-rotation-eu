/*
 * This script determines the current week of the EU map rotation using
 * the schedule from PUBG's Map Service Report (Update 37.1). It then
 * calculates matchmaking probabilities for each map in that week and
 * populates the rotation table accordingly. The date calculations are
 * based on the PC schedule (Wednesday 02:00 UTC) and automatically
 * adjust every time the page is loaded.
 */

(() => {
  /**
   * Rotation data for Update 37.1. Each entry in the `weeks` array
   * corresponds to a week in the four‑week cycle. The `startDate`
   * should be updated whenever a new update is released.
   *
   * The dates below are in UTC; they translate to 04:00 CEST for
   * Oslo during August/September 2025. Adjust the startDate if
   * following a different region or schedule.
   */
  const rotation = {
    startDate: new Date('2025-08-13T02:00:00Z'),
    weeks: [
      {
        fixed: ['Erangel', 'Taego'],
        favored: ['Miramar', 'Vikendi'],
        etc: ['Paramo'],
      },
      {
        fixed: ['Erangel', 'Taego'],
        favored: ['Vikendi', 'Rondo'],
        etc: ['Deston'],
      },
      {
        fixed: ['Erangel', 'Taego'],
        favored: ['Rondo', 'Miramar'],
        etc: ['Karakin'],
      },
      {
        fixed: ['Erangel', 'Taego'],
        favored: ['Miramar', 'Vikendi'],
        etc: ['Deston'],
      },
    ],
  };

  /**
   * Determines the index of the current week in the rotation cycle.
   * If the current date is before the start date, it returns 0.
   * @param {Date} startDate
   * @returns {number}
   */
  function getCurrentWeek(startDate) {
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = now.getTime() - startDate.getTime();
    if (diffMs < 0) return 0;
    const diffDays = Math.floor(diffMs / msPerDay);
    const weekIndex = Math.floor(diffDays / 7) % rotation.weeks.length;
    return weekIndex;
  }

  /**
   * Populates the map table for the current week by calculating
   * approximate matchmaking probabilities. Each 8×8 km map is
   * assigned a weight of 2, while smaller maps are assigned a
   * weight of 1, following the rule stated in the Map Service
   * Report【446618686635954†L397-L449】. Probabilities are computed
   * from these weights and displayed as percentages.
   */
  function populateTable() {
    const weekIndex = getCurrentWeek(rotation.startDate);
    const week = rotation.weeks[weekIndex];

    // Flatten all maps from the current week's categories into a single array
    const maps = [...week.fixed, ...week.favored, ...week.etc];

    // Weight definitions: 8×8 km maps have weight 2, smaller maps have weight 1
    const weights = {
      Erangel: 2,
      Taego: 2,
      Miramar: 2,
      Vikendi: 2,
      Rondo: 2,
      Deston: 2,
      Paramo: 1,
      Karakin: 1,
    };

    // Compute total weight for the current rotation
    const totalWeight = maps.reduce((sum, name) => sum + (weights[name] ?? 2), 0);

    const tbody = document.getElementById('map-rows');
    // Clear any existing rows
    tbody.innerHTML = '';

    // Populate table rows with map names and their calculated probabilities
    maps.forEach((name) => {
      const weight = weights[name] ?? 2;
      const probability = ((weight / totalWeight) * 100).toFixed(1);
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      nameCell.textContent = name;
      const probCell = document.createElement('td');
      probCell.textContent = `${probability}%`;
      row.appendChild(nameCell);
      row.appendChild(probCell);
      tbody.appendChild(row);
    });
  }

  /**
   * Updates the heading for the current week, including week number
   * and the date range. The start date for each week is calculated
   * by adding weekIndex * 7 days to the rotation's startDate. The
   * end date is six days after the start date (inclusive), since
   * rotations change every Wednesday at 02:00 UTC. Dates are
   * formatted using the Norwegian locale for clarity.
   */
  function updateWeekInfo() {
    const weekIndex = getCurrentWeek(rotation.startDate);
    const weekStart = new Date(rotation.startDate.getTime() + weekIndex * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    // Format dates using Norwegian locale and Oslo timezone to avoid
    // off‑by‑one issues due to UTC offsets.
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Oslo' };
    const startStr = weekStart.toLocaleDateString('no-NO', options);
    const endStr = weekEnd.toLocaleDateString('no-NO', options);
    const weekInfoEl = document.getElementById('week-info');
    if (weekInfoEl) {
      weekInfoEl.textContent = `Week ${weekIndex + 1}: ${startStr} – ${endStr}`;
    }
  }

  /**
   * Attaches click handlers to enlargeable images. When an image is
   * clicked, it will display a larger version inside a modal overlay.
   * The modal can be closed by clicking the close button or the
   * backdrop.
   */
  function enableImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalClose = document.getElementById('modal-close');
    if (!modal || !modalImg || !modalClose) return;
    document.querySelectorAll('.enlargeable').forEach((img) => {
      img.addEventListener('click', () => {
        modalImg.src = img.src;
        modal.style.display = 'block';
      });
    });
    modalClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // Initialize rotation table and other UI elements on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    populateTable();
    updateWeekInfo();
    enableImageModal();
  });
})();
