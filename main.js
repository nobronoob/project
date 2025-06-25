
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  GeoPoint,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDhIJ4a4mEHbLYDXmOXorGe0VJ4l6XVqFE",
  authDomain: "finaldemo-38f19.firebaseapp.com",
  projectId: "finaldemo-38f19",
  storageBucket: "finaldemo-38f19.appspot.com",
  messagingSenderId: "260614975704",
  appId: "1:260614975704:web:c215f2d1fc257d522da7ad"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Toggle login/signup forms
window.toggleForms = () => {
  document.getElementById("login-form").classList.toggle("hidden");
  document.getElementById("signup-form").classList.toggle("hidden");
};

// Toggle Map Modal
window.toggleMapModal = () => {
  const modal = document.getElementById("mapModal");
  modal.classList.toggle("hidden");
  setTimeout(() => {
    map.invalidateSize();
  }, 400);
};

// Leaflet Map Initialization
let selectedLatLng = null;
let marker = null;

const map = L.map("map").setView([27.7172, 85.3240], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

function placeMarker(latlng) {
  selectedLatLng = latlng;
  if (marker) {
    marker.setLatLng(latlng);
  } else {
    marker = L.marker(latlng).addTo(map);
  }
}

// On map click: set marker and reverse geocode
map.on("click", (e) => {
  placeMarker(e.latlng);
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("address").value = data.display_name || `Lat: ${e.latlng.lat.toFixed(5)}, Lng: ${e.latlng.lng.toFixed(5)}`;
    })
    .catch(() => {
      document.getElementById("address").value = `Lat: ${e.latlng.lat.toFixed(5)}, Lng: ${e.latlng.lng.toFixed(5)}`;
      toggleMapModal();
    });
});

// If location access is granted, center map
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((pos) => {
    const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
    map.setView(latlng, 15);
    placeMarker(latlng);
  });
}

// Address Input Search (Nepal only)
document.getElementById("address").addEventListener("change", () => {
  const query = document.getElementById("address").value.trim();
  if (!query) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const latlng = L.latLng(data[0].lat, data[0].lon);
        map.setView(latlng, 16);
        placeMarker(latlng);
      } else {
        alert("No location found in Nepal for that query.");
      }
    });
});

// Signup Handler
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("customerName").value.trim();
  const email = document.getElementById("new-email").value.trim();
  const password = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (!selectedLatLng) {
    alert("Please select your location using the map.");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    await setDoc(doc(db, "usercreds", uid), {
      name,
      email,
      phone,
      address,
      location: new GeoPoint(selectedLatLng.lat, selectedLatLng.lng),
      uid,
      createdAt: Timestamp.now()
    });

    alert(" Account created!");
    window.location.href = "customer-login/index.html";
  } catch (err) {
    alert(" Signup failed: " + err.message);
  }
});

// Login Handler
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // Check if provider
    const providerSnap = await getDocs(query(collection(db, "providercreds"), where("email", "==", email)));
    if (!providerSnap.empty) {
      window.location.href = "provider_dashboard.html";
      return;
    }

    // Check if customer
    const userSnap = await getDocs(query(collection(db, "usercreds"), where("email", "==", email)));
    if (!userSnap.empty) {
      window.location.href = "customer-login/index.html";
      return;
    }

    alert("Login failed: No matching user found.");
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

