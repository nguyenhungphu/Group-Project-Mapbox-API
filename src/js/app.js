// phase 1: Get location, draw a map, center the map on this location and drop a marker
// . detect user location using Geolocation API
// . import Mapbox GL JS library 
// . drop a marker indicating curr location

// phase 2: Using user location, perform a foward geocode for POI, determine distance
// to each and display them
// . Forward geocode a location. Forward Geocoding converts location text into geographic coordinates
// . Use users current location, to help set the proximity when forward geocoding
// . Figure out how to calculate the distance between 2 sets of coordinates. 
// . Sort the POI returned by the forward geocoding based on distance to the user, in ascending order.
// . output the listing

// phase 3: User can click on POI, and map will adjust to drop new marker n recenter on that POI
// . Add an event listener to your points-of-interest list
// . Remove the existing marker, drop a new marker and recenter the map
//  Other requirement:
// . You should only retrieve poi from your forward geocode.
// . You should retrieve the maximum results possible (10) from your forward geocode.

const token = 'pk.eyJ1Ijoibmd1eWVuaHVuZ3BodTc3NyIsImEiOiJja2psanoxOXAwemg5MnFxeXQyMHV6M2s4In0.Mmge4RRo03t0OWuVuHSdKQ';
const POI = document.querySelector('.points-of-interest')
const form = document.querySelector('form');
const haversine = require('haversine');
let long, lat;


function getLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
      long = position.coords.longitude;
      lat = position.coords.latitude;
      success(long, lat);
    })
  }
  POI.innerHTML = "";
}

function renderPOI(arrayOfPOI) {
  POI.innerHTML = "";
  arrayOfPOI.features.forEach(element => {

    let locationAddress = element['place_name'].split(',');
    let start = { latitude: lat, longitude: long };
    let end = { latitude: element.center[1], longitude: element.center[0] };
    let distance = haversine(start, end, { unit: 'meter' })

    POI.insertAdjacentHTML('beforeend', `
    <li class="poi" data-long=${element.center[0]} data-lat=${element.center[1]}>
    <ul>
      <li class="name">${element.text}
      </li><li class="street-address">${locationAddress[1]}
      </li><li class="distance">${(distance / 1000).toFixed(1)} Km
    </li></ul>
    </li>
    `)
  });
}

function forwardGeoCoding(location) {
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?&proximity=${long},${lat}&types=poi&limit=10&access_token=pk.eyJ1Ijoibmd1eWVuaHVuZ3BodTc3NyIsImEiOiJja2psanoxOXAwemg5MnFxeXQyMHV6M2s4In0.Mmge4RRo03t0OWuVuHSdKQ`)
    .then(resp => resp.json())
    .then(data => renderPOI(data))
    .catch(err => console.log(err))
}

function success(lon, lat) {
  mapboxgl.accessToken = token;
  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', 
    center: [lon, lat], 
    zoom: 15 
  });

  let marker = new mapboxgl.Marker()
    .setLngLat([lon, lat])
    .addTo(map);

  POI.addEventListener('click', e => {
    if (e.target.tagName === 'LI') {
      let longti = e.target.closest('ul > li.poi').getAttribute('data-long')
      let lati = e.target.closest('ul > li.poi').getAttribute('data-lat')
      map.flyTo({
        center: [longti, lati],
        essential: true
      })
      marker.remove();
      marker.setLngLat([longti, lati]).addTo(map)
    }
  })
}

form.onsubmit = e => {
  let input = e.target.querySelector('input');
  forwardGeoCoding(input.value);
  e.preventDefault();
}

window.addEventListener('load', getLocation);