// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getParam(parameter){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(parameter);
}

export function createBreadcrumbs(link, text){

  // Create the breadcrumbs div
  const breadcrumbs = document.createElement('div');
  breadcrumbs.className = 'breadcrumbs';
  breadcrumbs.innerHTML = '<a href="/">Home</a> &gt; <a href="/'+link+'">'+text+'</a>';

  // Find the header
  const header = document.querySelector('header');

  // Insert breadcrumbs after the header
  if (header && header.parentNode) {
    header.parentNode.insertBefore(breadcrumbs, header.nextSibling);
  }

}