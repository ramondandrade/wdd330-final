import { getLocalStorage, setLocalStorage } from '/js/utils.mjs';

export function getItinerary() {
  return JSON.parse(getLocalStorage('travelBuddyItinerary') || '[]');
}

export function addToItinerary(item) {
  const itin = getItinerary();
  if (!itin.find(i => i.name === item.name)) {
    itin.push(item);
    setLocalStorage('travelBuddyItinerary', itin);
  }
}

export function removeFromItinerary(name) {
  let itin = getItinerary();
  itin = itin.filter(i => i.name !== name);
  setLocalStorage('travelBuddyItinerary', itin);
}
