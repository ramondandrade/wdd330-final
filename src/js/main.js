import { getLocalStorage, setLocalStorage } from '/js/utils.mjs';
import { getItinerary, addToItinerary, removeFromItinerary } from '/js/itinerary.js';
import { cities } from '/js/data.js';
import { renderMap, getUserLocation } from '/js/map.js';
import { getFavorites, saveFavorite, removeFavorite } from '/js/favorite.js';

function renderFavCard(item, type, cityName) {
  const favs = getFavorites();
  const itinerary = getItinerary();
  const isFav = favs.find(f => f.name === item.name);
  const isInItinerary = itinerary.find(f => f.name === item.name);
  return `<div class='card favorite-card'>
    <b>${item.name}</b>${cityName ? ` in ${cityName}` : ''}
    <span class='favorite${isFav ? ' active' : ''}' data-name='${item.name}' title='Save as favorite'>&#9733;</span>
    ${item.desc ? `<div>${item.desc}</div>` : ''}
    ${item.rating ? `<div>${renderRating(item)}</div>` : ''}
    ${item.formattedAddress ? `<div class="address"><a href="https://maps.google.com/?q=${encodeURIComponent(item.name)}" target="_blank">${item.formattedAddress} </a></div>` : ''}
    ${`<div><br><button class="button add-to-itinerary ${isInItinerary ? ' active' : ''}" data-name="${item.name}">${isInItinerary ? 'Added to Itinerary!' : 'Add to Itinerary'}</button></div>`}
  </div>`;
}

function renderRating(item) {
  const stars = '⭐'.repeat(Math.round(item.rating));
  return item.rating ? `<div>${item.rating} ${stars}</div>` : '';
}

function attachFavEvents() {

  document.querySelectorAll('.favorite').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.getAttribute('data-name');
      console.log(`Toggling favorite for: ${name}`);
      if (el.classList.contains('active')) {
        removeFavorite(name);
        el.classList.remove('active');
      } else {
        saveFavorite({ name });
        el.classList.add('active');
      }
    });
  });

}

function attachItineraryEvents() {
  document.querySelectorAll('.add-to-itinerary').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.getAttribute('data-name');
      if (el.classList.contains('active')) {
        removeFromItinerary(name);
        el.classList.remove('active');
        el.innerText = 'Add to Itinerary';
      } else {
        addToItinerary({ name });
        el.classList.add('active');
        el.innerText = 'Added to Itinerary!';
      }
    });
  });
}

const app = document.getElementById('app');

function renderHeader() {
  return `
    <header>
      <div class="logo">
       <h1>Travel Buddy Planner</h1>
      </div>
      <nav>
        <a href="#home">Home</a>
        <a href="#search">Explore Cities</a>
        <a href="#itinerary">My Itinerary</a>
        <a href="#favorite">Favorites</a>
        <!--<a href="#auth">Login</a>-->
      </nav>
    </header>
  `;
}

function renderHome() {
  const cityList = [
    { name: 'Tokyo', label: 'Tokyo' },
    { name: 'Delhi', label: 'Delhi' },
    { name: 'Shanghai', label: 'Shanghai' },
    { name: 'São Paulo', label: 'São Paulo' },
    { name: 'New York', label: 'New York' }
  ];
  return `
    <div id="hero-banner" class="hero-banner">
      <div class="hero-content">
        <h2>Explore the World's Greatest Cities</h2>
        <p>Discover amazing attractions, delicious food, and create your perfect travel itinerary.</p>
      </div>
    </div>
    <div>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-bottom:2rem;">
        ${cityList.map(city => `<button class="button city-btn" data-city="${city.name}">${city.label}</button>`).join('')}
      </div>
    </div>
    <div class="container">
      <div id="cityData"></div>
    </div>
  `;

}

