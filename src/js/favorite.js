import { getLocalStorage, setLocalStorage } from '/js/utils.mjs';

export function getFavorites() {
  return JSON.parse(getLocalStorage('travelBuddyFavorites') || '[]');
}

export function saveFavorite(item) {
  const favs = getFavorites();
  if (!favs.find(f => f.name === item.name)) {
    favs.push(item);
    setLocalStorage('travelBuddyFavorites', favs);
  }
}

export function removeFavorite(name) {
  let favs = getFavorites();
  favs = favs.filter(f => f.name !== name);
  setLocalStorage('travelBuddyFavorites', favs);
}
