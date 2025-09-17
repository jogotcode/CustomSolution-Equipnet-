// ====== POINTER & LOCATION VARIABLES ======
const img = document.getElementById("pointer");

// Target location (pinned location)
let targetLat = null;
let targetLon = null;

// Current device location & heading
let currentLat = null;
let currentLon = null;
let deviceHeading = 0; // in degrees

// ====== UTILITY FUNCTIONS ======
// Convert degrees ↔ radians
const toRad = deg => deg * Math.PI / 180;
const toDeg = rad => rad * 180 / Math.PI;

// Calculate bearing from current position to target
function getBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Update pointer rotation
function updatePointer() {
  if (
    currentLat === null || currentLon === null ||
    targetLat === null || targetLon === null
  ) return;

  const bearing = getBearing(currentLat, currentLon, targetLat, targetLon);
  const rotation = bearing - deviceHeading;

  img.style.transform = `translate(-50%, -50%) rotate(${rotation + 90}deg)`;
}

// ====== GEOLOCATION WATCH ======
if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition(
    (pos) => {
      currentLat = pos.coords.latitude;
      currentLon = pos.coords.longitude;
      updatePointer();
    },
    (err) => console.error("Geolocation error:", err.message),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
} else {
  console.error("Geolocation not supported");
}

// ====== DEVICE ORIENTATION (COMPASS) ======
function handleOrientation(event) {
  if (event.absolute && event.alpha !== null) {
    deviceHeading = 360 - event.alpha;
  } else if (event.webkitCompassHeading !== undefined) {
    deviceHeading = event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    deviceHeading = event.alpha;
  }

  updatePointer();
}

// Request orientation permission (iOS 13+)
function initOrientation() {
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === "granted") {
          GetPinnedLocation();
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          console.error("Device orientation permission denied");
        }
      })
      .catch(console.error);
  } else {
    GetPinnedLocation();
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
}

// Activate button
const activateBtn = document.getElementById("ActivateBtn");
activateBtn.addEventListener("click", () => {
  initOrientation();
});

// ====== PIN LOCATION ======
const infoDiv = document.getElementById("info");
const btn = document.getElementById("PinLocation");

btn.addEventListener("click", (event) => {
  event.preventDefault();
  if ("geolocation" in navigator) {
    infoDiv.textContent = "Getting location...";
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        infoDiv.innerHTML = `
          <strong>Latitude:</strong> ${latitude} <br>
          <strong>Longitude:</strong> ${longitude} <br>
          <strong>Accuracy:</strong> ±${accuracy} meters
        `;
        sessionStorage.setItem("latitude", latitude);
        sessionStorage.setItem("longitude", longitude);
        sessionStorage.setItem("accuracy", accuracy);

        // Update target immediately
        GetPinnedLocation();
      },
      (error) => {
        infoDiv.textContent = `Error: ${error.message}`;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    infoDiv.textContent = "Geolocation is not supported by your browser.";
  }
});

// ====== SESSION STORAGE HANDLING ======
// Load pinned location from sessionStorage
function loadPinnedLocation() {
  const lat = sessionStorage.getItem("latitude");
  const lon = sessionStorage.getItem("longitude");

  targetLat = lat ? parseFloat(lat) : null;
  targetLon = lon ? parseFloat(lon) : null;
}

// Call on page load
loadPinnedLocation();

// Update pinned location (called on button click or init)
function GetPinnedLocation() {
  loadPinnedLocation();
}