function renderSearch() {
  return `
    <div class="container">
      <h2>Explore New Cities</h2>
      <input id="searchInput" type="text" placeholder="Search for a city, attraction, or food..." />
      <button class="button" id="searchBtn">Find</button>
      <br><br>
      <button class="button" id="findNearMe">Find Near Me</button>
    
      <div id="searchResults"></div>
      <div id="mapContainer"></div>
    </div>
  `;
}

function renderItinerary() {
  return `
    <div class="container">
      <h2>Trip Itinerary Planner</h2>
      <div id="itineraryList"></div>
    </div>
  `;
}

function renderFavorite() {
  return `
    <div class="container">
      <h2>Favorites</h2>
      <div id="favoriteList"></div>
    </div>
  `;
}

function renderAuth() {
  return `
    <div class="container">
      <h2>Login / Register</h2>
      <input id="username" type="text" placeholder="Username" />
      <input id="password" type="password" placeholder="Password" />
      <button class="button" id="loginBtn">Login</button>
    </div>
  `;
}

function renderPage(hash) {

  let content = '';
  switch (hash) {
    case '#search':
      content = renderSearch();
      break;
    case '#itinerary':
      content = renderItinerary();
      break;
    case '#favorite':
      content = renderFavorite();
      break;
    case '#auth':
      content = renderAuth();
      break;
    default:
      content = renderHome();
  }
  app.innerHTML = renderHeader() + content;
  setTimeout(() => {
    attachEvents(hash);
  }, 100);

}

async function fetchGooglePlaces(city, type) {
  const apiKey = 'AIzaSyARGcrrBKa8HWQQBU3BHxSjSDMh4r8ZYrc';
  const query = `${type} in ${city}`;

  try {

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating'
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 18 })
    });

    const data = await response.json();
    if (data.places) {
      const results = data.places.map(result => ({
        name: result.displayName.text,
        formattedAddress: result.formattedAddress,
        rating: result.rating
      }));

      return results;
    } else {
      console.warn(`No results found for ${type} in ${city}`);
      return [];
    }
  } catch (error) {
    console.error('Error fetching data from Google Places API:', error);
    return [];
  }

}

function renderCitySection(title, items, type) {
  if (!items || !items.length) return '';
  if (type === 'foods') {
    return `<div><h3>${title}</h3><ul>${items.map(f => `<li>${f}</li>`).join('')}</ul></div>`;
  }
  return `<div><h3>${title}</h3><div class="card-container">${items.map(i => renderFavCard(i, type)).join('')}</div></div>`;
}

