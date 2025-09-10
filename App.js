const img = document.getElementById("pointer");

// Target location (change these coordinates as needed)
const targetLat = 42.3601; // example: Boston
const targetLon = -71.0589;

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
  return (toDeg(brng) + 360) % 360; // normalize 0–360 degrees
}

// Continuously track your location and rotate the pointer
if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const bearing = getBearing(latitude, longitude, targetLat, targetLon);

      // Rotate the pointer image (+90 degrees if needed)
      img.style.transform = `translate(-50%, -50%) rotate(${bearing + 90}deg)`;
    },
    (err) => {
      console.error("Geolocation error:", err.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
} else {
  console.error("Geolocation is not supported by your browser.");
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


