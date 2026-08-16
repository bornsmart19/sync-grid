/* ==========================================================
   SyncGrid v2.0
   PHASE 3A
   Core Foundation + State + DOM + Basic Controls
========================================================== */

"use strict";

/* ==========================================================
   1. DOM HELPER
========================================================== */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* ==========================================================
   2. DOM REFERENCES
========================================================== */

/* ---------- Layout ---------- */

const sidebar = $("#sidebar");
const overlay = $("#overlay");
const menuBtn = $("#menuBtn");

/* ---------- Header ---------- */

const utcTime = $("#utcTime");
const themeToggle = $("#themeToggle");

/* ---------- Search ---------- */

const citySearch = $("#citySearch");
const addCityBtn = $("#addCity");
const searchSuggestions = $("#searchSuggestions");

/* ---------- Timeline ---------- */

const timelineWrapper = $("#timelineWrapper");
const timelineCursor = $("#timelineCursor");
const timelineHeader = $("#timelineHeader");
const timelineBody = $("#timelineBody");

const todayBtn = $("#todayBtn");
const resetBtn = $("#resetBtn");

/* ---------- Summary ---------- */

const bestMeetingTime = $("#bestMeetingTime");
const workingCount = $("#workingCount");
const awakeCount = $("#awakeCount");
const cursorTime = $("#cursorTime");

/* ---------- Dashboard ---------- */

const aiSummary = $("#aiSummary");

const workingNow = $("#workingNow");
const awakeNow = $("#awakeNow");
const sleepingNow = $("#sleepingNow");

const totalCities = $("#totalCities");
const timezoneCount = $("#timezoneCount");
const overlapHours = $("#overlapHours");
const teamCount = $("#teamCount");

const upcomingEvents = $("#upcomingEvents");

/* ---------- Sidebar ---------- */

const newTeamBtn = $("#newTeamBtn");
const sidebarAddCity = $("#sidebarAddCity");
const plannerBtn = $("#plannerBtn");
const settingsBtn = $("#settingsBtn");
const teamList = $("#teamList");

/* ==========================================================
   3. APPLICATION STATE
========================================================== */

const App = {
  version: "2.0",

  cities: [],

  selectedHour: null,

  cursorHour: null,

  currentDate: new Date(),

  theme: "dark",

  activeTeam: "Global",

  isInitialized: false,
};

/* ==========================================================
   4. STORAGE KEYS
========================================================== */

const STORAGE_KEYS = {
  cities: "syncgrid_cities",

  theme: "syncgrid_theme",

  activeTeam: "syncgrid_active_team",
};

/* ==========================================================
   5. CITY DATABASE
========================================================== */

const CITY_DATABASE = [
  {
    name: "New York",
    country: "USA",
    timezone: "America/New_York",
    workStart: 9,
    workEnd: 17,
    awakeStart: 7,
    awakeEnd: 23,
    workDays: [1, 2, 3, 4, 5],
  },

  {
    name: "London",
    country: "United Kingdom",
    timezone: "Europe/London",
    workStart: 9,
    workEnd: 17,
    awakeStart: 7,
    awakeEnd: 23,
    workDays: [1, 2, 3, 4, 5],
  },

  {
    name: "Mumbai",
    country: "India",
    timezone: "Asia/Kolkata",
    workStart: 9,
    workEnd: 18,
    awakeStart: 6,
    awakeEnd: 23,
    workDays: [1, 2, 3, 4, 5],
  },

  {
    name: "Dubai",
    country: "United Arab Emirates",
    timezone: "Asia/Dubai",
    workStart: 9,
    workEnd: 17,
    awakeStart: 6,
    awakeEnd: 22,
    workDays: [1, 2, 3, 4, 5],
  },

  {
    name: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo",
    workStart: 9,
    workEnd: 18,
    awakeStart: 6,
    awakeEnd: 22,
    workDays: [1, 2, 3, 4, 5],
  },

  {
    name: "Sydney",
    country: "Australia",
    timezone: "Australia/Sydney",
    workStart: 9,
    workEnd: 17,
    awakeStart: 6,
    awakeEnd: 22,
    workDays: [1, 2, 3, 4, 5],
  },

  {
    name: "Singapore",
    country: "Singapore",
    timezone: "Asia/Singapore",
    workStart: 9,
    workEnd: 18,
    awakeStart: 6,
    awakeEnd: 23,
    workDays: [1, 2, 3, 4, 5],
  },

  {
    name: "Berlin",
    country: "Germany",
    timezone: "Europe/Berlin",
    workStart: 9,
    workEnd: 17,
    awakeStart: 7,
    awakeEnd: 22,
    workDays: [1, 2, 3, 4, 5],
  },

  {
    name: "Los Angeles",
    country: "USA",
    timezone: "America/Los_Angeles",
    workStart: 9,
    workEnd: 17,
    awakeStart: 7,
    awakeEnd: 23,
    workDays: [1, 2, 3, 4, 5],
  },

  {
    name: "Toronto",
    country: "Canada",
    timezone: "America/Toronto",
    workStart: 9,
    workEnd: 17,
    awakeStart: 7,
    awakeEnd: 23,
    workDays: [1, 2, 3, 4, 5],
  },

  {
    name: "Paris",
    country: "France",
    timezone: "Europe/Paris",
    workStart: 9,
    workEnd: 17,
    awakeStart: 7,
    awakeEnd: 22,
    workDays: [1, 2, 3, 4, 5],
  },

  {
    name: "São Paulo",
    country: "Brazil",
    timezone: "America/Sao_Paulo",
    workStart: 9,
    workEnd: 18,
    awakeStart: 7,
    awakeEnd: 23,
    workDays: [1, 2, 3, 4, 5],
  },
];

/* ==========================================================
   6. DEFAULT CITIES
========================================================== */

const DEFAULT_CITY_NAMES = ["New York", "London", "Mumbai"];

/* ==========================================================
   7. BASIC UTILITIES
========================================================== */

function pad(value) {
  return String(value).padStart(2, "0");
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================
   8. STORAGE HELPERS
========================================================== */

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("SyncGrid storage error:", error);
  }
}

function loadFromStorage(key) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (error) {
    console.warn("SyncGrid storage read error:", error);

    return null;
  }
}

/* ==========================================================
   9. FIND CITY
========================================================== */

function findCity(cityName) {
  const target = normalize(cityName);

  return CITY_DATABASE.find((city) => normalize(city.name) === target) || null;
}

/* ==========================================================
   10. LOAD INITIAL CITIES
========================================================== */

function loadInitialCities() {
  const savedCities = loadFromStorage(STORAGE_KEYS.cities);

  if (Array.isArray(savedCities) && savedCities.length > 0) {
    App.cities = savedCities
      .map((city) => {
        const original = findCity(city.name);

        return original ? { ...original } : null;
      })
      .filter(Boolean);
  }

  if (App.cities.length === 0) {
    App.cities = DEFAULT_CITY_NAMES.map(findCity)
      .filter(Boolean)
      .map((city) => ({ ...city }));
  }
}

/* ==========================================================
   11. LOAD SAVED THEME
========================================================== */

function loadTheme() {
  const savedTheme = loadFromStorage(STORAGE_KEYS.theme);

  if (savedTheme === "light" || savedTheme === "dark") {
    App.theme = savedTheme;
  }
}

/* ==========================================================
   12. UTC CLOCK
========================================================== */

function updateUTCClock() {
  if (!utcTime) return;

  utcTime.textContent = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function startUTCClock() {
  updateUTCClock();

  setInterval(updateUTCClock, 1000);
}

/* ==========================================================
   13. MOBILE SIDEBAR
========================================================== */

function openSidebar() {
  if (!sidebar) return;

  sidebar.classList.add("open");

  if (overlay) {
    overlay.classList.add("show");
  }
}

function closeSidebar() {
  if (!sidebar) return;

  sidebar.classList.remove("open");

  if (overlay) {
    overlay.classList.remove("show");
  }
}

function toggleSidebar() {
  if (sidebar && sidebar.classList.contains("open")) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

if (menuBtn) {
  menuBtn.addEventListener("click", toggleSidebar);
}

if (overlay) {
  overlay.addEventListener("click", closeSidebar);
}

/* ==========================================================
   14. THEME STATE
========================================================== */

function applyTheme() {
  /*
       The current locked CSS is primarily dark-theme
       based. We keep the state ready here so the
       theme system can be expanded in a later phase.
    */

  document.documentElement.dataset.theme = App.theme;

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      App.theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  }
}

function toggleTheme() {
  App.theme = App.theme === "dark" ? "light" : "dark";

  saveToStorage(STORAGE_KEYS.theme, App.theme);

  applyTheme();
}

/* ==========================================================
   15. THEME BUTTON
========================================================== */

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

/* ==========================================================
   16. DASHBOARD FOUNDATION
========================================================== */

function updateBasicStats() {
  if (totalCities) {
    totalCities.textContent = App.cities.length;
  }

  if (timezoneCount) {
    const zones = new Set(App.cities.map((city) => city.timezone));

    timezoneCount.textContent = zones.size;
  }

  if (teamCount) {
    teamCount.textContent = teamList
      ? teamList.querySelectorAll(".team-item").length
      : 3;
  }
}

/* ==========================================================
   17. RESET BUTTON FOUNDATION
========================================================== */

function resetApplication() {
  App.selectedHour = null;

  App.cursorHour = null;

  App.currentDate = new Date();

  if (timelineWrapper) {
    timelineWrapper.scrollLeft = 0;
  }

  if (bestMeetingTime) {
    bestMeetingTime.textContent = "--";
  }

  if (cursorTime) {
    cursorTime.textContent = "--:--";
  }
}

if (resetBtn) {
  resetBtn.addEventListener("click", resetApplication);
}

/* ==========================================================
   18. TODAY BUTTON
========================================================== */

if (todayBtn) {
  todayBtn.addEventListener("click", () => {
    App.currentDate = new Date();

    if (timelineWrapper) {
      timelineWrapper.scrollLeft = 0;
    }
  });
}

/* ==========================================================
   19. SIDEBAR ADD-CITY BUTTON
========================================================== */

if (sidebarAddCity) {
  sidebarAddCity.addEventListener("click", () => {
    if (citySearch) {
      citySearch.focus();
    }

    closeSidebar();
  });
}

/* ==========================================================
   20. INITIALIZE FOUNDATION
========================================================== */

function initializeSyncGrid() {
  loadTheme();

  loadInitialCities();

  applyTheme();

  startUTCClock();

  updateBasicStats();

  App.isInitialized = true;
}

/* ==========================================================
   START APPLICATION
========================================================== */

initializeSyncGrid();

/* ==========================================================
   END OF PHASE 3A
   CONTINUE WITH PHASE 3B
========================================================== */
/* ==========================================================
   SyncGrid v2.0
   PHASE 3B
   Timezone Engine + Timeline Renderer
========================================================== */

/* ==========================================================
   1. TIMEZONE UTILITIES
========================================================== */

function getCityDate(city) {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: city.timezone,
    }),
  );
}

function getLocalHour(city) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: city.timezone,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = parts.find((part) => part.type === "hour");

  return Number(hour.value);
}

function getLocalMinute(city) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: city.timezone,
    minute: "2-digit",
  }).formatToParts(new Date());

  const minute = parts.find((part) => part.type === "minute");

  return Number(minute.value);
}

function getLocalTime(city) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: city.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/* ==========================================================
   2. STATUS ENGINE
========================================================== */

function getStatus(city, hour, dayOfWeek = null) {
  /*
     Work status requires BOTH:
     1. Local time is inside working hours.
     2. Local day is a configured workday.
  */

  const isWorkDay =
    dayOfWeek === null ||
    !Array.isArray(city.workDays) ||
    city.workDays.includes(dayOfWeek);

  if (
    isWorkDay &&
    hour >= city.workStart &&
    hour < city.workEnd
  ) {
    return {
      type: "work",
      label: "Working",
    };
  }

  if (
    hour >= city.awakeStart &&
    hour < city.awakeEnd
  ) {
    return {
      type: "awake",
      label: "Awake",
    };
  }

  return {
    type: "sleep",
    label: "Sleeping",
  };
}

/* ==========================================================
   3. STATUS DESCRIPTION
========================================================== */

function getStatusDescription(city, hour) {
  const status = getStatus(city, hour);

  return city.name + " • " + pad(hour) + ":00 • " + status.label;
}

/* ==========================================================
   4. TIMELINE HEADER
========================================================== */

function renderTimelineHeader() {
  if (!timelineHeader) return;

  timelineHeader.innerHTML = "";

  const cityLabel = document.createElement("div");

  cityLabel.className = "timeline-city-header";

  cityLabel.textContent = "City / Time";

  timelineHeader.appendChild(cityLabel);

  for (let hour = 0; hour < 24; hour++) {
    const cell = document.createElement("div");

    cell.className = "timeline-hour-label";

    cell.dataset.hour = String(hour);

    cell.textContent = pad(hour) + ":00";

    timelineHeader.appendChild(cell);
  }
}

/* ==========================================================
   5. CITY ROW CREATOR
========================================================== */

function createTimelineRow(city) {
  const row = document.createElement("div");

  row.className = "timeline-row";

  row.dataset.city = city.name;

  /* ---------- City label ---------- */

  const cityLabel = document.createElement("div");

  cityLabel.className = "city-name";

  cityLabel.innerHTML = `

        <div>

            <strong>
                ${escapeHTML(city.name)}
            </strong>

            <br>

            <small>
                ${escapeHTML(city.country)}
            </small>

        </div>

    `;

  row.appendChild(cityLabel);

  /* ---------- 24 hours ---------- */

  for (let hour = 0; hour < 24; hour++) {
    const status = getStatus(city, hour);

    const cell = document.createElement("div");

    cell.className = "hour " + status.type;

    cell.dataset.hour = String(hour);

    cell.dataset.city = city.name;

    cell.setAttribute("title", getStatusDescription(city, hour));

    cell.setAttribute("role", "button");

    cell.setAttribute("aria-label", getStatusDescription(city, hour));

    row.appendChild(cell);
  }

  return row;
}

/* ==========================================================
   6. RENDER TIMELINE BODY
========================================================== */

