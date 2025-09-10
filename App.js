const img = document.getElementById("pointer");
const info = document.getElementById("info");

// 🎯 Target location (example: Boston)
const targetLat = 42.3601;
const targetLon = -71.0589;

// Bearing calculation
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
  return (toDeg(brng) + 360) % 360; // normalize to 0–360
}

if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const bearing = getBearing(latitude, longitude, targetLat, targetLon);

      // Rotate image (+90 offset so north points up)
      img.style.transform = `translate(-50%, -50%) rotate(${bearing + 90}deg)`;

      // Debug info
      info.innerHTML = `
        <strong>Updated:</strong> ${new Date().toLocaleTimeString()}<br>
        <strong>Lat:</strong> ${latitude.toFixed(5)}<br>
        <strong>Lon:</strong> ${longitude.toFixed(5)}<br>
        <strong>Accuracy:</strong> ±${accuracy.toFixed(1)}m<br>
        <strong>Bearing to Target:</strong> ${bearing.toFixed(2)}°
      `;
    },
    (error) => {
      info.textContent = "Error: " + error.message;
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
} else {
  info.textContent = "Geolocation is not supported by your browser.";
}



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

