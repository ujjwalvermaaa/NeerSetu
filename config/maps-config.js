// Maps Configuration - OpenStreetMap (Free)
// No API key required!

export const MAPS_CONFIG = {
  provider: "openstreetmap",
  apiKey: "not_required",
  enabled: true,
  
  // OpenStreetMap tile server (completely free)
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© OpenStreetMap contributors",
  
  // Alternative free tile servers
  alternatives: [
    {
      name: "CartoDB Positron",
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: "© OpenStreetMap © CartoDB"
    },
    {
      name: "CartoDB Dark Matter",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "© OpenStreetMap © CartoDB"
    }
  ],
  
  // Default map settings
  defaultCenter: [26.1445, 91.7362], // Northeast India coordinates
  defaultZoom: 10,
  
  // Village coordinates for Northeast India
  villages: [
    { name: "Village A", lat: 26.1445, lng: 91.7362, district: "Kamrup" },
    { name: "Village B", lat: 26.2000, lng: 91.8000, district: "Kamrup" },
    { name: "Village C", lat: 26.1000, lng: 91.7000, district: "Kamrup" },
    { name: "Village D", lat: 26.1500, lng: 91.7500, district: "Kamrup" },
    { name: "Village E", lat: 26.1800, lng: 91.7800, district: "Kamrup" }
  ]
};

// Map utility functions
export class MapService {
  static getTileUrl() {
    return MAPS_CONFIG.tileUrl;
  }
  
  static getAttribution() {
    return MAPS_CONFIG.attribution;
  }
  
  static getDefaultCenter() {
    return MAPS_CONFIG.defaultCenter;
  }
  
  static getDefaultZoom() {
    return MAPS_CONFIG.defaultZoom;
  }
  
  static getVillages() {
    return MAPS_CONFIG.villages;
  }
  
  static getVillageCoordinates(villageName) {
    const village = MAPS_CONFIG.villages.find(v => v.name === villageName);
    return village ? [village.lat, village.lng] : MAPS_CONFIG.defaultCenter;
  }
}

export default MAPS_CONFIG;