function renderTimelineBody() {
  if (!timelineBody) return;

  timelineBody.innerHTML = "";

  if (App.cities.length === 0) {
    const empty = document.createElement("div");

    empty.className = "empty-state";

    empty.textContent = "No cities added yet.";

    timelineBody.appendChild(empty);

    return;
  }

  App.cities.forEach((city) => {
    const row = createTimelineRow(city);

    timelineBody.appendChild(row);
  });
}

/* ==========================================================
   7. COMPLETE TIMELINE RENDER
========================================================== */

function renderTimeline() {
  renderTimelineHeader();

  renderTimelineBody();
}

/* ==========================================================
   8. LIVE CITY STATUS COUNTERS
========================================================== */

function updateLiveStatus() {
  let working = 0;
  let awake = 0;
  let sleeping = 0;

  App.cities.forEach((city) => {
    const hour = getLocalHour(city);

    const status = getStatus(city, hour);

    if (status.type === "work") {
      working++;
    } else if (status.type === "awake") {
      awake++;
    } else {
      sleeping++;
    }
  });

  if (workingNow) {
    workingNow.textContent = working;
  }

  if (awakeNow) {
    awakeNow.textContent = awake;
  }

  if (sleepingNow) {
    sleepingNow.textContent = sleeping;
  }

  if (workingCount) {
    workingCount.textContent = working;
  }

  if (awakeCount) {
    awakeCount.textContent = awake;
  }
}

/* ==========================================================
   9. CURRENT LOCAL TIME REFRESH
========================================================== */

function refreshTimelineStatus() {
  if (!App.isInitialized) return;

  updateLiveStatus();
}

/* ==========================================================
   10. TIMELINE HOUR HOVER
========================================================== */

function handleTimelineHover(event) {
  const cell = event.target.closest(".hour");

  if (!cell) return;

  const hour = Number(cell.dataset.hour);

  if (Number.isNaN(hour)) return;

  App.selectedHour = hour;
}

/* ==========================================================
   11. TIMELINE CELL CLICK
========================================================== */

function handleTimelineClick(event) {
  const cell = event.target.closest(".hour");

  if (!cell) return;

  const hour = Number(cell.dataset.hour);

  if (Number.isNaN(hour)) return;

  App.selectedHour = hour;

  if (cursorTime) {
    cursorTime.textContent = pad(hour) + ":00";
  }
}

/* ==========================================================
   12. TIMELINE EVENTS
========================================================== */

if (timelineBody) {
  timelineBody.addEventListener("mouseover", handleTimelineHover);

  timelineBody.addEventListener("click", handleTimelineClick);
}

/* ==========================================================
   13. UPDATE DASHBOARD FOUNDATIONS
========================================================== */

function updateTimelineDashboard() {
  updateBasicStats();

  updateLiveStatus();
}

/* ==========================================================
   14. INITIAL TIMELINE
========================================================== */

renderTimeline();

updateTimelineDashboard();

/* ==========================================================
   15. PERIODIC REFRESH
========================================================== */

setInterval(refreshTimelineStatus, 60000);

/* ==========================================================
   END OF PHASE 3B
   CONTINUE WITH PHASE 3C
========================================================== */
/* ==========================================================
   SyncGrid v2.0
   PHASE 3C
   City Search + Autocomplete + City Management
========================================================== */

/* ==========================================================
   1. SEARCH DATABASE
========================================================== */

function searchCityDatabase(query) {
  const keyword = normalize(query);

  if (!keyword) {
    return [];
  }

  return CITY_DATABASE.filter((city) => {
    const cityName = normalize(city.name);

    const country = normalize(city.country);

    return cityName.includes(keyword) || country.includes(keyword);
  });
}

/* ==========================================================
   2. CHECK IF CITY EXISTS
========================================================== */

function cityAlreadyAdded(cityName) {
  const target = normalize(cityName);

  return App.cities.some((city) => {
    return normalize(city.name) === target;
  });
}

/* ==========================================================
   3. RENDER SEARCH SUGGESTIONS
========================================================== */

function renderSearchSuggestions(results) {
  if (!searchSuggestions) return;

  searchSuggestions.innerHTML = "";

  if (!results || results.length === 0) {
    searchSuggestions.classList.remove("show");

    return;
  }

  results.forEach((city) => {
    const item = document.createElement("div");

    item.className = "suggestion-item";

    const alreadyAdded = cityAlreadyAdded(city.name);

    item.innerHTML = `

            <strong>
                ${escapeHTML(city.name)}
            </strong>

            <span>
                ${alreadyAdded ? "Added" : escapeHTML(city.country)}
            </span>

        `;

    if (alreadyAdded) {
      item.style.opacity = "0.55";
    } else {
      item.addEventListener("click", () => {
        selectSearchCity(city);
      });
    }

    searchSuggestions.appendChild(item);
  });

  searchSuggestions.classList.add("show");
}

/* ==========================================================
   4. SELECT SEARCH RESULT
========================================================== */

function selectSearchCity(city) {
  if (!citySearch) return;

  citySearch.value = city.name;

  if (searchSuggestions) {
    searchSuggestions.classList.remove("show");
  }

  citySearch.focus();
}

/* ==========================================================
   5. SEARCH INPUT
========================================================== */

function handleCitySearch() {
  if (!citySearch) return;

  const query = citySearch.value;

  if (!query.trim()) {
    if (searchSuggestions) {
      searchSuggestions.classList.remove("show");
    }

    return;
  }

  const results = searchCityDatabase(query);

  renderSearchSuggestions(results);
}

if (citySearch) {
  citySearch.addEventListener("input", handleCitySearch);
}

/* ==========================================================
   6. ADD CITY
========================================================== */

function addCity(city) {
  if (!city) {
    return false;
  }

  if (cityAlreadyAdded(city.name)) {
    return false;
  }

  App.cities.push({
    ...city,
  });

  saveToStorage(STORAGE_KEYS.cities, App.cities);

  updateBasicStats();

  renderTimeline();

  updateLiveStatus();

  return true;
}

/* ==========================================================
   7. ADD CITY FROM INPUT
========================================================== */

function addCityFromInput() {
  if (!citySearch) return;

  const query = normalize(citySearch.value);

  if (!query) {
    citySearch.focus();

    return;
  }

  let city = CITY_DATABASE.find((item) => normalize(item.name) === query);

  if (!city) {
    const matches = searchCityDatabase(query);

    if (matches.length === 1) {
      city = matches[0];
    }
  }

  if (!city) {
    citySearch.value = "";

    citySearch.placeholder = "City not found — try again";

    setTimeout(() => {
      citySearch.placeholder = "Search city...";
    }, 1800);

    return;
  }

  const added = addCity(city);

  if (added) {
    citySearch.value = "";

    if (searchSuggestions) {
      searchSuggestions.classList.remove("show");
    }
  } else {
    citySearch.value = city.name;

    citySearch.select();
  }
}

/* ==========================================================
   8. ADD BUTTON
========================================================== */

if (addCityBtn) {
  addCityBtn.addEventListener("click", addCityFromInput);
}

/* ==========================================================
   9. ENTER KEY
========================================================== */

if (citySearch) {
  citySearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      addCityFromInput();
    }

    if (event.key === "Escape") {
      if (searchSuggestions) {
        searchSuggestions.classList.remove("show");
      }

      citySearch.blur();
    }
  });
}

/* ==========================================================
   10. REMOVE CITY
========================================================== */

function removeCity(cityName) {
  const target = normalize(cityName);

  const originalLength = App.cities.length;

  App.cities = App.cities.filter((city) => normalize(city.name) !== target);

  if (App.cities.length === originalLength) {
    return false;
  }

  saveToStorage(STORAGE_KEYS.cities, App.cities);

  updateBasicStats();

  renderTimeline();

  updateLiveStatus();

  return true;
}

/* ==========================================================
   11. CITY ROW CONTEXT MENU
========================================================== */

if (timelineBody) {
  timelineBody.addEventListener("contextmenu", (event) => {
    const row = event.target.closest(".timeline-row");

    if (!row) return;

    event.preventDefault();

    const cityName = row.dataset.city;

    if (!cityName) return;

    const confirmed = window.confirm(`Remove ${cityName} from SyncGrid?`);

    if (confirmed) {
      removeCity(cityName);
    }
  });
}

/* ==========================================================
   12. CLOSE SEARCH WHEN CLICKING OUTSIDE
========================================================== */

document.addEventListener("click", (event) => {
  if (!citySearch || !searchSuggestions) {
    return;
  }

  const searchWrapper = citySearch.closest(".search-wrapper");

  if (searchWrapper && !searchWrapper.contains(event.target)) {
    searchSuggestions.classList.remove("show");
  }
});

/* ==========================================================
   13. SIDEBAR ADD-CITY ACTION
========================================================== */

if (sidebarAddCity) {
  sidebarAddCity.addEventListener("click", () => {
    if (citySearch) {
      citySearch.focus();

      citySearch.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    closeSidebar();
  });
}

/* ==========================================================
   14. SAVE CURRENT STATE
========================================================== */

function saveCurrentCities() {
  saveToStorage(STORAGE_KEYS.cities, App.cities);
}

/* ==========================================================
   15. REFRESH CITY DATA
========================================================== */

function refreshCityData() {
  updateBasicStats();

  renderTimeline();

  updateLiveStatus();
}

/* ==========================================================
   16. FINAL INITIAL REFRESH
========================================================== */

saveCurrentCities();

refreshCityData();

/* ==========================================================
   END OF PHASE 3C
   CONTINUE WITH PHASE 3D
========================================================== */
/* ==========================================================
   SyncGrid v2.0
   PHASE 3D
   Interactive Cursor + Global Overlap Engine
========================================================== */

/* ==========================================================
   1. UTC HOUR → CITY LOCAL HOUR
========================================================== */

function getLocalHourForUTC(city, utcHour) {
  const now = new Date();

  const utcDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      utcHour,
      0,
      0,
    ),
  );

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: city.timezone,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(utcDate);

  const hourPart = parts.find((part) => part.type === "hour");

  return Number(hourPart.value);
}

/* ==========================================================
   2. GET CITY STATUS AT UTC HOUR
========================================================== */

function getCityStatusAtUTC(city, utcHour) {
  const localHour = getLocalHourForUTC(city, utcHour);

  return {
    localHour,

    ...getStatus(city, localHour),
  };
}

/* ==========================================================
   3. GLOBAL HOUR ANALYSIS
========================================================== */

function analyzeGlobalHour(utcHour) {
  let working = 0;

  let awake = 0;

  let sleeping = 0;

  App.cities.forEach((city) => {
    const status = getCityStatusAtUTC(city, utcHour);

    if (status.type === "work") {
      working++;
    } else if (status.type === "awake") {
      awake++;
    } else {
      sleeping++;
    }
  });

  const total = App.cities.length;

  const everyoneAwake = total > 0 && sleeping === 0;

  const everyoneWorking = total > 0 && working === total;

  const available = everyoneAwake;

  return {
    utcHour,

    working,

    awake,

    sleeping,

    total,

    everyoneAwake,

    everyoneWorking,

    available,
  };
}

/* ==========================================================
   4. ANALYZE ALL 24 UTC HOURS
========================================================== */

function analyzeGlobalDay() {
  const results = [];

  for (let hour = 0; hour < 24; hour++) {
    results.push(analyzeGlobalHour(hour));
  }

  return results;
}

/* ==========================================================
   5. MEETING SCORE
========================================================== */

function getMeetingScore(result) {
  if (!result || result.total === 0) {
    return -Infinity;
  }

  /*
       Highest priority:
       1. Everyone working
       2. Everyone awake
       3. Maximum number working
       4. Maximum number awake
       5. Fewer sleeping
    */

  let score = 0;

  if (result.everyoneWorking) {
    score += 1000;
  }

  if (result.everyoneAwake) {
    score += 500;
  }

  score += result.working * 50;

  score += result.awake * 10;

  score -= result.sleeping * 100;

  return score;
}

/* ==========================================================
   6. FIND BEST MEETING HOUR
========================================================== */

function findBestMeetingHour() {
  if (!App.cities || App.cities.length === 0) {
    return null;
  }

  const results = analyzeGlobalDay();

  let best = results[0];

  results.forEach((result) => {
    if (getMeetingScore(result) > getMeetingScore(best)) {
      best = result;
    }
  });

  return best;
}

/* ==========================================================
   7. FORMAT UTC TIME
========================================================== */

function formatUTCLabel(hour) {
  return pad(hour) + ":00 UTC";
}

/* ==========================================================
   8. FORMAT CITY LOCAL TIMES
========================================================== */

function getMeetingTimeDetails(utcHour) {
  return App.cities.map((city) => {
    const localHour = getLocalHourForUTC(city, utcHour);

    const status = getStatus(city, localHour);

    return {
      city: city.name,

      localHour,

      time: pad(localHour) + ":00",

      status: status.label,

      statusType: status.type,
    };
  });
}

/* ==========================================================
   9. UPDATE BEST MEETING CARD
========================================================== */

function updateBestMeetingTime() {
  if (!bestMeetingTime || App.cities.length === 0) {
    return null;
  }

  const best = findBestMeetingHour();

  if (!best) {
    bestMeetingTime.textContent = "--";

    return null;
  }

  bestMeetingTime.textContent = formatUTCLabel(best.utcHour);

  return best;
}

/* ==========================================================
   10. OVERLAP WINDOW CALCULATION
========================================================== */

function calculateOverlapHours() {
  if (App.cities.length === 0) {
    return 0;
  }

  const results = analyzeGlobalDay();

  /*
       An overlap hour means that nobody
       is sleeping during that hour.
    */

  return results.filter((result) => result.everyoneAwake).length;
}

/* ==========================================================
   11. UPDATE OVERLAP STAT
========================================================== */

function updateOverlapStat() {
  if (!overlapHours) return;

  const hours = calculateOverlapHours();

  overlapHours.textContent = hours + "h";
}

/* ==========================================================
   12. UPDATE MEETING DASHBOARD
========================================================== */