function attachEvents(hash) {

  // Add event listeners for each module as needed
  if (hash === '' || hash === '#home' || !hash) {

    var city;
    var lastCity = getLastSelectedCity();
    if (lastCity == null) {
      lastCity = "Tokyo";
    }

    setTimeout(() => {
      document.querySelector(`.city-btn[data-city="${lastCity}"]`).click();
    }, 500);

    document.querySelectorAll('.city-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        city = btn.getAttribute('data-city');
        setLastSelectedCity(city);
        
        document.querySelectorAll('.city-btn').forEach(btn => btn.classList.remove('active'));
        setTimeout(() => {
            document.querySelector(`.city-btn[data-city="${city}"]`).classList.add('active');
        }, 100);

        const cityData = cities.find(c => c.city.toLowerCase() === city.toLowerCase());
        if (cityData && cityData.background) {
          console.log(`Selected city: ${city}`, cityData);
          document.getElementById('hero-banner').style.backgroundImage = `url('${cityData.background}')`;
        } else {
          document.getElementById('hero-banner').style.backgroundImage = `url('/default-city-image.jpg')`;
        }

        document.getElementById('cityData').innerHTML = '<p>Loading...</p>';
        // Fetch data (simulate Google API)
        const [attractions, restaurants, foods] = await Promise.all([
          fetchGooglePlaces(city, 'attractions'),
          fetchGooglePlaces(city, 'restaurants'),
          //fetchGooglePlaces(city, 'foods')
        ]);
        document.getElementById('cityData').innerHTML =
          renderCitySection('Top Attractions in ' + city.toUpperCase(), attractions, 'attraction') +
          renderCitySection('Top Restaurants in ' + city.toUpperCase(), restaurants, 'restaurant');
        //renderCitySection('Top Popular Foods', foods, 'foods');

        setTimeout(() => {
          attachFavEvents();
          attachItineraryEvents();
        }, 500);
      });
    });
  }

  if (hash === '#search') {
    // Attach event listener here, after the search input is rendered
      setTimeout(() => {

        document.getElementById('searchBtn').addEventListener('click', async () => {
          const val = document.getElementById('searchInput').value.toLowerCase();
          if (val == "") { return; }

          const [attractions, restaurants, foods] = await Promise.all([
            fetchGooglePlaces(val, 'attractions'),
            fetchGooglePlaces(val, 'restaurants'),
            //fetchGooglePlaces(city, 'foods')
          ]);

          document.getElementById('searchResults').innerHTML =

            renderCitySection('Top Attractions in ' + val.toUpperCase(), attractions, 'attraction') +
            renderCitySection('Top Restaurants in ' + val.toUpperCase(), restaurants, 'restaurant');
          //renderCitySection('Top Popular Foods', foods, 'foods');

          setTimeout(() => {
            attachFavEvents();
            attachItineraryEvents();
          }, 500);

        });

        document.getElementById('findNearMe').addEventListener('click', async () => {
          document.getElementById('mapContainer').innerHTML = '<p>Detecting your location...</p>';
          const loc = await getUserLocation();
          if (loc && loc.cityName) {

            document.getElementById('mapContainer').innerHTML = '';

            const val = loc.cityName.toLowerCase();
            document.getElementById('searchInput').value = val;
            const [attractions, restaurants, foods] = await Promise.all([
              fetchGooglePlaces(val, 'attractions'),
              fetchGooglePlaces(val, 'restaurants'),
              //fetchGooglePlaces(val, 'foods')
            ]);

            document.getElementById('searchResults').innerHTML =
              renderCitySection('Top Attractions in ' + val.toUpperCase(), attractions, 'attraction') +
              renderCitySection('Top Restaurants in ' + val.toUpperCase(), restaurants, 'restaurant');
            //renderCitySection('Top Popular Foods', foods, 'foods');

            setTimeout(() => {
              attachFavEvents();
              attachItineraryEvents();
            }, 500);

          } else {
            document.getElementById('searchResults').innerHTML = '<p>Could not detect your location.</p>';
            document.getElementById('mapContainer').innerHTML = '';
          }
        });
      }, 100); // Small delay to ensure the element is fully rendered

  }

  if (hash === '#itinerary') {
    const itin = getItinerary();
    document.getElementById('itineraryList').innerHTML = itin.length
      ? itin.map(i => `<div class='card'><b>${i.name}</b> <span class='favorite active' data-name='${i.name}' title='Remove from itinerary'>&#10060;</span></div>`).join('')
      : '<p>No itinerary items yet.</p>';
    document.querySelectorAll('.favorite').forEach(el => {
      el.addEventListener('click', () => {
        const name = el.getAttribute('data-name');
        removeFromItinerary(name);
        el.parentElement.remove();
      });
    });
  }

  if (hash === '#favorite') {
    const favs = getFavorites();
    document.getElementById('favoriteList').innerHTML = favs.length
      ? favs.map(f => `<div class='card'><b>${f.name}</b> <span class='favorite active' data-name='${f.name}' title='Remove from favorites'>&#9733;</span></div>`).join('')
      : '<p>No favorites saved.</p>';
    attachFavEvents();
    attachItineraryEvents();
  }

}


// Function to get the last selected city from local storage
function getLastSelectedCity() {
  return getLocalStorage('lastSelectedCity') || null;
}

// Function to set the last selected city in local storage
function setLastSelectedCity(city) {
  setLocalStorage('lastSelectedCity', city);
}

window.addEventListener('hashchange', () => renderPage(location.hash));
window.addEventListener('DOMContentLoaded', () => renderPage(location.hash));

