// Simple itinerary planner using localStorage
export function getItinerary() {
  return JSON.parse(localStorage.getItem('travelBuddyItinerary') || '[]');
}

export function addToItinerary(item) {
  const itin = getItinerary();
  if (!itin.find(i => i.name === item.name)) {
    itin.push(item);
    localStorage.setItem('travelBuddyItinerary', JSON.stringify(itin));
  }
}

export function removeFromItinerary(name) {
  let itin = getItinerary();
  itin = itin.filter(i => i.name !== name);
  localStorage.setItem('travelBuddyItinerary', JSON.stringify(itin));
}