function updateMeetingDashboard() {
  const best = updateBestMeetingTime();

  updateOverlapStat();

  if (!aiSummary) return;

  if (!best) {
    aiSummary.textContent =
      "Add at least one city to find an ideal meeting window.";

    return;
  }

  const total = App.cities.length;

  if (best.everyoneWorking) {
    aiSummary.textContent = `Excellent overlap. All ${total} cities are within working hours at ${formatUTCLabel(best.utcHour)}.`;

    return;
  }

  if (best.everyoneAwake) {
    aiSummary.textContent = `Good availability. Everyone is awake at ${formatUTCLabel(best.utcHour)}, with ${best.working} of ${total} cities inside working hours.`;

    return;
  }

  aiSummary.textContent = `Best available window: ${formatUTCLabel(best.utcHour)}. ${best.working} of ${total} cities are working and ${best.awake} are awake.`;
}

/* ==========================================================
   13. CURSOR POSITION
========================================================== */

function positionTimelineCursor(hour) {
  if (!timelineCursor || !timelineWrapper) {
    return;
  }

  const cells = timelineBody ? timelineBody.querySelectorAll(".hour") : [];

  if (!cells.length) return;

  /*
       Use the first city's row as the
       horizontal reference for the cursor.
    */

  const referenceCell = Array.from(cells).find(
    (cell) => Number(cell.dataset.hour) === hour,
  );

  if (!referenceCell) return;

  const wrapperRect = timelineWrapper.getBoundingClientRect();

  const cellRect = referenceCell.getBoundingClientRect();

  const left = cellRect.left - wrapperRect.left + timelineWrapper.scrollLeft;

  timelineCursor.style.left = `${left}px`;

  timelineCursor.classList.add("active");
}

/* ==========================================================
   14. SET CURSOR HOUR
========================================================== */

function setCursorHour(hour) {
  hour = Math.max(0, Math.min(23, Number(hour)));

  App.cursorHour = hour;

  positionTimelineCursor(hour);

  if (cursorTime) {
    cursorTime.textContent = formatUTCLabel(hour);
  }

  highlightCursorHour(hour);

  updateCursorInformation(hour);
}

/* ==========================================================
   15. HIGHLIGHT SELECTED HOUR
========================================================== */

function highlightCursorHour(hour) {
  if (!timelineBody) return;

  const cells = timelineBody.querySelectorAll(".hour");

  cells.forEach((cell) => {
    const cellHour = Number(cell.dataset.hour);

    cell.classList.toggle("selected-hour", cellHour === hour);
  });
}

/* ==========================================================
   16. CURSOR INFORMATION
========================================================== */

function updateCursorInformation(utcHour) {
  const result = analyzeGlobalHour(utcHour);

  if (!result) return;

  if (workingCount) {
    workingCount.textContent = result.working;
  }

  if (awakeCount) {
    awakeCount.textContent = result.awake;
  }

  if (cursorTime) {
    cursorTime.textContent = formatUTCLabel(utcHour);
  }
}

/* ==========================================================
   17. TIMELINE MOUSE MOVE
========================================================== */

function handleTimelinePointerMove(event) {
  if (!timelineBody) return;

  const cell = event.target.closest(".hour");

  if (!cell) return;

  const hour = Number(cell.dataset.hour);

  if (Number.isNaN(hour)) return;

  setCursorHour(hour);
}

/* ==========================================================
   18. TIMELINE CLICK
========================================================== */

function handleTimelineCursorClick(event) {
  const cell = event.target.closest(".hour");

  if (!cell) return;

  const hour = Number(cell.dataset.hour);

  if (Number.isNaN(hour)) return;

  App.selectedHour = hour;

  setCursorHour(hour);
}

/* ==========================================================
   19. TIMELINE EVENTS
========================================================== */

if (timelineBody) {
  timelineBody.addEventListener("mousemove", handleTimelinePointerMove);

  timelineBody.addEventListener("click", handleTimelineCursorClick);
}

/* ==========================================================
   20. CURSOR DRAG SUPPORT
========================================================== */

if (timelineWrapper) {
  timelineWrapper.addEventListener("mouseleave", () => {
    if (App.cursorHour === null) {
      return;
    }

    positionTimelineCursor(App.cursorHour);
  });
}

/* ==========================================================
   21. KEYBOARD HOUR CONTROL
========================================================== */

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select")) {
    return;
  }

  if (event.key === "ArrowLeft") {
    const current = App.cursorHour === null ? 0 : App.cursorHour;

    setCursorHour(current - 1);
  }

  if (event.key === "ArrowRight") {
    const current = App.cursorHour === null ? 0 : App.cursorHour;

    setCursorHour(current + 1);
  }

  if (event.key === "Home") {
    setCursorHour(0);
  }

  if (event.key === "End") {
    setCursorHour(23);
  }
});

/* ==========================================================
   22. KEEP CURSOR ALIGNED AFTER SCROLL
========================================================== */

if (timelineWrapper) {
  timelineWrapper.addEventListener("scroll", () => {
    if (App.cursorHour !== null) {
      requestAnimationFrame(() => {
        positionTimelineCursor(App.cursorHour);
      });
    }
  });
}

/* ==========================================================
   23. REBUILD MEETING DATA
========================================================== */

function refreshMeetingEngine() {
  updateMeetingDashboard();

  if (App.cursorHour !== null) {
    setCursorHour(App.cursorHour);
  }
}

/* ==========================================================
   24. INITIAL MEETING CALCULATION
========================================================== */

refreshMeetingEngine();

/* ==========================================================
   25. REFRESH AFTER CITY CHANGES
========================================================== */

const originalRefreshCityData =
  typeof refreshCityData === "function" ? refreshCityData : null;

function refreshCityDataWithMeetingEngine() {
  if (originalRefreshCityData) {
    originalRefreshCityData();
  }

  refreshMeetingEngine();
}

/* ==========================================================
   26. LIVE MEETING REFRESH
========================================================== */

setInterval(refreshMeetingEngine, 60000);

/* ==========================================================
   END OF PHASE 3D
   CONTINUE WITH PHASE 3E
========================================================== */
/* ==========================================================
   SyncGrid v2.0
   PHASE 3E
   Dashboard Intelligence + Meeting Recommendation
========================================================== */

/* ==========================================================
   1. GET ALL HOURLY ANALYSIS
========================================================== */

function getDailyAnalysis() {
  const results = [];

  for (let hour = 0; hour < 24; hour++) {
    results.push(analyzeGlobalHour(hour));
  }

  return results;
}

/* ==========================================================
   2. FIND ALL USABLE WINDOWS
========================================================== */

function getUsableWindows() {
  const analysis = getDailyAnalysis();

  return analysis.filter((result) => result.everyoneAwake);
}

/* ==========================================================
   3. GROUP CONSECUTIVE HOURS
========================================================== */

function groupConsecutiveHours(hours) {
  if (!hours.length) {
    return [];
  }

  const groups = [];

  let current = [hours[0]];

  for (let i = 1; i < hours.length; i++) {
    if (hours[i] === hours[i - 1] + 1) {
      current.push(hours[i]);
    } else {
      groups.push([...current]);

      current = [hours[i]];
    }
  }

  groups.push([...current]);

  return groups;
}

/* ==========================================================
   4. GET OVERLAP WINDOWS
========================================================== */

function calculateOverlapWindows() {
  const usable = getUsableWindows();

  const hours = usable.map((item) => item.utcHour);

  const groups = groupConsecutiveHours(hours);

  return groups.map((group) => {
    const start = group[0];

    const end = group[group.length - 1] + 1;

    return {
      start,

      end,

      duration: group.length,
    };
  });
}

/* ==========================================================
   5. FORMAT HOUR RANGE
========================================================== */

function formatHourRange(start, end) {
  const startText = pad(start % 24) + ":00";

  const endText = pad(end % 24) + ":00";

  return startText + "–" + endText + " UTC";
}

/* ==========================================================
   6. SCORE OVERLAP WINDOW
========================================================== */

function scoreWindow(window) {
  const middle = Math.floor((window.start + window.end - 1) / 2);

  const middleAnalysis = analyzeGlobalHour(middle % 24);

  let score = window.duration * 100;

  score += middleAnalysis.working * 30;

  score += middleAnalysis.awake * 10;

  score -= middleAnalysis.sleeping * 100;

  /*
       Prefer windows with a strong
       working-hour overlap.
    */

  if (middleAnalysis.everyoneWorking) {
    score += 1000;
  }

  return score;
}

/* ==========================================================
   7. FIND BEST WINDOW
========================================================== */

function findBestWindow() {
  const windows = calculateOverlapWindows();

  if (!windows.length) {
    return null;
  }

  let best = windows[0];

  windows.forEach((window) => {
    if (scoreWindow(window) > scoreWindow(best)) {
      best = window;
    }
  });

  return best;
}

/* ==========================================================
   8. GET BEST WINDOW DETAILS
========================================================== */

function getBestWindowDetails() {
  const window = findBestWindow();

  if (!window) {
    return null;
  }

  const middle = Math.floor((window.start + window.end - 1) / 2);

  const analysis = analyzeGlobalHour(middle % 24);

  return {
    ...window,

    middle,

    analysis,
  };
}

/* ==========================================================
   9. UPDATE OVERLAP CARD
========================================================== */

function updateOverlapCard() {
  if (!overlapHours) {
    return;
  }

  const windows = calculateOverlapWindows();

  const totalHours = windows.reduce(
    (total, window) => total + window.duration,
    0,
  );

  overlapHours.textContent = totalHours + "h";
}

/* ==========================================================
   10. UPDATE BEST MEETING CARD
========================================================== */

function updateBestMeetingCard() {
  if (!bestMeetingTime) {
    return;
  }

  const best = getBestWindowDetails();

  if (!best) {
    bestMeetingTime.textContent = "No overlap";

    return;
  }

  bestMeetingTime.textContent = formatHourRange(best.start, best.end);
}

/* ==========================================================
   11. BUILD CITY TIME SUMMARY
========================================================== */

function buildCitySummary(utcHour) {
  return App.cities.map((city) => {
    const data = getCityStatusAtUTC(city, utcHour);

    return {
      city: city.name,

      localHour: data.localHour,

      status: data.label,

      statusType: data.type,
    };
  });
}

/* ==========================================================
   12. GENERATE SMART SUMMARY
========================================================== */

function generateSmartSummary() {
  if (!aiSummary) {
    return;
  }

  if (App.cities.length === 0) {
    aiSummary.textContent = "Add cities to discover the best time to connect.";

    return;
  }

  const best = getBestWindowDetails();

  if (!best) {
    aiSummary.textContent =
      "There is no hour when everyone is awake. Try adjusting the cities or working hours.";

    return;
  }

  const working = best.analysis.working;

  const awake = best.analysis.awake;

  const total = best.analysis.total;

  if (best.analysis.everyoneWorking) {
    aiSummary.textContent = `Perfect overlap: all ${total} cities are working during ${formatHourRange(best.start, best.end)}.`;

    return;
  }

  if (working === total) {
    aiSummary.textContent = `Strong meeting window: everyone is working around ${pad(best.middle)}:00 UTC.`;

    return;
  }

  if (best.analysis.everyoneAwake) {
    aiSummary.textContent = `Everyone is awake during ${formatHourRange(best.start, best.end)}. ${working} of ${total} cities are in working hours.`;

    return;
  }

  aiSummary.textContent = `Best available window: ${formatHourRange(best.start, best.end)} with ${working} working and ${awake} awake.`;
}

/* ==========================================================
   13. UPDATE LIVE STATUS CARDS
========================================================== */

function updateStatusCards() {
  let working = 0;

  let awake = 0;

  let sleeping = 0;

  App.cities.forEach((city) => {
    const localHour = getLocalHour(city);

    const status = getStatus(city, localHour);

    if (status.type === "work") {
      working++;
    } else if (status.type === "awake") {
      awake++;
    } else {
      sleeping++;
    }
  });

  if (workingNow) {
    workingNow.textContent = working;
  }

  if (awakeNow) {
    awakeNow.textContent = awake;
  }

  if (sleepingNow) {
    sleepingNow.textContent = sleeping;
  }
}

/* ==========================================================
   14. UPDATE MAIN DASHBOARD
========================================================== */

function updateIntelligenceDashboard() {
  updateBasicStats();

  updateStatusCards();

  updateOverlapCard();

  updateBestMeetingCard();

  generateSmartSummary();
}

/* ==========================================================
   15. CURSOR-SPECIFIC INTELLIGENCE
========================================================== */

function updateCursorDashboard() {
  if (App.cursorHour === null) {
    return;
  }

  const analysis = analyzeGlobalHour(App.cursorHour);

  if (!analysis) {
    return;
  }

  if (workingCount) {
    workingCount.textContent = analysis.working;
  }

  if (awakeCount) {
    awakeCount.textContent = analysis.awake;
  }

  if (cursorTime) {
    cursorTime.textContent = formatUTCLabel(App.cursorHour);
  }
}

/* ==========================================================
   16. ENHANCE CURSOR UPDATE
========================================================== */

const previousCursorUpdater =
  typeof updateCursorInformation === "function"
    ? updateCursorInformation
    : null;

function updateEnhancedCursorInformation(utcHour) {
  if (previousCursorUpdater) {
    previousCursorUpdater(utcHour);
  }

  updateCursorDashboard();
}

/* ==========================================================
   17. BEST WINDOW → CURSOR
========================================================== */

function jumpToBestMeetingWindow() {
  const best = getBestWindowDetails();

  if (!best) {
    return;
  }

  setCursorHour(best.middle);
}

/* ==========================================================
   18. TODAY BUTTON INTELLIGENCE
========================================================== */

if (todayBtn) {
  todayBtn.addEventListener("click", () => {
    setTimeout(() => {
      updateIntelligenceDashboard();
    }, 0);
  });
}

/* ==========================================================
   19. RESET INTELLIGENCE
========================================================== */

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    setTimeout(() => {
      updateIntelligenceDashboard();
    }, 0);
  });
}

/* ==========================================================
   20. REFRESH INTELLIGENCE AFTER CITY CHANGES
========================================================== */

const previousCityRefresh =
  typeof refreshCityData === "function" ? refreshCityData : null;

function refreshAllCityData() {
  if (previousCityRefresh) {
    previousCityRefresh();
  }

  renderTimeline();

  updateIntelligenceDashboard();
}

/* ==========================================================
   21. WINDOW RESIZE
========================================================== */

