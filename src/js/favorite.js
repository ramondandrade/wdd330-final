// Utility for localStorage favorites
export function getFavorites() {
  return JSON.parse(localStorage.getItem('travelBuddyFavorites') || '[]');
}

export function saveFavorite(item) {
  const favs = getFavorites();
  if (!favs.find(f => f.name === item.name)) {
    favs.push(item);
    localStorage.setItem('travelBuddyFavorites', JSON.stringify(favs));
  }
}

export function removeFavorite(name) {
  let favs = getFavorites();
  favs = favs.filter(f => f.name !== name);
  localStorage.setItem('travelBuddyFavorites', JSON.stringify(favs));
}
