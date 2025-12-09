<template>
  <div class="delivery-map-container" :style="{ height: height }">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
  height: {
    type: String,
    default: '400px'
  },
  center: {
    type: Array,
    default: () => [34.5228, 69.1787] // Kabul coordinates
  },
  zoom: {
    type: Number,
    default: 13
  }
});

const mapContainer = ref(null);
const map = ref(null);

onMounted(() => {
  if (mapContainer.value) {
    // Initialize map
    map.value = L.map(mapContainer.value).setView(props.center, props.zoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.value);

    // Add Delivery Zone Circle (approx 5km radius)
    L.circle(props.center, {
      color: '#e76f1a', // Primary color
      fillColor: '#e76f1a',
      fillOpacity: 0.2,
      radius: 5000
    }).addTo(map.value);

    // Add Marker for Store Location
    const storeIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png', // Generic marker or custom asset
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -30]
    });

    L.marker(props.center, { icon: storeIcon })
      .addTo(map.value)
      .bindPopup("<b>Dookan HQ</b><br>Fast Delivery Center")
      .openPopup();
  }
});
</script>

<style scoped>
.delivery-map-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.map-container {
  width: 100%;
  height: 100%;
  z-index: 1; /* Ensure map stays below fixed headers usually, but above background */
}
</style>
