/* ============================================================
   SKYLINE — Weather App Logic
   Vanilla JS, Fetch API, async/await.
   Data source: OpenWeatherMap Current Weather API
   ============================================================ */

// ---------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------
const CONFIG = {
  // Replace with your own key from https://openweathermap.org/api
  // if this one ever stops working.
  API_KEY: "8efe6906e7e64b7a8cdeac85b5a6dd00",
  BASE_URL: "https://api.openweathermap.org/data/2.5/weather",
  UNITS: "metric", // Celsius
};

// ---------------------------------------------------------------
// DOM references (grabbed once, reused everywhere)
// ---------------------------------------------------------------
const elements = {
  form: document.getElementById("searchForm"),
  input: document.getElementById("cityInput"),
  searchBtn: document.getElementById("searchBtn"),

  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  errorMessage: document.getElementById("errorMessage"),
  hint: document.getElementById("hintText"),

  card: document.getElementById("weatherCard"),
  cityName: document.getElementById("cityName"),
  countryName: document.getElementById("countryName"),
  updatedAt: document.getElementById("updatedAt"),
  weatherIcon: document.getElementById("weatherIcon"),
  temperature: document.getElementById("temperature"),
  conditionMain: document.getElementById("conditionMain"),
  conditionDesc: document.getElementById("conditionDesc"),
  feelsLike: document.getElementById("feelsLike"),

  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("windSpeed"),
  pressure: document.getElementById("pressure"),
  visibility: document.getElementById("visibility"),
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset"),

  body: document.body,
};

// ---------------------------------------------------------------
// UI state helpers
// ---------------------------------------------------------------

/** Hide every state panel (loading, error, card, hint). */
function hideAllStates() {
  elements.loadingState.hidden = true;
  elements.errorState.hidden = true;
  elements.card.hidden = true;
  elements.hint.hidden = true;
}

function showLoading() {
  hideAllStates();
  elements.loadingState.hidden = false;
  setSearchDisabled(true);
}

function showError(message) {
  hideAllStates();
  elements.errorMessage.textContent = message;
  elements.errorState.hidden = false;
  setSearchDisabled(false);
}

function showCard() {
  hideAllStates();
  elements.card.hidden = false;
  setSearchDisabled(false);
}

function setSearchDisabled(isDisabled) {
  elements.searchBtn.disabled = isDisabled;
  elements.input.disabled = isDisabled;
  elements.searchBtn.style.opacity = isDisabled ? "0.7" : "1";
}

// ---------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------

/** Convert a UNIX timestamp (+ timezone offset in seconds) to "H:MM AM/PM". */
function formatTime(unixSeconds, timezoneOffsetSeconds) {
  const utcMillis = (unixSeconds + timezoneOffsetSeconds) * 1000;
  const date = new Date(utcMillis);
  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

/** Convert meters/second to kilometers/hour. */
function msToKmh(ms) {
  return Math.round(ms * 3.6);
}

/** Convert meters to kilometers, one decimal place. */
function metersToKm(meters) {
  return (meters / 1000).toFixed(1);
}

/** "Wednesday, 3:45 PM" style local-machine timestamp for "last updated". */
function formatNow() {
  return new Date().toLocaleString(undefined, {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Map an OpenWeatherMap "main" condition to one of our CSS sky themes.
 * Falls back to a neutral theme for anything unrecognized.
 */
function themeClassFor(conditionMain) {
  const key = conditionMain.toLowerCase();
  const known = [
    "clear",
    "clouds",
    "rain",
    "drizzle",
    "thunderstorm",
    "snow",
    "mist",
    "haze",
    "fog",
  ];
  return known.includes(key) ? `weather-${key}` : "weather-default";
}

/** Swap the body's theme class to match the current weather. */
function applyTheme(conditionMain) {
  const themeClasses = [
    "weather-default",
    "weather-clear",
    "weather-clouds",
    "weather-rain",
    "weather-drizzle",
    "weather-thunderstorm",
    "weather-snow",
    "weather-mist",
    "weather-haze",
    "weather-fog",
  ];
  elements.body.classList.remove(...themeClasses);
  elements.body.classList.add(themeClassFor(conditionMain));
}

// ---------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------

/** Populate the weather card with data from the API response. */
function renderWeather(data) {
  const { name, sys, main, weather, wind, visibility, timezone } = data;
  const condition = weather[0];

  elements.cityName.textContent = name;
  elements.countryName.textContent = sys.country || "";
  elements.updatedAt.textContent = `Updated ${formatNow()}`;

  elements.weatherIcon.src = `https://openweathermap.org/img/wn/${condition.icon}@4x.png`;
  elements.weatherIcon.alt = condition.description;

  elements.temperature.textContent = `${Math.round(main.temp)}°`;
  elements.conditionMain.textContent = condition.main;
  elements.conditionDesc.textContent = condition.description;
  elements.feelsLike.textContent = `${Math.round(main.feels_like)}°`;

  elements.humidity.textContent = `${main.humidity}%`;
  elements.windSpeed.textContent = `${msToKmh(wind.speed)} km/h`;
  elements.pressure.textContent = `${main.pressure} hPa`;
  elements.visibility.textContent = `${metersToKm(visibility)} km`;
  elements.sunrise.textContent = formatTime(sys.sunrise, timezone);
  elements.sunset.textContent = formatTime(sys.sunset, timezone);

  applyTheme(condition.main);
  showCard();
}

// ---------------------------------------------------------------
// Networking
// ---------------------------------------------------------------

/**
 * Fetch current weather for a given city name.
 * Throws a descriptive Error for the UI layer to catch and display.
 */
async function fetchWeather(city) {
  const url = `${CONFIG.BASE_URL}?q=${encodeURIComponent(city)}&units=${CONFIG.UNITS}&appid=${CONFIG.API_KEY}`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    // fetch() itself rejects on DNS failure / offline / CORS block
    throw new Error("No internet connection. Please check your network and try again.");
  }

  if (response.status === 404) {
    throw new Error(`We couldn't find "${city}". Check the spelling and try again.`);
  }

  if (response.status === 401) {
    throw new Error("Invalid API key. Please check your OpenWeatherMap API key.");
  }

  if (!response.ok) {
    throw new Error(`Something went wrong (error ${response.status}). Please try again.`);
  }

  return response.json();
}

// ---------------------------------------------------------------
// Main search flow
// ---------------------------------------------------------------

async function handleSearch(city) {
  const trimmedCity = city.trim();

  if (!trimmedCity) {
    showError("Please enter a city name.");
    return;
  }

  showLoading();

  try {
    const data = await fetchWeather(trimmedCity);
    renderWeather(data);
  } catch (error) {
    showError(error.message || "Something went wrong. Please try again.");
  }
}

// ---------------------------------------------------------------
// Event wiring
// ---------------------------------------------------------------

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSearch(elements.input.value);
});

// Auto-load a default city on first visit so the card isn't empty.
window.addEventListener("DOMContentLoaded", () => {
  handleSearch("Islamabad");
});