window.addEventListener("resize", () => {
  if (App.cursorHour !== null) {
    requestAnimationFrame(() => {
      positionTimelineCursor(App.cursorHour);
    });
  }
});

/* ==========================================================
   22. INITIAL DASHBOARD UPDATE
========================================================== */

updateIntelligenceDashboard();

/* ==========================================================
   23. LIVE DASHBOARD REFRESH
========================================================== */

setInterval(() => {
  updateStatusCards();

  updateIntelligenceDashboard();
}, 60000);

/* ==========================================================
   END OF PHASE 3E
   CONTINUE WITH PHASE 3F
========================================================== */
/* ==========================================================
   SyncGrid v2.0
   PHASE 3F
   Teams + Planner + Settings + Saved State
========================================================== */

/* ==========================================================
   1. TEAM STORAGE
========================================================== */

const SG_TEAM_STORAGE_KEY = "syncgrid_saved_teams";

/* ==========================================================
   2. DEFAULT TEAMS
========================================================== */

const SG_DEFAULT_TEAMS = [
  {
    id: "global",
    name: "Global",
    icon: "🌍",
    cities: ["New York", "London", "Mumbai"],
  },

  {
    id: "developers",
    name: "Developers",
    icon: "💻",
    cities: ["New York", "London", "Tokyo"],
  },

  {
    id: "designers",
    name: "Designers",
    icon: "🎨",
    cities: ["London", "Mumbai", "Dubai"],
  },
];

/* ==========================================================
   3. LOAD TEAMS
========================================================== */

function sgLoadTeams() {
  const saved = loadFromStorage(SG_TEAM_STORAGE_KEY);

  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }

  return SG_DEFAULT_TEAMS.map((team) => ({
    ...team,
    cities: [...team.cities],
  }));
}

/* ==========================================================
   4. SAVE TEAMS
========================================================== */

function sgSaveTeams() {
  saveToStorage(SG_TEAM_STORAGE_KEY, App.savedTeams);
}

/* ==========================================================
   5. INITIALIZE TEAM STATE
========================================================== */

if (!Array.isArray(App.savedTeams) || App.savedTeams.length === 0) {
  App.savedTeams = sgLoadTeams();
}

/* ==========================================================
   6. CREATE TEAM ID
========================================================== */

function sgCreateTeamId(name) {
  return (
    normalize(name)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Date.now()
  );
}

/* ==========================================================
   7. RENDER SAVED TEAMS
========================================================== */

function sgRenderTeams() {
  if (!teamList) return;

  teamList.innerHTML = "";

  App.savedTeams.forEach((team) => {
    const row = document.createElement("div");

    row.className = "team-item-row";

    const button = document.createElement("button");

    button.type = "button";
    button.className = "team-item";

    if (team.name === App.activeTeam) {
      button.classList.add("active");
    }

    button.dataset.teamId = team.id;
    button.innerHTML = `
      <span class="team-name">
        ${team.icon} ${team.name}
      </span>
    `;

    button.addEventListener("click", () => {
      sgActivateTeam(team.id);
    });

    row.appendChild(button);

    // Only custom teams can be deleted
    const isDefaultTeam =
      team.id === "global" ||
      team.id === "developers" ||
      team.id === "designers";

    if (!isDefaultTeam) {
      const deleteButton = document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className = "team-delete-btn";
      deleteButton.textContent = "×";
      deleteButton.title = `Delete ${team.name}`;

      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        sgDeleteTeam(team.id);
      });

      row.appendChild(deleteButton);
    }

    teamList.appendChild(row);
  });

  updateBasicStats();

  if (typeof sgUpdateTeamCount === "function") {
    sgUpdateTeamCount();
  }
}

function sgDeleteTeam(teamId) {
  const team = App.savedTeams.find(
    (item) => item.id === teamId
  );

  if (!team) return;

  const isDefaultTeam =
    team.id === "global" ||
    team.id === "developers" ||
    team.id === "designers";

  if (isDefaultTeam) {
    return;
  }

  const confirmed = window.confirm(
    `Delete "${team.name}"?\n\nThis cannot be undone.`
  );

  if (!confirmed) return;

  const wasActive = team.name === App.activeTeam;

  App.savedTeams = App.savedTeams.filter(
    (item) => item.id !== teamId
  );

  sgSaveTeams();

  if (wasActive) {
    const globalTeam = App.savedTeams.find(
      (item) => item.id === "global"
    );

    if (globalTeam) {
      App.activeTeam = globalTeam.name;

      saveToStorage(
        STORAGE_KEYS.activeTeam,
        App.activeTeam
      );

      const selectedCities = globalTeam.cities
        .map((cityName) => findCity(cityName))
        .filter(Boolean);

      App.cities = selectedCities.map((city) => ({
        ...city,
      }));

      saveToStorage(
        STORAGE_KEYS.cities,
        App.cities
      );
    }
  }

  sgRenderTeams();
  renderTimeline();
  updateBasicStats();
  updateLiveStatus();
  updateIntelligenceDashboard();
}

/* ==========================================================
   8. ACTIVATE TEAM
========================================================== */

function sgActivateTeam(teamId) {
  const team = App.savedTeams.find((item) => item.id === teamId);

  if (!team) return;

  App.activeTeam = team.name;

  saveToStorage(STORAGE_KEYS.activeTeam, App.activeTeam);

  /*
       Convert the team's city names
       back into complete city objects.
    */

  const selectedCities = team.cities
    .map((cityName) => findCity(cityName))
    .filter(Boolean);

  if (selectedCities.length > 0) {
    App.cities = selectedCities.map((city) => ({
      ...city,
    }));
  }

  saveToStorage(STORAGE_KEYS.cities, App.cities);

  sgRenderTeams();

  renderTimeline();

  updateBasicStats();

  updateLiveStatus();

  updateIntelligenceDashboard();

  closeSidebar();
}

/* ==========================================================
   9. CREATE NEW TEAM
========================================================== */

function sgCreateNewTeam() {
  const name = window.prompt("Enter a name for your new team:");

  if (!name) return;

  const cleanName = name.trim();

  if (!cleanName) return;

  const duplicate = App.savedTeams.some(
    (team) => normalize(team.name) === normalize(cleanName),
  );

  if (duplicate) {
    window.alert("A team with this name already exists.");

    return;
  }

  const team = {
    id: sgCreateTeamId(cleanName),

    name: cleanName,

    icon: "👥",

    cities: App.cities.map((city) => city.name),
  };

  App.savedTeams.push(team);

  App.activeTeam = team.name;

  sgSaveTeams();

  saveToStorage(STORAGE_KEYS.activeTeam, App.activeTeam);

  sgRenderTeams();
}

/* ==========================================================
   10. NEW TEAM BUTTON
========================================================== */

if (newTeamBtn) {
  newTeamBtn.addEventListener("click", sgCreateNewTeam);
}

/* ==========================================================
   11. SAVE CURRENT CITIES TO ACTIVE TEAM
========================================================== */

function sgSaveCurrentTeam() {
  const team = App.savedTeams.find((item) => item.name === App.activeTeam);

  if (!team) return;

  team.cities = App.cities.map((city) => city.name);

  sgSaveTeams();
}

/* ==========================================================
   12. UPDATE ACTIVE TEAM AFTER CITY CHANGE
========================================================== */

function sgSyncActiveTeam() {
  const team = App.savedTeams.find((item) => item.name === App.activeTeam);

  if (!team) return;

  team.cities = App.cities.map((city) => city.name);

  sgSaveTeams();
}

/* ==========================================================
   13. PLANNER STATE
========================================================== */

const SG_PLANNER_STORAGE_KEY = "syncgrid_planner_events";

function sgLoadPlannerEvents() {
  const events = loadFromStorage(SG_PLANNER_STORAGE_KEY);

  return Array.isArray(events) ? events : [];
}

let SG_PLANNER_EVENTS = sgLoadPlannerEvents();

/* ==========================================================
   14. SAVE PLANNER EVENTS
========================================================== */

function sgSavePlannerEvents() {
  saveToStorage(SG_PLANNER_STORAGE_KEY, SG_PLANNER_EVENTS);
}

/* ==========================================================
   15. CREATE PLANNER EVENT
========================================================== */

function sgCreatePlannerEvent() {
  const best = getBestWindowDetails();

  if (!best) {
    window.alert(
      "There is currently no shared awake window for the selected cities.",
    );

    return;
  }

  const title = window.prompt("Meeting name:", "Global Sync Meeting");

  if (!title) return;

  const event = {
    id: "event-" + Date.now(),

    title: title.trim(),

    utcHour: best.middle,

    duration: best.duration,

    team: App.activeTeam,

    createdAt: new Date().toISOString(),
  };

  SG_PLANNER_EVENTS.push(event);

  sgSavePlannerEvents();

  sgRenderPlannerSummary();
}

/* ==========================================================
   16. PLANNER SUMMARY
========================================================== */

function sgRenderPlannerSummary() {
  if (!upcomingEvents) return;

  upcomingEvents.innerHTML = "";

  if (SG_PLANNER_EVENTS.length === 0) {
    const empty = document.createElement("p");

    empty.textContent = "No planned meetings yet.";

    upcomingEvents.appendChild(empty);

    return;
  }

  /*
       Show the latest five events.
    */

  const events = [...SG_PLANNER_EVENTS].reverse().slice(0, 5);

  events.forEach((event) => {
    const item = document.createElement("div");

    item.className = "upcoming-event";

    item.innerHTML = `

            <strong>
                ${escapeHTML(event.title)}
            </strong>

            <small>
                ${escapeHTML(event.team)}
                ·
                ${pad(event.utcHour)}:00 UTC
            </small>

        `;

    upcomingEvents.appendChild(item);
  });
}

/* ==========================================================
   17. PLANNER BUTTON
========================================================== */

if (plannerBtn) {
  plannerBtn.addEventListener("click", () => {
    sgCreatePlannerEvent();

    closeSidebar();
  });
}

/* ==========================================================
   18. SETTINGS
========================================================== */

const SG_SETTINGS_KEY = "syncgrid_settings";

let SG_SETTINGS = loadFromStorage(SG_SETTINGS_KEY) || {
  notifications: true,

  autoRefresh: true,

  confirmRemoval: true,
};

/* ==========================================================
   19. SAVE SETTINGS
========================================================== */

function sgSaveSettings() {
  saveToStorage(SG_SETTINGS_KEY, SG_SETTINGS);
}

/* ==========================================================
   20. SETTINGS MENU
========================================================== */

function sgOpenSettings() {
  const action = window.prompt(
    "SyncGrid Settings\n\n" +
      "1 = Toggle notifications\n" +
      "2 = Toggle automatic refresh\n" +
      "3 = Toggle removal confirmation\n" +
      "4 = Reset all settings\n\n" +
      "Enter 1, 2, 3 or 4:",
  );

  if (!action) return;

  switch (action.trim()) {
    case "1":
      SG_SETTINGS.notifications = !SG_SETTINGS.notifications;

      break;

    case "2":
      SG_SETTINGS.autoRefresh = !SG_SETTINGS.autoRefresh;

      break;

    case "3":
      SG_SETTINGS.confirmRemoval = !SG_SETTINGS.confirmRemoval;

      break;

    case "4":
      SG_SETTINGS = {
        notifications: true,

        autoRefresh: true,

        confirmRemoval: true,
      };

      break;

    default:
      window.alert("Invalid setting.");

      return;
  }

  sgSaveSettings();

  window.alert("Settings saved.");
}

/* ==========================================================
   21. SETTINGS BUTTON
========================================================== */

if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    sgOpenSettings();

    closeSidebar();
  });
}

/* ==========================================================
   22. ENHANCED CITY STORAGE
========================================================== */

function sgPersistEverything() {
  saveToStorage(STORAGE_KEYS.cities, App.cities);

  sgSyncActiveTeam();

  sgSaveTeams();
}

/* ==========================================================
   23. TEAM COUNT
========================================================== */

function sgUpdateTeamCount() {
  if (!teamCount) return;

  teamCount.textContent = App.savedTeams.length;
}

/* ==========================================================
   24. LOAD ACTIVE TEAM
========================================================== */

function sgLoadActiveTeam() {
  const savedActiveTeam = loadFromStorage(STORAGE_KEYS.activeTeam);

  if (typeof savedActiveTeam === "string") {
    const exists = App.savedTeams.some((team) => team.name === savedActiveTeam);

    if (exists) {
      App.activeTeam = savedActiveTeam;
    }
  }
}

/* ==========================================================
   25. INITIAL TEAM SETUP
========================================================== */

sgLoadActiveTeam();

sgRenderTeams();

sgUpdateTeamCount();

sgRenderPlannerSummary();

/* ==========================================================
   26. KEEP ACTIVE TEAM SYNCHRONIZED
========================================================== */

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    sgPersistEverything();
  }
});

/* ==========================================================
   27. BEFORE PAGE CLOSE
========================================================== */

window.addEventListener("beforeunload", () => {
  sgPersistEverything();
});

/* ==========================================================
   28. PERIODIC STATE SAVE
========================================================== */

setInterval(() => {
  sgPersistEverything();
}, 30000);

/* ==========================================================
   29. FINAL PHASE 3F REFRESH
========================================================== */

sgRenderTeams();

sgUpdateTeamCount();

sgRenderPlannerSummary();

updateBasicStats();

/* ==========================================================
   END OF PHASE 3F
   CONTINUE WITH PHASE 3G
========================================================== */
/* ==========================================================
   SyncGrid v2.0
   PHASE 3G
   Final Integration + Stability + UX
========================================================== */

/* ==========================================================
   1. FINAL APPLICATION STATE
========================================================== */

App.isReady = false;

App.lastRefresh = Date.now();

App.lastInteraction = Date.now();

/* ==========================================================
   2. SAFE FUNCTION EXECUTOR
========================================================== */

function sgSafeExecute(callback, fallback = null) {
  try {
    return callback();
  } catch (error) {
    console.error("SyncGrid error:", error);

    return fallback;
  }
}

/* ==========================================================
   3. FINAL DASHBOARD REFRESH
========================================================== */

