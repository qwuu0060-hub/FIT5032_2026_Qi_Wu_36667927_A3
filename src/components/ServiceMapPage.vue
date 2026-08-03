<template>
  <div class="container my-5">
    <div class="row">
      <!-- Left Column: Controls & Center List -->
      <div class="col-md-5 mb-4">
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body p-4">
            <h3 class="mb-3">Find Nearby Support</h3>
            <p class="text-muted small">Locate psychological service centers near your current position.</p>

            <button class="btn btn-primary w-100 mb-3" @click="getUserLocation" :disabled="isLocating">
              <span v-if="isLocating">Locating your position...</span>
              <span v-else>📍 Use My Current Location</span>
            </button>

            <div class="mb-3">
              <label class="form-label small text-muted">Or Select Campus Location:</label>
              <select class="form-select form-select-sm" v-model="selectedCampus" @change="onCampusChange">
                <option value="clayton">Monash Clayton Campus</option>
                <option value="caulfield">Monash Caulfield Campus</option>
                <option value="cbd">Melbourne CBD Center</option>
              </select>
            </div>

            <div v-if="locationError" class="alert alert-warning small py-2">
              {{ locationError }}
            </div>
          </div>
        </div>

        <!-- Service Station List -->
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h5 class="mb-3">Nearby Service Stations</h5>
            <div class="list-group list-group-flush overflow-auto" style="max-height: 400px;">
              <div 
                v-for="center in sortedCenters" 
                :key="center.id" 
                class="list-group-item list-group-item-action py-3 px-2 border-bottom cursor-pointer"
                @click="focusCenterOnMap(center)"
              >
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <strong class="text-dark">{{ center.name }}</strong>
                  <span class="badge bg-info text-dark">{{ center.distanceText }}</span>
                </div>
                <p class="mb-1 text-secondary small">{{ center.address }}</p>
                <div class="d-flex justify-content-between align-items-center mt-2 small text-muted">
                  <span>📞 {{ center.phone }}</span>
                  <span class="badge bg-light text-secondary border">{{ center.type }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Map -->
      <div class="col-md-7">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body p-3 d-flex flex-column">
            <h4 class="mb-3 px-2">Interactive Location Map</h4>
            <!-- Leaflet Map Container -->
            <div id="leaflet-map" class="flex-grow-1 rounded border" style="min-height: 500px;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Preset locations
const campuses = {
  clayton: { lat: -37.9150, lng: 145.1300, name: "Monash Clayton" },
  caulfield: { lat: -37.8770, lng: 145.0440, name: "Monash Caulfield" },
  cbd: { lat: -37.8136, lng: 144.9631, name: "Melbourne CBD" }
};

const userLat = ref(-37.9150);
const userLng = ref(145.1300);
const selectedCampus = ref('clayton');
const isLocating = ref(false);
const locationError = ref('');

let map = null;
let userMarker = null;
let centerMarkers = [];

// Service Stations Data
const centersData = ref([
  {
    id: 1,
    name: 'Monash University Health Services (Clayton)',
    address: 'Campus Centre, 21 Chancellors Walk, Clayton VIC 3168',
    lat: -37.9135,
    lng: 145.1325,
    phone: '+61 3 9905 3150',
    type: 'On-Campus Clinic'
  },
  {
    id: 2,
    name: 'Headspace Counselling Centre (Glen Waverley)',
    address: 'Railway Parade, Glen Waverley VIC 3150',
    lat: -37.8795,
    lng: 145.1610,
    phone: '+61 3 9076 9400',
    type: 'Youth Support'
  },
  {
    id: 3,
    name: 'Monash Caulfield Student Wellness Hub',
    address: 'Building B, 900 Dandenong Rd, Caulfield VIC 3145',
    lat: -37.8765,
    lng: 145.0450,
    phone: '+61 3 9903 2500',
    type: 'On-Campus Clinic'
  },
  {
    id: 4,
    name: 'Melbourne Mental Health Crisis & Counselling Unit',
    address: '300 Lonsdale St, Melbourne VIC 3000',
    lat: -37.8115,
    lng: 144.9640,
    phone: '1300 22 4636',
    type: '24/7 Urgent Care'
  }
]);

// Calculate Haversine Distance (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

const sortedCenters = computed(() => {
  return centersData.value.map(c => {
    const dist = calculateDistance(userLat.value, userLng.value, c.lat, c.lng);
    return {
      ...c,
      distance: parseFloat(dist),
      distanceText: `${dist} km away`
    };
  }).sort((a, b) => a.distance - b.distance);
});

// Dynamic Leaflet CSS/JS Injector
const loadLeafletScript = () => {
  return new Promise((resolve) => {
    if (window.L) {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

const initMap = async () => {
  await loadLeafletScript();

  map = window.L.map('leaflet-map').setView([userLat.value, userLng.value], 13);

  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  updateMapMarkers();
};

const updateMapMarkers = () => {
  if (!map || !window.L) return;

  // Clear existing markers
  if (userMarker) map.removeLayer(userMarker);
  centerMarkers.forEach(m => map.removeLayer(m));
  centerMarkers = [];

  // Add User Marker
  userMarker = window.L.marker([userLat.value, userLng.value])
    .addTo(map)
    .bindPopup('<b>Your Current Reference Location</b>')
    .openPopup();

  // Add Service Station Markers
  sortedCenters.value.forEach(center => {
    const m = window.L.marker([center.lat, center.lng])
      .addTo(map)
      .bindPopup(`
        <div style="max-width:200px">
          <h6>${center.name}</h6>
          <p style="font-size:12px;margin-bottom:4px;">${center.address}</p>
          <strong style="font-size:12px;color:#0d6efd;">${center.distanceText}</strong>
        </div>
      `);
    centerMarkers.push(m);
  });
};

const getUserLocation = () => {
  isLocating.value = true;
  locationError.value = '';

  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by your browser.';
    isLocating.value = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLat.value = position.coords.latitude;
      userLng.value = position.coords.longitude;
      isLocating.value = false;
      map.setView([userLat.value, userLng.value], 14);
      updateMapMarkers();
    },
    () => {
      locationError.value = 'Unable to retrieve location. Defaulting to Monash Clayton.';
      isLocating.value = false;
    }
  );
};

const onCampusChange = () => {
  const loc = campuses[selectedCampus.value];
  if (loc) {
    userLat.value = loc.lat;
    userLng.value = loc.lng;
    map.setView([loc.lat, loc.lng], 13);
    updateMapMarkers();
  }
};

const focusCenterOnMap = (center) => {
  if (map) {
    map.setView([center.lat, center.lng], 15);
    const marker = centerMarkers.find(m => {
      const pos = m.getLatLng();
      return Math.abs(pos.lat - center.lat) < 0.0001 && Math.abs(pos.lng - center.lng) < 0.0001;
    });
    if (marker) marker.openPopup();
  }
};

onMounted(() => {
  initMap();
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.cursor-pointer:hover {
  background-color: #f8f9fa;
}
</style>