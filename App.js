// ====== POINTER & LOCATION VARIABLES ======
const img = document.getElementById("pointer");

// Target location (pinned location from localStorage)
let targetLat = null;
let targetLon = null;

// Current device location & heading
let currentLat = null;
let currentLon = null;
let deviceHeading = 0; // degrees

// ====== UTILITY FUNCTIONS ======
// Degrees ↔ Radians
const toRad = deg => deg * Math.PI / 180;
const toDeg = rad => rad * 180 / Math.PI;

// Bearing between two GPS coordinates
function getBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Rotate pointer towards target
function updatePointer() {
  if (!currentLat || !currentLon || !targetLat || !targetLon) return;

  const bearing = getBearing(currentLat, currentLon, targetLat, targetLon);
  const rotation = bearing - deviceHeading;

  // "+90" adjusts depending on arrow graphic orientation
  img.style.transform = `translate(-50%, -50%) rotate(${rotation + 90}deg)`;
}

// ====== GEOLOCATION ======
if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition(
    pos => {
      currentLat = pos.coords.latitude;
      currentLon = pos.coords.longitude;
      updatePointer();
    },
    err => console.error("Geolocation error:", err.message),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
} else {
  alert("Geolocation not supported on this device.");
}

// ====== DEVICE ORIENTATION ======
function handleOrientation(event) {
  if (event.webkitCompassHeading !== undefined) {
    // iOS Safari / Chrome on iOS
    deviceHeading = event.webkitCompassHeading;
  } else if (event.absolute && event.alpha !== null) {
    // Android & some browsers
    deviceHeading = 360 - event.alpha;
  } else if (event.alpha !== null) {
    // Fallback
    deviceHeading = event.alpha;
  }
  updatePointer();
}

function initOrientation() {
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    // iOS 13+ (Safari/Chrome on iOS)
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === "granted") {
          loadPinnedLocation();
          window.addEventListener("deviceorientationabsolute", handleOrientation, true);
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          alert("Compass access denied.");
        }
      })
      .catch(console.error);
  } else {
    // Android + desktop
    loadPinnedLocation();
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
}

// ====== PINNED LOCATION ======
function loadPinnedLocation() {
  const lat = localStorage.getItem("latitude");
  const lon = localStorage.getItem("longitude");

  if (lat && lon) {
    targetLat = parseFloat(lat);
    targetLon = parseFloat(lon);
    console.log("Pinned location loaded:", targetLat, targetLon);
  } else {
    console.log("No pinned location found.");
  }
}

// Save current location as pinned target
function savePinnedLocation() {
  if (currentLat && currentLon) {
    localStorage.setItem("latitude", currentLat);
    localStorage.setItem("longitude", currentLon);
    targetLat = currentLat;
    targetLon = currentLon;
    alert(`Pinned location saved:\nLat: ${currentLat}, Lon: ${currentLon}`);
  } else {
    alert("Current location not available yet. Try again in a moment.");
  }
}

// ====== BUTTON HOOKS ======
const activateBtn = document.getElementById("ActivateBtn");
if (activateBtn) activateBtn.addEventListener("click", initOrientation);

const pinBtn = document.getElementById("PinLocation");
if (pinBtn) pinBtn.addEventListener("click", savePinnedLocation);

// Load pinned location immediately when page opens
loadPinnedLocation();