function sgRefreshEverything() {
  sgSafeExecute(() => {
    renderTimeline();

    updateBasicStats();

    updateLiveStatus();

    updateIntelligenceDashboard();

    if (App.cursorHour !== null) {
      requestAnimationFrame(() => {
        positionTimelineCursor(App.cursorHour);
      });
    }

    App.lastRefresh = Date.now();
  });
}

/* ==========================================================
   4. USER INTERACTION TRACKER
========================================================== */

document.addEventListener("click", () => {
  App.lastInteraction = Date.now();
});

document.addEventListener("keydown", () => {
  App.lastInteraction = Date.now();
});

/* ==========================================================
   5. ESCAPE KEY
========================================================== */

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeSidebar();

  if (searchSuggestions) {
    searchSuggestions.classList.remove("show");
  }

  if (citySearch) {
    citySearch.blur();
  }
});

/* ==========================================================
   6. MOBILE SIDEBAR AUTO-CLOSE
========================================================== */

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    closeSidebar();
  }

  if (App.cursorHour !== null) {
    requestAnimationFrame(() => {
      positionTimelineCursor(App.cursorHour);
    });
  }
});

/* ==========================================================
   7. MOBILE TIMELINE TOUCH SUPPORT
========================================================== */

if (timelineBody) {
  timelineBody.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];

      if (!touch) return;

      const element = document.elementFromPoint(touch.clientX, touch.clientY);

      const cell = element?.closest(".hour");

      if (!cell) return;

      const hour = Number(cell.dataset.hour);

      if (Number.isNaN(hour)) return;

      setCursorHour(hour);
    },
    {
      passive: true,
    },
  );

  timelineBody.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];

      if (!touch) return;

      const element = document.elementFromPoint(touch.clientX, touch.clientY);

      const cell = element?.closest(".hour");

      if (!cell) return;

      const hour = Number(cell.dataset.hour);

      if (Number.isNaN(hour)) return;

      setCursorHour(hour);
    },
    {
      passive: true,
    },
  );
}

/* ==========================================================
   8. TIMELINE WHEEL / HORIZONTAL SCROLL
========================================================== */

if (timelineWrapper) {
  timelineWrapper.addEventListener(
    "wheel",
    (event) => {
      /*
               On a narrow screen, vertical wheel
               movement can be converted into
               horizontal timeline movement.
            */

      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        if (timelineWrapper.scrollWidth > timelineWrapper.clientWidth) {
          timelineWrapper.scrollLeft += event.deltaY;

          event.preventDefault();
        }
      }
    },
    {
      passive: false,
    },
  );
}

/* ==========================================================
   9. SMART TIMELINE SCROLL TO CURSOR
========================================================== */

function sgScrollCursorIntoView() {
  if (!timelineWrapper || App.cursorHour === null) {
    return;
  }

  const selected = timelineBody?.querySelector(
    `.hour[data-hour="${App.cursorHour}"]`,
  );

  if (!selected) return;

  const wrapperRect = timelineWrapper.getBoundingClientRect();

  const cellRect = selected.getBoundingClientRect();

  const isLeftHidden = cellRect.left < wrapperRect.left;

  const isRightHidden = cellRect.right > wrapperRect.right;

  if (isLeftHidden || isRightHidden) {
    selected.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }
}

/* ==========================================================
   10. ENHANCED CURSOR KEYBOARD NAVIGATION
========================================================== */

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select, button")) {
    return;
  }

  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
    return;
  }

  const current = App.cursorHour === null ? 0 : App.cursorHour;

  const next = event.key === "ArrowLeft" ? current - 1 : current + 1;

  setCursorHour(next);

  sgScrollCursorIntoView();
});

/* ==========================================================
   11. SPACE = BEST MEETING WINDOW
========================================================== */

document.addEventListener("keydown", (event) => {
  if (event.code !== "Space") {
    return;
  }

  if (event.target.matches("input, textarea, select, button")) {
    return;
  }

  event.preventDefault();

  jumpToBestMeetingWindow();

  sgScrollCursorIntoView();
});

/* ==========================================================
   12. "B" = BEST WINDOW
========================================================== */

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select, button")) {
    return;
  }

  if (event.key.toLowerCase() !== "b") {
    return;
  }

  jumpToBestMeetingWindow();

  sgScrollCursorIntoView();
});

/* ==========================================================
   13. "R" = REFRESH
========================================================== */

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select, button")) {
    return;
  }

  if (event.key.toLowerCase() !== "r") {
    return;
  }

  sgRefreshEverything();
});

/* ==========================================================
   14. SEARCH SUGGESTION KEYBOARD NAVIGATION
========================================================== */

let sgSuggestionIndex = -1;

if (citySearch) {
  citySearch.addEventListener("keydown", (event) => {
    if (!searchSuggestions || !searchSuggestions.classList.contains("show")) {
      return;
    }

    const items = Array.from(
      searchSuggestions.querySelectorAll(".suggestion-item"),
    );

    if (!items.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      sgSuggestionIndex = Math.min(sgSuggestionIndex + 1, items.length - 1);

      items.forEach((item, index) => {
        item.classList.toggle("selected", index === sgSuggestionIndex);
      });
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      sgSuggestionIndex = Math.max(sgSuggestionIndex - 1, 0);

      items.forEach((item, index) => {
        item.classList.toggle("selected", index === sgSuggestionIndex);
      });
    }

    if (event.key === "Enter" && sgSuggestionIndex >= 0) {
      const selected = items[sgSuggestionIndex];

      if (selected) {
        selected.click();

        event.preventDefault();
      }
    }
  });

  citySearch.addEventListener("input", () => {
    sgSuggestionIndex = -1;
  });
}

/* ==========================================================
   15. BUTTON PRESS ACCESSIBILITY
========================================================== */

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const button = event.target.closest("button");

  if (!button) return;

  /*
           Native buttons already handle these
           keys. This listener intentionally does
           nothing beyond keeping the interaction
           layer future-proof.
        */
});

/* ==========================================================
   16. SAVE BEFORE TAB CLOSE / NAVIGATION
========================================================== */

window.addEventListener("pagehide", () => {
  sgSafeExecute(sgPersistEverything);
});

/* ==========================================================
   17. ONLINE / OFFLINE STATUS
========================================================== */

window.addEventListener("online", () => {
  App.isOnline = true;

  if (aiSummary) {
    generateSmartSummary();
  }
});

window.addEventListener("offline", () => {
  App.isOnline = false;

  if (aiSummary) {
    aiSummary.textContent =
      "You're offline. SyncGrid is continuing with locally saved data.";
  }
});

App.isOnline = navigator.onLine;

/* ==========================================================
   18. PERIODIC LIGHTWEIGHT REFRESH
========================================================== */

setInterval(() => {
  if (document.visibilityState !== "visible") {
    return;
  }

  /*
           Avoid unnecessary full redraws
           when the user is not interacting.
        */

  updateStatusCards();

  updateLiveStatus();

  updateMeetingDashboard();
}, 60000);

/* ==========================================================
   19. RESTORE TIMELINE POSITION
========================================================== */

function sgRestoreTimelinePosition() {
  if (!timelineWrapper) {
    return;
  }

  requestAnimationFrame(() => {
    if (App.cursorHour !== null) {
      positionTimelineCursor(App.cursorHour);
    }
  });
}

/* ==========================================================
   20. FINAL CITY / TEAM SYNCHRONIZATION
========================================================== */

function sgFinalSync() {
  sgSafeExecute(() => {
    saveToStorage(STORAGE_KEYS.cities, App.cities);

    sgSyncActiveTeam();

    sgSaveTeams();

    sgSavePlannerEvents();

    sgSaveSettings();
  });
}

/* ==========================================================
   21. FINAL INITIALIZATION
========================================================== */

function sgFinalizeApplication() {
  sgSafeExecute(() => {
    sgRenderTeams();

    sgUpdateTeamCount();

    sgRenderPlannerSummary();

    renderTimeline();

    updateBasicStats();

    updateLiveStatus();

    updateIntelligenceDashboard();

    if (App.cursorHour === null) {
      const best = getBestWindowDetails();

      if (best) {
        App.cursorHour = best.middle;
      }
    }

    if (App.cursorHour !== null) {
      setCursorHour(App.cursorHour);
    }

    sgRestoreTimelinePosition();

    App.isReady = true;

    if (aiSummary) {
      generateSmartSummary();
    }
  });
}

/* ==========================================================
   22. START FINAL APPLICATION
========================================================== */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", sgFinalizeApplication, {
    once: true,
  });
} else {
  sgFinalizeApplication();
}

/* ==========================================================
   23. FINAL AUTOSAVE
========================================================== */

setInterval(() => {
  if (App.isReady) {
    sgFinalSync();
  }
}, 30000);

/* ==========================================================
   24. FINAL ERROR PROTECTION
========================================================== */

