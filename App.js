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

// Distance display
const distanceDisplay = document.createElement("div");
distanceDisplay.id = "DistanceDisplay";
distanceDisplay.style.position = "absolute";
distanceDisplay.style.top = "10px";
distanceDisplay.style.left = "50%";
distanceDisplay.style.transform = "translateX(-50%)";
distanceDisplay.style.background = "rgba(0,0,0,0.5)";
distanceDisplay.style.color = "white";
distanceDisplay.style.padding = "5px 10px";
distanceDisplay.style.borderRadius = "5px";
distanceDisplay.style.fontFamily = "Arial, sans-serif";
distanceDisplay.style.fontSize = "16px";
document.body.appendChild(distanceDisplay);

// ====== CONFIGURATION ======
const smoothingFactor = 0.1; // 0 = no smoothing, 1 = max smoothing
const pointerOffset = 0; // assume arrow points UP

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

// Distance between two GPS points (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // distance in meters
}

// Smooth heading to reduce wobble
function smoothHeading(newHeading) {
  smoothedHeading = smoothedHeading * (1 - smoothingFactor) + newHeading * smoothingFactor;
}

// ====== UPDATE POINTER & DISTANCE ======
function updatePointer() {
  if (!currentLat || !currentLon || !targetLat || !targetLon) return;

  const bearing = getBearing(currentLat, currentLon, targetLat, targetLon);
  let rotation = (bearing - smoothedHeading + 360) % 360;
  rotation += pointerOffset; // now always 0

  img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

  // Update distance display
  const distance = getDistance(currentLat, currentLon, targetLat, targetLon);
  distanceDisplay.textContent = distance < 1000
    ? `Distance: ${distance.toFixed(1)} m`
    : `Distance: ${(distance / 1000).toFixed(2)} km`;
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
    heading = event.webkitCompassHeading;
  } else if (event.absolute && event.alpha !== null) {
    heading = 360 - event.alpha;
  } else if (event.alpha !== null) {
    heading = event.alpha;
  }

  smoothHeading(heading);
  updatePointer();
}

// ====== INITIALIZE COMPASS ======
function initOrientation() {
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
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












