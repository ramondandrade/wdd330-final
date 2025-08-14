export function renderMap(lat = 35.6895, lng = 139.6917, label = 'Tokyo') {
  return `<div class="map"><iframe width="100%" height="350" frameborder="0" style="border:0" 
    src="https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.05}%2C${lat-0.05}%2C${lng+0.05}%2C${lat+0.05}&layer=mapnik&marker=${lat}%2C${lng}" allowfullscreen></iframe>
    <div style="text-align:center;">${label}</div></div>`;
}

export async function getUserLocation() {
  try {
    const res = await fetch('https://free.freeipapi.com/api/json/');
    return await res.json();
  } catch (e) {
    return null;
  }
}