window.addEventListener("error", (event) => {
  console.error("SyncGrid runtime error:", event.error || event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("SyncGrid promise error:", event.reason);
});

/* ==========================================================
   25. FINAL STATUS
========================================================== */

console.log("SyncGrid v2.0 initialized.");

/* ==========================================================
   END OF PHASE 3G
   END OF JAVASCRIPT BUILD
========================================================== */
/* ==========================================================
   SyncGrid v2.0
   PHASE 3G HOTFIX
   Visible Modal System for Teams / Planner / Settings
========================================================== */

("use strict");

/* ==========================================================
   1. CREATE MODAL
========================================================== */

function sgCreateModal(title, content, actions = []) {
  const oldModal = document.getElementById("sgDynamicModal");

  if (oldModal) {
    oldModal.remove();
  }

  const modal = document.createElement("div");

  modal.id = "sgDynamicModal";

  modal.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99999;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(0,0,0,.65);
        backdrop-filter:blur(6px);
    `;

  const box = document.createElement("div");

  box.style.cssText = `
        width:min(500px,100%);
        background:#141C2B;
        border:1px solid #2B3A4E;
        border-radius:18px;
        padding:24px;
        box-shadow:0 25px 60px rgba(0,0,0,.45);
        color:white;
    `;

  const heading = document.createElement("h2");

  heading.textContent = title;

  heading.style.cssText = `
        margin-bottom:18px;
        font-size:24px;
    `;

  const body = document.createElement("div");

  body.innerHTML = content;

  const footer = document.createElement("div");

  footer.style.cssText = `
        display:flex;
        justify-content:flex-end;
        gap:10px;
        margin-top:22px;
        flex-wrap:wrap;
    `;

  actions.forEach((action) => {
    const button = document.createElement("button");

    button.type = "button";

    button.textContent = action.label;

    button.className = action.className || "secondary-btn";

    button.addEventListener("click", () => {
      action.onClick(modal);
    });

    footer.appendChild(button);
  });

  box.appendChild(heading);

  box.appendChild(body);

  box.appendChild(footer);

  modal.appendChild(box);

  document.body.appendChild(modal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });

  return modal;
}

/* ==========================================================
   2. NEW TEAM MODAL
========================================================== */

function sgOpenNewTeamModal() {
  const modal = sgCreateModal(
    "Create New Team",

    `
                <label
                    style="
                        display:block;
                        margin-bottom:8px;
                        color:#A0AEC0;
                    "
                >
                    Team name
                </label>

                <input
                    id="sgTeamNameInput"
                    type="text"
                    placeholder="e.g. Marketing"
                    maxlength="40"
                    style="
                        width:100%;
                        padding:14px;
                        border-radius:12px;
                        border:1px solid #2B3A4E;
                        background:#0B1220;
                        color:white;
                        outline:none;
                        font:inherit;
                    "
                >

                <p
                    style="
                        margin-top:10px;
                        font-size:13px;
                    "
                >
                    The current cities will be saved
                    to this team.
                </p>
            `,

    [
      {
        label: "Cancel",

        className: "secondary-btn",

        onClick: (modal) => modal.remove(),
      },

      {
        label: "Create Team",

        className: "primary-btn",

        onClick: (modal) => {
          const input = document.getElementById("sgTeamNameInput");

          const name = input ? input.value.trim() : "";

          if (!name) {
            input.focus();

            return;
          }

          const exists = App.savedTeams.some(
            (team) => normalize(team.name) === normalize(name),
          );

          if (exists) {
            input.value = "";

            input.placeholder = "Team already exists";

            input.focus();

            return;
          }

          const team = {
            id: sgCreateTeamId(name),

            name: name,

            icon: "👥",

            cities: App.cities.map((city) => city.name),
          };

          App.savedTeams.push(team);

          App.activeTeam = team.name;

          sgSaveTeams();

          saveToStorage(STORAGE_KEYS.activeTeam, App.activeTeam);

          sgRenderTeams();

          sgUpdateTeamCount();

          modal.remove();
        },
      },
    ],
  );

  setTimeout(() => {
    const input = document.getElementById("sgTeamNameInput");

    if (input) {
      input.focus();
    }
  }, 50);
}

/* ==========================================================
   3. PLANNER MODAL
========================================================== */

function sgOpenPlannerModal() {
  const best = getBestWindowDetails();

  if (!best) {
    sgCreateModal(
      "Planner",

      `
                <p>
                    There is currently no shared
                    awake window for the selected cities.
                </p>
            `,

      [
        {
          label: "Close",

          className: "primary-btn",

          onClick: (modal) => modal.remove(),
        },
      ],
    );

    return;
  }

  const range = formatHourRange(best.start, best.end);

  const modal = sgCreateModal(
    "Plan a Meeting",

    `
                <p>
                    Recommended window:
                </p>

                <h3
                    style="
                        margin-top:8px;
                        font-size:26px;
                    "
                >
                    ${range}
                </h3>

                <label
                    style="
                        display:block;
                        margin-top:20px;
                        margin-bottom:8px;
                        color:#A0AEC0;
                    "
                >
                    Meeting name
                </label>

                <input
                    id="sgPlannerName"
                    type="text"
                    value="Global Sync Meeting"
                    maxlength="60"
                    style="
                        width:100%;
                        padding:14px;
                        border-radius:12px;
                        border:1px solid #2B3A4E;
                        background:#0B1220;
                        color:white;
                        outline:none;
                        font:inherit;
                    "
                >

                <p
                    style="
                        margin-top:12px;
                        font-size:13px;
                    "
                >
                    Best midpoint:
                    ${pad(best.middle)}:00 UTC
                </p>
            `,

    [
      {
        label: "Cancel",

        className: "secondary-btn",

        onClick: (modal) => modal.remove(),
      },

      {
        label: "Save Meeting",

        className: "primary-btn",

        onClick: (modal) => {
          const input = document.getElementById("sgPlannerName");

          const title = input.value.trim() || "Global Sync Meeting";

          SG_PLANNER_EVENTS.push({
            id: "event-" + Date.now(),

            title: title,

            utcHour: best.middle,

            duration: best.duration,

            team: App.activeTeam,

            createdAt: new Date().toISOString(),
          });

          sgSavePlannerEvents();

          sgRenderPlannerSummary();

          modal.remove();
        },
      },
    ],
  );

  setTimeout(() => {
    const input = document.getElementById("sgPlannerName");

    if (input) {
      input.focus();

      input.select();
    }
  }, 50);
}

/* ==========================================================
   4. SETTINGS MODAL
========================================================== */

function sgOpenSettingsModal() {
  const modal = sgCreateModal(
    "SyncGrid Settings",

    `
                <div
                    style="
                        display:flex;
                        flex-direction:column;
                        gap:14px;
                    "
                >

                    <label
                        style="
                            display:flex;
                            align-items:center;
                            gap:12px;
                            padding:14px;
                            background:#1A2538;
                            border-radius:12px;
                            cursor:pointer;
                        "
                    >

                        <input
                            id="sgNotifications"
                            type="checkbox"
                            ${SG_SETTINGS.notifications ? "checked" : ""}
                        >

                        <span>
                            Enable notifications
                        </span>

                    </label>


                    <label
                        style="
                            display:flex;
                            align-items:center;
                            gap:12px;
                            padding:14px;
                            background:#1A2538;
                            border-radius:12px;
                            cursor:pointer;
                        "
                    >

                        <input
                            id="sgAutoRefresh"
                            type="checkbox"
                            ${SG_SETTINGS.autoRefresh ? "checked" : ""}
                        >

                        <span>
                            Automatic refresh
                        </span>

                    </label>


                    <label
                        style="
                            display:flex;
                            align-items:center;
                            gap:12px;
                            padding:14px;
                            background:#1A2538;
                            border-radius:12px;
                            cursor:pointer;
                        "
                    >

                        <input
                            id="sgConfirmRemoval"
                            type="checkbox"
                            ${SG_SETTINGS.confirmRemoval ? "checked" : ""}
                        >

                        <span>
                            Confirm city removal
                        </span>

                    </label>

                </div>
            `,

    [
      {
        label: "Cancel",

        className: "secondary-btn",

        onClick: (modal) => modal.remove(),
      },

      {
        label: "Save Settings",

        className: "primary-btn",

        onClick: (modal) => {
          SG_SETTINGS.notifications =
            document.getElementById("sgNotifications").checked;

          SG_SETTINGS.autoRefresh =
            document.getElementById("sgAutoRefresh").checked;

          SG_SETTINGS.confirmRemoval =
            document.getElementById("sgConfirmRemoval").checked;

          sgSaveSettings();

          modal.remove();
        },
      },
    ],
  );
}

/* ==========================================================
   5. REPLACE OLD BUTTON LISTENERS
========================================================== */

function sgReplaceButton(original, handler) {
  if (!original) return null;

  const replacement = original.cloneNode(true);

  original.replaceWith(replacement);

  replacement.addEventListener("click", (event) => {
    event.preventDefault();

    event.stopPropagation();

    handler();
  });

  return replacement;
}

/* ==========================================================
   6. CONNECT NEW TEAM
========================================================== */

const sgNewTeamButton = sgReplaceButton(
  document.getElementById("newTeamBtn"),
  sgOpenNewTeamModal,
);

/* ==========================================================
   7. CONNECT PLANNER
========================================================== */

const sgPlannerButton = sgReplaceButton(
  document.getElementById("plannerBtn"),
  () => {
    sgOpenPlannerModal();

    closeSidebar();
  },
);

/* ==========================================================
   8. CONNECT SETTINGS
========================================================== */

const sgSettingsButton = sgReplaceButton(
  document.getElementById("settingsBtn"),
  () => {
    sgOpenSettingsModal();

    closeSidebar();
  },
);

/* ==========================================================
   9. ESCAPE CLOSES MODAL
========================================================== */

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const modal = document.getElementById("sgDynamicModal");

  if (modal) {
    modal.remove();
  }
});

/* ==========================================================
   10. HOTFIX COMPLETE
========================================================== */

console.log("SyncGrid button hotfix loaded.");
/* ==========================================================
   SyncGrid v2.0
   PHASE 3H
   Live City Intelligence
   Worldwide City Verification + Timezone Detection
========================================================== */

/* ==========================================================
   1. LIVE GEOCODING CONFIGURATION
========================================================== */

const SG_GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";

const SG_GEOCODING_MIN_LENGTH = 2;

const SG_GEOCODING_LIMIT = 8;

let sgSearchRequestId = 0;

let sgSearchTimer = null;

/* ==========================================================
   2. LIVE SEARCH STATE
========================================================== */

App.liveSearch = {
  loading: false,

  results: [],

  selectedIndex: -1,

  lastQuery: "",

  lastRequest: 0,
};

/* ==========================================================
   3. NORMALIZE LIVE CITY RESULT
========================================================== */

function sgNormalizeLiveCity(result) {
  if (!result) {
    return null;
  }

  const name = result.name || result.city || result.municipality;

  if (!name) {
    return null;
  }

  const country = result.country || "";

  const countryCode = result.country_code || "";

  const timezone = result.timezone || null;

  const latitude = Number(result.latitude);

  const longitude = Number(result.longitude);

  if (!timezone || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    name,

    country,

    countryCode,

    timezone,

    latitude,

    longitude,

    admin1: result.admin1 || "",

    admin2: result.admin2 || "",

    population: Number(result.population) || 0,

    source: "live",
  };
}

/* ==========================================================
   4. SEARCH LIVE GEOCODING API
========================================================== */

async function sgSearchLiveCities(query) {
  const cleanQuery = String(query || "").trim();

  if (cleanQuery.length < SG_GEOCODING_MIN_LENGTH) {
    return [];
  }

  const requestId = ++sgSearchRequestId;

  App.liveSearch.loading = true;

  App.liveSearch.lastQuery = cleanQuery;

  App.liveSearch.lastRequest = requestId;

  const params = new URLSearchParams({
    name: cleanQuery,

    count: String(SG_GEOCODING_LIMIT),

    language: "en",

    format: "json",
  });

  try {
    const response = await fetch(`${SG_GEOCODING_API}?${params.toString()}`, {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = await response.json();

    /*
           Ignore an older request if the
           user has already typed something new.
        */

    if (requestId !== sgSearchRequestId) {
      return [];
    }

    const results = Array.isArray(data.results) ? data.results : [];

    const normalized = results.map(sgNormalizeLiveCity).filter(Boolean);

    App.liveSearch.results = normalized;

    return normalized;
  } catch (error) {
    console.error("SyncGrid live city search:", error);

    App.liveSearch.results = [];

    return null;
  } finally {
    if (requestId === sgSearchRequestId) {
      App.liveSearch.loading = false;
    }
  }
}

/* ==========================================================
   5. CITY DUPLICATE CHECK
========================================================== */

function sgCityAlreadyAddedLive(city) {
  if (!city) {
    return false;
  }

  return App.cities.some((existing) => {
    /*
               Prefer coordinates because
               two places can have the same name.
            */

    if (
      Number.isFinite(existing.latitude) &&
      Number.isFinite(existing.longitude)
    ) {
      const latDifference = Math.abs(existing.latitude - city.latitude);

      const lonDifference = Math.abs(existing.longitude - city.longitude);

      if (latDifference < 0.01 && lonDifference < 0.01) {
        return true;
      }
    }

    return (
      normalize(existing.name) === normalize(city.name) &&
      normalize(existing.country) === normalize(city.country)
    );
  });
}

/* ==========================================================
   6. FORMAT TIMEZONE DISPLAY
========================================================== */

function sgGetUTCOffset(timezone) {
  try {
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,

      timeZoneName: "shortOffset",
    }).formatToParts(now);

    const offset = parts.find((part) => part.type === "timeZoneName");

    if (offset?.value) {
      return offset.value.replace("GMT", "UTC");
    }
  } catch (error) {
    console.warn("Timezone offset error:", error);
  }

  return timezone;
}

/* ==========================================================
   7. RENDER LIVE SEARCH RESULT
========================================================== */

function sgRenderLiveSearchResults(results) {
  if (!searchSuggestions) {
    return;
  }

  searchSuggestions.innerHTML = "";

  if (App.liveSearch.loading) {
    const loading = document.createElement("div");

    loading.className = "suggestion-item";

    loading.innerHTML = `
            <span>
                Searching worldwide...
            </span>
        `;

    searchSuggestions.appendChild(loading);

    searchSuggestions.classList.add("show");

    return;
  }

  if (results === null) {
    const error = document.createElement("div");

    error.className = "suggestion-item";

    error.innerHTML = `
            <strong>
                Search unavailable
            </strong>

            <span>
                Check your internet connection
            </span>
        `;

    searchSuggestions.appendChild(error);

    searchSuggestions.classList.add("show");

    return;
  }

  if (!results.length) {
    const invalid = document.createElement("div");

    invalid.className = "suggestion-item";

    invalid.innerHTML = `
            <strong>
                Invalid city
            </strong>

            <span>
                No matching location was found.
            </span>
        `;

    searchSuggestions.appendChild(invalid);

    searchSuggestions.classList.add("show");

    return;
  }

  results.forEach((city, index) => {
    const item = document.createElement("div");

    item.className = "suggestion-item";

    item.dataset.index = String(index);

    const locationParts = [city.admin1, city.country].filter(Boolean);

    const locationText = locationParts.join(", ");

    const offset = sgGetUTCOffset(city.timezone);

    const added = sgCityAlreadyAddedLive(city);

    item.innerHTML = `

                <strong>
                    ${escapeHTML(city.name)}
                </strong>

                <span>
                    ${escapeHTML(locationText)}
                    ·
                    ${escapeHTML(offset)}
                </span>

            `;

    if (added) {
      item.style.opacity = "0.5";

      item.style.cursor = "default";

      item.title = "Already added";
    } else {
      item.addEventListener("click", () => {
        sgSelectLiveCity(city);
      });
    }

    if (index === App.liveSearch.selectedIndex) {
      item.classList.add("selected");
    }

    searchSuggestions.appendChild(item);
  });

  searchSuggestions.classList.add("show");
}

/* ==========================================================
   8. SELECT LIVE CITY
========================================================== */

function sgSelectLiveCity(city) {
  if (!city) return;

  App.liveSearch.selectedCity = city;

  if (citySearch) {
    citySearch.value = city.name;
  }

  sgRenderLiveSearchResults([city]);

  if (searchSuggestions) {
    searchSuggestions.classList.add("show");
  }
}

/* ==========================================================
   9. ADD VERIFIED LIVE CITY
========================================================== */

function sgAddVerifiedCity(city) {
  if (!city) {
    return false;
  }

if (!sgIsValidTimezone(city.timezone)) {
  console.error(
    "SyncGrid rejected city because its timezone is invalid:",
    city
  );

  if (citySearch) {
    citySearch.value = "";
    citySearch.placeholder = "Timezone unavailable";

    setTimeout(() => {
      if (citySearch) {
        citySearch.placeholder = "Search city...";
      }
    }, 2200);
  }

  return false;
}

  if (sgCityAlreadyAddedLive(city)) {
    return false;
  }

  /*
       These working/awake defaults are
       intentionally conservative.

       Later they can be user-editable
       per city.
    */

  const cityObject = {
    name: city.name,

    country: city.country,

    countryCode: city.countryCode,

    timezone: city.timezone,

    latitude: city.latitude,

    longitude: city.longitude,

    admin1: city.admin1,

    admin2: city.admin2,

    population: city.population,

   workStart: 9,
workEnd: 17,

awakeStart: 7,
awakeEnd: 23,

workDays: [1, 2, 3, 4, 5],

source: "live",
timezoneSource: "IANA",
  };

  App.cities.push(cityObject);

  saveToStorage(STORAGE_KEYS.cities, App.cities);

  sgSyncActiveTeam();

  renderTimeline();

  updateBasicStats();

  updateLiveStatus();

  updateIntelligenceDashboard();

  return true;
}

/* ==========================================================
   10. ADD SELECTED LIVE CITY
========================================================== */

function sgAddSelectedLiveCity() {
  const city = App.liveSearch.selectedCity;

  if (!city) {
    return false;
  }

  const added = sgAddVerifiedCity(city);

  if (added) {
    App.liveSearch.selectedCity = null;

    App.liveSearch.results = [];

    if (citySearch) {
      citySearch.value = "";

      citySearch.placeholder = "Search city...";
    }

    if (searchSuggestions) {
      searchSuggestions.innerHTML = "";

      searchSuggestions.classList.remove("show");
    }

    return true;
  }

  return false;
}

/* ==========================================================
   11. LIVE INPUT SEARCH
========================================================== */

async function sgHandleLiveCityInput() {
  if (!citySearch) {
    return;
  }

  const query = citySearch.value.trim();

  App.liveSearch.selectedCity = null;

  App.liveSearch.selectedIndex = -1;

  if (query.length < SG_GEOCODING_MIN_LENGTH) {
    if (searchSuggestions) {
      searchSuggestions.innerHTML = "";

      searchSuggestions.classList.remove("show");
    }

    return;
  }

  if (searchSuggestions) {
    searchSuggestions.innerHTML = `
            <div class="suggestion-item">
                <span>
                    Searching worldwide...
                </span>
            </div>
        `;

    searchSuggestions.classList.add("show");
  }

  const results = await sgSearchLiveCities(query);

  /*
       If the API failed, render the
       network-error state.
    */

  sgRenderLiveSearchResults(results);
}

/* ==========================================================
   12. DEBOUNCED SEARCH
========================================================== */

if (citySearch) {
  citySearch.addEventListener("input", () => {
    clearTimeout(sgSearchTimer);

    sgSearchTimer = setTimeout(sgHandleLiveCityInput, 350);
  });
}

/* ==========================================================
   13. ADD BUTTON OVERRIDE
========================================================== */

if (addCityBtn) {
  const newAddButton = addCityBtn.cloneNode(true);

  addCityBtn.replaceWith(newAddButton);

  newAddButton.addEventListener("click", async (event) => {
    event.preventDefault();

    event.stopPropagation();

    /*
               If a live result was selected,
               add it directly.
            */

    if (App.liveSearch.selectedCity) {
      const added = sgAddSelectedLiveCity();

      if (!added) {
        if (citySearch) {
          citySearch.value = "City already added";
        }
      }

      return;
    }

    const query = citySearch ? citySearch.value.trim() : "";

    if (!query) {
      if (citySearch) {
        citySearch.focus();
      }

      return;
    }

    /*
               Search immediately when the user
               clicks Add City without selecting
               a suggestion.
            */

    const results = await sgSearchLiveCities(query);

    if (!results || results.length === 0) {
      if (citySearch) {
        citySearch.value = "";

        citySearch.placeholder = "Invalid city";

        citySearch.focus();
      }

      sgRenderLiveSearchResults(results);

      return;
    }

    /*
               Exact name match first.
            */

    const exact = results.find(
      (city) => normalize(city.name) === normalize(query),
    );

    if (
      exact &&
      results.filter((city) => normalize(city.name) === normalize(query))
        .length === 1
    ) {
      const added = sgAddVerifiedCity(exact);

      if (added) {
        if (citySearch) {
          citySearch.value = "";
        }

        if (searchSuggestions) {
          searchSuggestions.classList.remove("show");
        }

        return;
      }
    }

    /*
               Multiple possible matches:
               show them instead of guessing.
            */

    App.liveSearch.results = results;

    App.liveSearch.selectedIndex = -1;

    sgRenderLiveSearchResults(results);
  });
}

/* ==========================================================
   14. KEYBOARD NAVIGATION
========================================================== */

if (citySearch) {
  citySearch.addEventListener("keydown", (event) => {
    if (!searchSuggestions || !searchSuggestions.classList.contains("show")) {
      return;
    }

    const items = Array.from(
      searchSuggestions.querySelectorAll(".suggestion-item"),
    );

    /*
               Ignore keyboard navigation
               when the result is an error/loading
               message.
            */

    if (!items.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      App.liveSearch.selectedIndex = Math.min(
        App.liveSearch.selectedIndex + 1,
        items.length - 1,
      );

      sgRenderLiveSearchResults(App.liveSearch.results);

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      App.liveSearch.selectedIndex = Math.max(
        App.liveSearch.selectedIndex - 1,
        0,
      );

      sgRenderLiveSearchResults(App.liveSearch.results);

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const index = App.liveSearch.selectedIndex;

      if (index >= 0 && App.liveSearch.results[index]) {
        sgSelectLiveCity(App.liveSearch.results[index]);

        /*
                       Selecting a result does not
                       automatically add it.
                       User can click Add City.
                    */

        return;
      }

      /*
                   If only one result exists,
                   add it directly.
                */

      if (App.liveSearch.results.length === 1) {
        const city = App.liveSearch.results[0];

        if (sgAddVerifiedCity(city)) {
          citySearch.value = "";

          searchSuggestions.classList.remove("show");
        }
      }
    }
  });
}

/* ==========================================================
   15. CITY REMOVAL CONFIRMATION
========================================================== */

if (timelineBody) {
  timelineBody.addEventListener("contextmenu", (event) => {
    const row = event.target.closest(".timeline-row");

    if (!row) return;

    const cityName = row.dataset.city;

    if (!cityName) return;

    event.preventDefault();

    let confirmed = true;

    if (typeof SG_SETTINGS !== "undefined" && SG_SETTINGS.confirmRemoval) {
      confirmed = window.confirm(`Remove ${cityName} from SyncGrid?`);
    }

    if (confirmed) {
      removeCity(cityName);

      sgSyncActiveTeam();
    }
  });
}

/* ==========================================================
   16. VERIFY EXISTING SAVED CITIES
========================================================== */

function sgUpgradeSavedCities() {
  if (!Array.isArray(App.cities)) {
    return;
  }

  App.cities = App.cities.map((city) => {
    /*
                   Existing hard-coded cities
                   remain valid.

                   Live cities already contain
                   their timezone and coordinates.
                */

    if (city.timezone) {
      return city;
    }

    const known = findCity(city.name);

    if (known) {
      return {
        ...city,

        ...known,
      };
    }

    return city;
  });

  saveToStorage(STORAGE_KEYS.cities, App.cities);
}

/* ==========================================================
   17. INVALID CITY FEEDBACK
========================================================== */

function sgShowInvalidCity() {
  if (!citySearch) return;

  citySearch.value = "";

  citySearch.placeholder = "Invalid city";

  setTimeout(() => {
    if (citySearch) {
      citySearch.placeholder = "Search city...";
    }
  }, 2200);
}

/* ==========================================================
   PHASE 4A
   TIMEZONE VALIDATION
========================================================== */

function sgIsValidTimezone(timezone) {
  if (!timezone || typeof timezone !== "string") {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
    }).format(new Date());

    return true;
  } catch (error) {
    return false;
  }
}

/* ==========================================================
   18. LIVE CITY DETAILS
========================================================== */

function sgGetCityTimezoneInfo(city) {
  if (!city?.timezone) {
    return null;
  }

  if (!sgIsValidTimezone(city.timezone)) {
    return null;
  }

  const now = new Date();

  return {
    timezone: city.timezone,
    utcOffset: sgGetUTCOffset(city.timezone),
    localTime: sgGetCityLocalTimeText(city, now),
  };
}

/* ==========================================================
   19. INITIAL LIVE CITY UPGRADE
========================================================== */

sgUpgradeSavedCities();

/* ==========================================================
   20. LIVE ENGINE READY
========================================================== */

console.log("SyncGrid Live City Intelligence loaded.");

/* ==========================================================
   END OF PHASE 3H
========================================================== */
/* ==========================================================
   SyncGrid v2.0
   PHASE 3I
   LIVE GLOBAL TIME ENGINE

   UTC is the master timeline.
   Every city is converted from UTC -> local time
   using its IANA timezone.

   Example:
   14:00 UTC
      ├── New York -> 10:00
      ├── Mumbai   -> 19:30
      └── Tokyo    -> 23:00

   This automatically respects timezone rules,
   including daylight-saving changes.
========================================================== */

/* ==========================================================
   1. LIVE GLOBAL CLOCK STATE
========================================================== */

App.globalClock = {
  utcDate: new Date(),

  utcHour: 0,

  utcMinute: 0,

  utcSecond: 0,

  lastUpdate: 0,
};

/* ==========================================================
   2. GET UTC PARTS
========================================================== */

function sgGetUTCParts(date = new Date()) {
  return {
    year: date.getUTCFullYear(),

    month: date.getUTCMonth(),

    day: date.getUTCDate(),

    hour: date.getUTCHours(),

    minute: date.getUTCMinutes(),

    second: date.getUTCSeconds(),
  };
}

/* ==========================================================
   3. UPDATE GLOBAL CLOCK
========================================================== */

function sgUpdateGlobalClock() {
  const now = new Date();

  const utc = sgGetUTCParts(now);

  App.globalClock.utcDate = now;

  App.globalClock.utcHour = utc.hour;

  App.globalClock.utcMinute = utc.minute;

  App.globalClock.utcSecond = utc.second;

  App.globalClock.lastUpdate = Date.now();

  /*
       Keep the top UTC clock synchronized.
    */

  if (utcTime) {
    utcTime.textContent = `${pad(utc.hour)}:${pad(utc.minute)}:${pad(utc.second)}`;
  }

  /*
       The current global UTC hour becomes
       the live timeline reference.
    */

  App.currentUTCHour = utc.hour;

  /*
       Update the current cursor only if the
       user hasn't manually selected another hour.
    */

  if (!App.userSelectedCursor) {
    App.cursorHour = utc.hour;
  }

  sgUpdateLiveTimelineState();
}

/* ==========================================================
   4. CONVERT UTC DATE TO CITY LOCAL DATE
========================================================== */

function sgGetCityLocalParts(city, utcDate = new Date()) {
  if (!city || !city.timezone) {
    return null;
  }

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: city.timezone,

      year: "numeric",

      month: "2-digit",

      day: "2-digit",

      hour: "2-digit",

      minute: "2-digit",

      second: "2-digit",

      hour12: false,
    }).formatToParts(utcDate);

    const get = (type) => {
      const part = parts.find((item) => item.type === type);

      return part ? Number(part.value) : 0;
    };

    return {
      year: get("year"),

      month: get("month"),

      day: get("day"),

      hour: get("hour"),

      minute: get("minute"),

      second: get("second"),
    };
  } catch (error) {
    console.error("Timezone conversion error:", error);

    return null;
  }
}

function sgGetCityLocalWeekday(city, utcDate = new Date()) {
  if (!city?.timezone) {
    return null;
  }

  try {
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: city.timezone,
      weekday: "short",
    }).format(utcDate);

    const map = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    return map[weekday] ?? null;
  } catch (error) {
    console.error("Local weekday conversion error:", error);
    return null;
  }
}

/* ==========================================================
   5. GET CITY LOCAL HOUR FOR UTC DATE
========================================================== */

function sgGetCityLocalHour(city, utcDate) {
  const local = sgGetCityLocalParts(city, utcDate);

  if (!local) {
    return null;
  }

  /*
       Some Intl implementations can represent
       midnight as 24. Normalize it to 0.
    */

  return local.hour === 24 ? 0 : local.hour;
}

/* ==========================================================
   6. GET CITY LOCAL TIME TEXT
========================================================== */

function sgGetCityLocalTimeText(city, utcDate = new Date()) {
  if (!city?.timezone) {
    return "--:--";
  }

  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: city.timezone,

      hour: "2-digit",

      minute: "2-digit",

      hour12: false,
    }).format(utcDate);
  } catch (error) {
    return "--:--";
  }
}

/* ==========================================================
   7. GET CITY TIMEZONE OFFSET
========================================================== */

function sgGetCityOffset(city, utcDate = new Date()) {
  if (!city?.timezone) {
    return "";
  }

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: city.timezone,

      timeZoneName: "shortOffset",
    }).formatToParts(utcDate);

    const zone = parts.find((part) => part.type === "timeZoneName");

    if (!zone) {
      return "";
    }

    return zone.value.replace("GMT", "UTC");
  } catch (error) {
    return "";
  }
}

/* ==========================================================
   8. GET STATUS FOR UTC HOUR
========================================================== */

function sgGetStatusForUTCHour(city, utcHour, baseDate = new Date()) {
  /*
       Create a genuine UTC timestamp.

       This is important because the local date
       can differ from the UTC date.
    */

  const utcDate = new Date(
    Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth(),
      baseDate.getUTCDate(),
      utcHour,
      0,
      0,
    ),
  );

  const localHour = sgGetCityLocalHour(city, utcDate);

  if (localHour === null) {
    return {
      type: "sleep",

      label: "Sleeping",

      localHour: null,

      localTime: "--:--",

      offset: "",
    };
  }

  const localWeekday = sgGetCityLocalWeekday(
  city,
  utcDate
);

const status = getStatus(
  city,
  localHour,
  localWeekday
);

  return {
    type: status.type,

    label: status.label,

    localHour: localHour,

    localTime: sgGetCityLocalTimeText(city, utcDate),

    offset: sgGetCityOffset(city, utcDate),
  };
}

/* ==========================================================
   9. TRUE GLOBAL HOUR ANALYSIS
========================================================== */

function sgAnalyzeGlobalUTCHour(utcHour) {
  let working = 0;

  let awake = 0;

  let sleeping = 0;

  const cityStates = [];

  App.cities.forEach((city) => {
    const state = sgGetStatusForUTCHour(city, utcHour);

    cityStates.push({
      city,

      ...state,
    });

    if (state.type === "work") {
      working++;
    } else if (state.type === "awake") {
      awake++;
    } else {
      sleeping++;
    }
  });

  const total = App.cities.length;

  return {
    utcHour,

    total,

    working,

    awake,

    sleeping,

    everyoneAwake: total > 0 && sleeping === 0,

    everyoneWorking: total > 0 && working === total,

    cityStates,
  };
}

/* ==========================================================
   10. REPLACE TIMELINE HEADER
========================================================== */

function renderTimelineHeader() {
  if (!timelineHeader) return;

  timelineHeader.innerHTML = "";

  const cityLabel = document.createElement("div");

  cityLabel.className = "timeline-city-header";

  cityLabel.innerHTML = `
        <strong>City</strong>
        <small>UTC timeline</small>
    `;

  timelineHeader.appendChild(cityLabel);

  for (let utcHour = 0; utcHour < 24; utcHour++) {
    const cell = document.createElement("div");

    cell.className = "timeline-hour-label";

    cell.dataset.utcHour = String(utcHour);

    cell.innerHTML = `
            <strong>
                ${pad(utcHour)}:00
            </strong>
            <small>
                UTC
            </small>
        `;

    timelineHeader.appendChild(cell);
  }
}

/* ==========================================================
   11. CREATE TRUE GLOBAL TIMELINE ROW
========================================================== */

function sgCreateGlobalTimelineRow(city) {
  const row = document.createElement("div");

  row.className = "timeline-row";

  row.dataset.city = city.name;

  /*
       City information.
    */

  const cityLabel = document.createElement("div");

  cityLabel.className = "city-name";

  const currentLocalTime = sgGetCityLocalTimeText(city);

  const offset = sgGetCityOffset(city);

  cityLabel.innerHTML = `

        <div>

            <strong>
                ${escapeHTML(city.name)}
            </strong>

            <br>

            <small>
                ${escapeHTML(city.country || "")}

                ·

                ${escapeHTML(city.timezone)}

                ·

                ${escapeHTML(offset)}

                · Local:
                ${escapeHTML(currentLocalTime)}
            </small>

        </div>

    `;

  row.appendChild(cityLabel);

  /*
       Create 24 GLOBAL UTC cells.

       Every cell represents the same UTC
       hour for every city.

       The local hour is calculated separately
       for each city.
    */

  for (let utcHour = 0; utcHour < 24; utcHour++) {
    const state = sgGetStatusForUTCHour(city, utcHour);

    const cell = document.createElement("div");

    cell.className = `hour ${state.type}`;

    cell.dataset.hour = String(utcHour);

    cell.dataset.utcHour = String(utcHour);

    cell.dataset.city = city.name;

    cell.dataset.localHour = String(state.localHour);

    /*
           Rich tooltip.
        */

    cell.title =
      `${city.name} • ` +
      `${pad(utcHour)}:00 UTC • ` +
      `${state.localTime} local • ` +
      `${state.label}`;

    cell.setAttribute("role", "button");

    cell.setAttribute(
      "aria-label",
      `${city.name}, ` +
        `${pad(utcHour)}:00 UTC, ` +
        `${state.localTime} local time, ` +
        `${state.label}`,
    );

    /*
           Show local time inside the cell
           through a data attribute.

           CSS can use this later if desired.
        */

    cell.dataset.displayTime = state.localTime;

    row.appendChild(cell);
  }

  return row;
}

/* ==========================================================
   12. REPLACE TIMELINE BODY
========================================================== */

function renderTimelineBody() {
  if (!timelineBody) return;

  timelineBody.innerHTML = "";

  if (App.cities.length === 0) {
    const empty = document.createElement("div");

    empty.className = "empty-state";

    empty.textContent = "No cities added yet.";

    timelineBody.appendChild(empty);

    return;
  }

  App.cities.forEach((city) => {
    const row = sgCreateGlobalTimelineRow(city);

    timelineBody.appendChild(row);
  });
}

/* ==========================================================
   13. REPLACE COMPLETE TIMELINE RENDER
========================================================== */

function renderTimeline() {
  renderTimelineHeader();

  renderTimelineBody();

  /*
       Reapply the current UTC cursor after
       the timeline has been rebuilt.
    */

  requestAnimationFrame(() => {
    if (App.cursorHour !== null) {
      highlightCursorHour(App.cursorHour);

      positionTimelineCursor(App.cursorHour);
    }
  });
}

/* ==========================================================
   14. LIVE STATUS FOR CURRENT MOMENT
========================================================== */

function sgGetCurrentGlobalAnalysis() {
  return sgAnalyzeGlobalUTCHour(App.globalClock.utcHour);
}

/* ==========================================================
   15. UPDATE LIVE DASHBOARD COUNTERS
========================================================== */

function sgUpdateLiveStatusCards() {
  const analysis = sgGetCurrentGlobalAnalysis();

  if (!analysis) return;

  if (workingNow) {
    workingNow.textContent = analysis.working;
  }

  if (awakeNow) {
    awakeNow.textContent = analysis.awake;
  }

  if (sleepingNow) {
    sleepingNow.textContent = analysis.sleeping;
  }

  if (workingCount) {
    workingCount.textContent = analysis.working;
  }

  if (awakeCount) {
    awakeCount.textContent = analysis.awake;
  }
}

/* ==========================================================
   16. UPDATE LIVE TIMELINE
========================================================== */

function sgUpdateLiveTimelineState() {
  if (!App.isInitialized) {
    return;
  }

  sgUpdateLiveStatusCards();

  /*
       Highlight the actual current UTC hour
       only when the user hasn't manually
       selected a different hour.
    */

  if (!App.userSelectedCursor) {
    highlightCursorHour(App.globalClock.utcHour);

    positionTimelineCursor(App.globalClock.utcHour);

    if (cursorTime) {
      cursorTime.textContent = `${pad(App.globalClock.utcHour)}:${pad(
        App.globalClock.utcMinute,
      )} UTC`;
    }
  }

  /*
       Update city labels so their displayed
       local time remains live.
    */

  sgUpdateLiveCityLabels();
}

/* ==========================================================
   17. UPDATE CITY LOCAL-TIME LABELS
========================================================== */

function sgUpdateLiveCityLabels() {
  if (!timelineBody) return;

  const rows = timelineBody.querySelectorAll(".timeline-row");

  rows.forEach((row) => {
    const city = App.cities.find((item) => item.name === row.dataset.city);

    if (!city) return;

    const small = row.querySelector(".city-name small");

    if (!small) return;

    const localTime = sgGetCityLocalTimeText(city);

    const offset = sgGetCityOffset(city);

    small.textContent =
      `${city.country || ""} · ` +
      `${city.timezone} · ` +
      `${offset} · Local: ` +
      `${localTime}`;
  });
}

/* ==========================================================
   18. TRUE MEETING ANALYSIS
========================================================== */

function sgGetTrueDailyAnalysis() {
  const results = [];

  for (let utcHour = 0; utcHour < 24; utcHour++) {
    results.push(sgAnalyzeGlobalUTCHour(utcHour));
  }

  return results;
}

/* ==========================================================
   19. TRUE MEETING SCORE
========================================================== */

function sgGetTrueMeetingScore(result) {
  if (!result || result.total === 0) {
    return -Infinity;
  }

  let score = 0;

  /*
       Everyone working is the strongest
       possible meeting condition.
    */

  if (result.everyoneWorking) {
    score += 10000;
  }

  /*
       Everyone awake is the next priority.
    */

  if (result.everyoneAwake) {
    score += 5000;
  }

  /*
       Working participants matter more
       than merely being awake.
    */

  score += result.working * 500;

  score += result.awake * 50;

  /*
       Sleeping participants are strongly
       penalized.
    */

  score -= result.sleeping * 1000;

  /*
       Prefer conventional business hours
       when possible.

       This gives a slight preference to
       windows around the middle of the
       global working day.
    */

  const hour = result.utcHour;

  const distanceFromBusinessCenter = Math.abs(hour - 12);

  score -= distanceFromBusinessCenter * 2;

  return score;
}

/* ==========================================================
   20. FIND TRUE BEST MEETING HOUR
========================================================== */

function sgFindTrueBestMeetingHour() {
  const results = sgGetTrueDailyAnalysis();

  if (!results.length) {
    return null;
  }

  let best = results[0];

  results.forEach((result) => {
    if (sgGetTrueMeetingScore(result) > sgGetTrueMeetingScore(best)) {
      best = result;
    }
  });

  return best;
}

/* ==========================================================
   21. FIND TRUE OVERLAP WINDOWS
========================================================== */

function sgFindTrueOverlapWindows() {
  const results = sgGetTrueDailyAnalysis();

  const usable = results.filter((result) => result.everyoneAwake);

  if (!usable.length) {
    return [];
  }

  const groups = [];

  let current = [];

  usable.forEach((result) => {
    if (current.length === 0) {
      current.push(result);

      return;
    }

    const previous = current[current.length - 1];

    if (result.utcHour === previous.utcHour + 1) {
      current.push(result);
    } else {
      groups.push([...current]);

      current = [result];
    }
  });

  if (current.length) {
    groups.push([...current]);
  }

  return groups.map((group) => ({
    start: group[0].utcHour,

    end: group[group.length - 1].utcHour + 1,

    duration: group.length,

    results: group,
  }));
}

/* ==========================================================
   22. TRUE BEST WINDOW
========================================================== */

function sgFindTrueBestWindow() {
  const windows = sgFindTrueOverlapWindows();

  if (!windows.length) {
    return null;
  }

  let best = windows[0];

  windows.forEach((window) => {
    const middle = Math.floor((window.start + window.end - 1) / 2);

    const analysis = sgAnalyzeGlobalUTCHour(middle);

    const score = window.duration * 1000 + analysis.working * 100;

    const bestMiddle = Math.floor((best.start + best.end - 1) / 2);

    const bestAnalysis = sgAnalyzeGlobalUTCHour(bestMiddle);

    const bestScore = best.duration * 1000 + bestAnalysis.working * 100;

    if (score > bestScore) {
      best = window;
    }
  });

  return best;
}

/* ==========================================================
   23. FORMAT UTC RANGE
========================================================== */

function sgFormatUTCRange(start, end) {
  const normalizedEnd = end % 24;

  return `${pad(start)}:00–` + `${pad(normalizedEnd)}:00 UTC`;
}

/* ==========================================================
   24. UPDATE TRUE MEETING CARD
========================================================== */

function sgUpdateTrueMeetingCard() {
  if (!bestMeetingTime) {
    return;
  }

  if (App.cities.length === 0) {
    bestMeetingTime.textContent = "--";

    return;
  }

  const best = sgFindTrueBestWindow();

  if (!best) {
    const hour = sgFindTrueBestMeetingHour();

    if (hour) {
      bestMeetingTime.textContent = `${pad(hour.utcHour)}:00 UTC`;
    } else {
      bestMeetingTime.textContent = "No overlap";
    }

    return;
  }

  bestMeetingTime.textContent = sgFormatUTCRange(best.start, best.end);
}

/* ==========================================================
   25. UPDATE TRUE OVERLAP HOURS
========================================================== */

function sgUpdateTrueOverlapHours() {
  if (!overlapHours) return;

  const windows = sgFindTrueOverlapWindows();

  const total = windows.reduce((sum, window) => sum + window.duration, 0);

  overlapHours.textContent = `${total}h`;
}

/* ==========================================================
   26. TRUE AI SUMMARY
========================================================== */

function sgUpdateTrueAISummary() {
  if (!aiSummary) return;

  if (App.cities.length === 0) {
    aiSummary.textContent =
      "Add cities to find the best global meeting window.";

    return;
  }

  const best = sgFindTrueBestMeetingHour();

  if (!best) {
    aiSummary.textContent = "Unable to calculate a meeting window.";

    return;
  }

  const total = best.total;

  if (best.everyoneWorking) {
    aiSummary.textContent = `Perfect overlap: all ${total} cities are working at ${pad(best.utcHour)}:00 UTC.`;

    return;
  }

  if (best.everyoneAwake) {
    aiSummary.textContent = `Everyone is awake at ${pad(best.utcHour)}:00 UTC. ${best.working} of ${total} cities are working.`;

    return;
  }

  aiSummary.textContent = `Best available time: ${pad(best.utcHour)}:00 UTC. ${best.working} working, ${best.awake} awake, ${best.sleeping} sleeping.`;
}

/* ==========================================================
   27. UPDATE TRUE DASHBOARD
========================================================== */

function sgUpdateTrueDashboard() {
  sgUpdateLiveStatusCards();

  sgUpdateTrueMeetingCard();

  sgUpdateTrueOverlapHours();

  sgUpdateTrueAISummary();
}

/* ==========================================================
   28. REPLACE GLOBAL MEETING ENGINE
========================================================== */

function findBestMeetingHour() {
  return sgFindTrueBestMeetingHour();
}

function analyzeGlobalDay() {
  return sgGetTrueDailyAnalysis();
}

function calculateOverlapHours() {
  const windows = sgFindTrueOverlapWindows();

  return windows.reduce((total, window) => total + window.duration, 0);
}

function findBestMeetingWindow() {
  return sgFindTrueBestWindow();
}

/* ==========================================================
   29. USER CURSOR STATE
========================================================== */

App.userSelectedCursor = false;

/* ==========================================================
   30. OVERRIDE CURSOR SELECTION
========================================================== */

function setCursorHour(hour) {
  hour = Math.max(0, Math.min(23, Number(hour)));

  App.cursorHour = hour;

  App.selectedHour = hour;

  App.userSelectedCursor = true;

  positionTimelineCursor(hour);

  highlightCursorHour(hour);

  const analysis = sgAnalyzeGlobalUTCHour(hour);

  if (cursorTime) {
    cursorTime.textContent = `${pad(hour)}:00 UTC`;
  }

  if (workingCount) {
    workingCount.textContent = analysis.working;
  }

  if (awakeCount) {
    awakeCount.textContent = analysis.awake;
  }
}

/* ==========================================================
   31. RESET CURSOR TO LIVE TIME
========================================================== */

function sgReturnToLiveTime() {
  App.userSelectedCursor = false;

  App.cursorHour = App.globalClock.utcHour;

  setCursorHour(App.globalClock.utcHour);

  App.userSelectedCursor = false;
}

/* ==========================================================
   32. TODAY BUTTON = LIVE TIME
========================================================== */

if (todayBtn) {
  todayBtn.addEventListener("click", () => {
    sgReturnToLiveTime();
  });
}

/* ==========================================================
   33. RESET BUTTON = LIVE TIME
========================================================== */

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    setTimeout(() => {
      sgReturnToLiveTime();
    }, 20);
  });
}

/* ==========================================================
   34. CURRENT UTC HOUR HIGHLIGHT
========================================================== */

function sgHighlightCurrentUTCHour() {
  if (App.userSelectedCursor) {
    return;
  }

  highlightCursorHour(App.globalClock.utcHour);

  positionTimelineCursor(App.globalClock.utcHour);
}

/* ==========================================================
   35. LIVE CLOCK LOOP
========================================================== */

function sgStartGlobalClock() {
  sgUpdateGlobalClock();

  setInterval(() => {
    sgUpdateGlobalClock();

    sgHighlightCurrentUTCHour();

    sgUpdateTrueDashboard();
  }, 1000);
}

/* ==========================================================
   36. INITIAL TRUE TIMELINE RENDER
========================================================== */

function sgInitializeTrueTimeEngine() {
  sgUpdateGlobalClock();

  renderTimeline();

  sgUpdateTrueDashboard();

  if (!App.userSelectedCursor) {
    App.cursorHour = App.globalClock.utcHour;

    highlightCursorHour(App.cursorHour);

    positionTimelineCursor(App.cursorHour);
  }

  sgStartGlobalClock();
}

/* ==========================================================
   37. WAIT FOR APP FOUNDATION
========================================================== */

if (App.isInitialized) {
  sgInitializeTrueTimeEngine();
} else {
  setTimeout(sgInitializeTrueTimeEngine, 100);
}

/* ==========================================================
   38. REFRESH TRUE ENGINE AFTER CITY CHANGES
========================================================== */

function sgRefreshTrueTimeEngine() {
  renderTimeline();

  sgUpdateTrueDashboard();

  if (App.cursorHour !== null) {
    highlightCursorHour(App.cursorHour);

    positionTimelineCursor(App.cursorHour);
  }
}

/* ==========================================================
   39. LIVE ENGINE READY
========================================================== */

console.log("SyncGrid Phase 3I: Live Global Time Engine ready.");

/* ==========================================================
   END OF PHASE 3I
========================================================== */
