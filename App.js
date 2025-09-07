const img = document.getElementById("pointer");

document.addEventListener("mousemove", (e) => {
  const rect = img.getBoundingClientRect();
  const imgX = rect.left + rect.width / 2;
  const imgY = rect.top + rect.height / 2;

  const angle = Math.atan2(e.clientY - imgY, e.clientX - imgX);
  const degrees = angle * (180 / Math.PI);

  // adjust for your image’s default orientation
  img.style.transform = `translate(-50%, -50%) rotate(${degrees + 90}deg)`;
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