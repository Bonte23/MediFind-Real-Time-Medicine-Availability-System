/**
 * MediFind Geo-Distance Utility using Haversine formula
 */

/**
 * Calculates great-circle distance between two points on the Earth
 * @param {number} lat1 - Latitude of Point 1 (in decimal degrees)
 * @param {number} lon1 - Longitude of Point 1 (in decimal degrees)
 * @param {number} lat2 - Latitude of Point 2 (in decimal degrees)
 * @param {number} lon2 - Longitude of Point 2 (in decimal degrees)
 * @param {string} unit - 'km' (default) or 'mi'
 * @returns {number} distance in selected unit rounded to 2 decimal places
 */
function calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined ||
      lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    return null;
  }

  const p1 = Number(lat1);
  const l1 = Number(lon1);
  const p2 = Number(lat2);
  const l2 = Number(lon2);

  if (isNaN(p1) || isNaN(l1) || isNaN(p2) || isNaN(l2)) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371; // Earth's radius in kilometers

  const dLat = toRad(p2 - p1);
  const dLon = toRad(l2 - l1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1)) * Math.cos(toRad(p2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let distance = earthRadiusKm * c;

  if (unit === 'mi') {
    distance = distance * 0.621371;
  }

  return Number(distance.toFixed(2));
}

/**
 * Sorts array of objects containing latitude and longitude by distance from patient location
 * @param {Array} items - Array of items
 * @param {number} userLat - User latitude
 * @param {number} userLng - User longitude
 * @returns {Array} sorted array with distance_km attached
 */
function sortByDistance(items, userLat, userLng) {
  if (!userLat || !userLng) return items;

  return items
    .map(item => {
      const lat = item.latitude || (item.pharmacy && item.pharmacy.latitude);
      const lng = item.longitude || (item.pharmacy && item.pharmacy.longitude);
      const dist = calculateDistance(userLat, userLng, lat, lng, 'km');
      return {
        ...item,
        distance_km: dist !== null ? dist : 99999
      };
    })
    .sort((a, b) => a.distance_km - b.distance_km);
}

module.exports = {
  calculateDistance,
  sortByDistance
};
