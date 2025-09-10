const img = document.getElementById("pointer");

// Target location: Boston
const targetLat = 42.3601;
const targetLon = -71.0589;

let currentLat = null;
let currentLon = null;
let deviceHeading = 0; // in degrees

// Letter elements
const letters = {
  N: document.getElementById("North"),
  E: document.getElementById("East"),
  S: document.getElementById("South"),
  W: document.getElementById("West")
};

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

// Update pointer rotation and letters
function updatePointer() {
  if (currentLat === null || currentLon === null) return;

  const bearing = getBearing(currentLat, currentLon, targetLat, targetLon);
  const rotation = bearing - deviceHeading; 
  img.style.transform = `translate(-50%, -50%) rotate(${rotation + 90}deg)`;

  // Highlight closest direction letter
  highlightLetter(rotation);
}

// Highlight the nearest N/E/S/W
function highlightLetter(rotation) {
  // Normalize rotation to 0-360
  const deg = (rotation + 360) % 360;

  // Reset all letters
  for (let key in letters) {
    letters[key].style.transform = "scale(1)";
  }

  // Find closest direction
  let closest = "N";
  let minDiff = 360;

  const directions = { N: 0, E: 90, S: 180, W: 270 };

  for (let dir in directions) {
    let diff = Math.abs(deg - directions[dir]);
    if (diff > 180) diff = 360 - diff;
    if (diff < minDiff) {
      minDiff = diff;
      closest = dir;
    }
  }

  // Scale up the closest letter
  letters[closest].style.transform = "scale(1.5)";
}

// Watch GPS position
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
  console.error("Geolocation is not supported by your browser.");
}

// Create "Enable Compass" button
const enableBtn = document.createElement("button");
enableBtn.textContent = "Enable Compass";
enableBtn.style.position = "absolute";
enableBtn.style.top = "20px";
enableBtn.style.left = "50%";
enableBtn.style.transform = "translateX(-50%)";
enableBtn.style.padding = "10px 20px";
enableBtn.style.fontSize = "16px";
document.body.appendChild(enableBtn);

// Request device orientation permission
enableBtn.addEventListener("click", async () => {
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      if (response !== "granted") {
        alert("Permission denied for device orientation");
        return;
      }
    } catch (err) {
      console.error(err);
      alert("Error requesting device orientation permission");
      return;
    }
  }

  // Start listening to orientation
  window.addEventListener("deviceorientation", (event) => {
    if (event.alpha !== null) {
      deviceHeading = event.alpha; // 0 = North
      updatePointer();
    }
  });

  // Hide the button after enabling
  enableBtn.style.display = "none";
});


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






