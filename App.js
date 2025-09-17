// ====== POINTER & LOCATION VARIABLES ======
const img = document.getElementById("pointer");

// Target location (pinned location from localStorage)
let targetLat = null;
let targetLon = null;

// Current device location & heading
let currentLat = null;
let currentLon = null;
let deviceHeading = 0; // degrees
let smoothedHeading = 0; // for smoothing pointer

// Pointer orientation offset (auto-detect)
let pointerOffset = 0;

// ====== CONFIGURATION ======
const smoothingFactor = 0.1; // 0 = no smoothing, 1 = max smoothing

// ====== UTILITY FUNCTIONS ======
const toRad = deg => deg * Math.PI / 180;
const toDeg = rad => rad * 180 / Math.PI;

// Bearing from current location to target
function getBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// ====== AUTO-ADJUST POINTER ======
function detectPointerOrientation() {
  const tempImg = new Image();
  tempImg.src = img.src;

  tempImg.onload = () => {
    if (tempImg.width > tempImg.height) pointerOffset = 90; // arrow points RIGHT
    else pointerOffset = 0; // arrow points UP
  };
}

// Call on page load
detectPointerOrientation();

// Smooth heading to reduce wobble
function smoothHeading(newHeading) {
  smoothedHeading = smoothedHeading * (1 - smoothingFactor) + newHeading * smoothingFactor;
}

// ====== UPDATE POINTER ======
function updatePointer() {
  if (!currentLat || !currentLon || !targetLat || !targetLon) return;

  const bearing = getBearing(currentLat, currentLon, targetLat, targetLon);
  let rotation = (bearing - smoothedHeading + 360) % 360;

  // Apply pointer offset automatically
  rotation += pointerOffset;

  img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
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
  let heading = 0;

  if (event.webkitCompassHeading !== undefined) {
    // iOS: heading in degrees from magnetic north
    heading = event.webkitCompassHeading;
  } else if (event.absolute && event.alpha !== null) {
    // Android & some browsers
    heading = 360 - event.alpha;
  } else if (event.alpha !== null) {
    // Fallback
    heading = event.alpha;
  }

  smoothHeading(heading);
  updatePointer();
}

// ====== INITIALIZE COMPASS ======
function initOrientation() {
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    // iOS 13+ requires user permission
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
    // Android + older browsers
    loadPinnedLocation();
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
}

// ====== PINNED LOCATION HANDLING ======
function loadPinnedLocation() {
  const lat = localStorage.getItem("latitude");
  const lon = localStorage.getItem("longitude");

  if (lat && lon) {
    targetLat = parseFloat(lat);
    targetLon = parseFloat(lon);
    console.log("Pinned location loaded:", targetLat, targetLon);
  } else {
    console.log("No pinned location found. Use 'Pin Location' to set one.");
  }
}

// Save current location as pinned target
function savePinnedLocation() {
  if (currentLat && currentLon) {
    localStorage.setItem("latitude", currentLat);
    localStorage.setItem("longitude", currentLon);
    targetLat = currentLat;
    targetLon = currentLon;
    alert(`Pinned location saved:\nLat: ${currentLat}\nLon: ${currentLon}`);
  } else {
    alert("Current location not available yet. Try again in a moment.");
  }
}

// ====== BUTTON HOOKS ======
const activateBtn = document.getElementById("ActivateBtn");
if (activateBtn) activateBtn.addEventListener("click", initOrientation);

const pinBtn = document.getElementById("PinLocation");
if (pinBtn) pinBtn.addEventListener("click", savePinnedLocation);

// Load pinned location on page load
loadPinnedLocation();








