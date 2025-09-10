const img = document.getElementById("pointer");

// Target location (Boston)
const targetLat = 42.3601;
const targetLon = -71.0589;

let currentLat = null;
let currentLon = null;
let deviceHeading = 0; // in degrees

// Calculate bearing from current position to target
function getBearing(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const toDeg = rad => rad * 180 / Math.PI;

  const dLon = toRad(lon2 - lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let brng = Math.atan2(y, x);
  return (toDeg(brng) + 360) % 360;
}

// Update pointer rotation
function updatePointer() {
  if (currentLat === null || currentLon === null) return;

  const bearing = getBearing(currentLat, currentLon, targetLat, targetLon);
  const rotation = bearing - deviceHeading;
  img.style.transform = `translate(-50%, -50%) rotate(${rotation + 90}deg)`;
}

// Watch GPS
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

// Request device orientation permission (iOS 13+)
function initOrientation() {
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          console.error("Device orientation permission denied");
        }
      })
      .catch(console.error);
  } else {
    // Non-iOS devices
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
}

function handleOrientation(event) {
  if (event.alpha !== null) {
    deviceHeading = event.alpha;
    updatePointer();
  }
}

// Initialize
initOrientation();


// location code 

const infoDiv = document.getElementById("info");
const btn = document.getElementById("PinLocation");

btn.addEventListener("click", () => {
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
      },
      (error) => {
        infoDiv.textContent = `Error: ${error.message}`;
      },
      {
        enableHighAccuracy: true, // request GPS if available
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    infoDiv.textContent = "Geolocation is not supported by your browser.";
  }
});




