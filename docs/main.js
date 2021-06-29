const boundaries = [[47.584724, 12.171843], [47.583015, 12.174000]];

const map = L.map('map', {
    maxBounds: boundaries,
    center: [47.5839578, 12.1733215],
    minZoom: 18,
    maxZoom: 18
}).fitBounds(boundaries);

L.tileLayer('http://maps.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg', {
    subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4']
}).addTo(map);

const pois = [
    [47.584040, 12.173309], [47.583690, 12.173462], [47.583403, 12.173129], [47.583620, 12.172893], [47.583989, 12.172339]
];

var markerIcon = new L.Icon.Default();
markerIcon.options.shadowSize = [0,0];

var markerIconReached = L.icon({
    iconUrl: './images/marker-icon-orange.png',
});

var icon = L.icon({
    iconUrl: './images/green-circle.png',
    iconSize: [16, 16]
});

const markerOptionsPOI = {
    title: "POI",
    clickable: true,
    draggable: false,
    icon: markerIcon
};

const markerOptions = {
    title: "My Location",
    clickable: true,
    draggable: false,
    icon: icon
};


let markers = [];
pois.map((poiPos,index) => {
    markers[index] = L.marker([poiPos[0], poiPos[1]], markerOptionsPOI).addTo(map).bindPopup("<b>POI " + index + 1 + "</b>");
});
// Die Formel arbeitet mit Radians
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Haversine formula
function distanceInMeters(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371000; // in m
    var dLat = degreesToRadians(lat2 - lat1);
    var dLon = degreesToRadians(lon2 - lon1);
    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return earthRadius * c;
}

let userMarker;

function watchPosition() {
    function success(pos) {
        const crd = [pos.coords.latitude, pos.coords.longitude];
        if (userMarker) {
            userMarker.setLatLng([crd[0], crd[1]]);
        } else {
            userMarker = L.marker([crd[0], crd[1]], markerOptions).addTo(map);
            userMarker.bindPopup("<b>My Location!</b><br>Lng: " + crd[0] + "<br>Lat: " + crd[1]);
        }

        pois.map((poiPos, index) => {
            const distance = distanceInMeters(crd[0], crd[1], poiPos[0], poiPos[1]);
            //console.log('POI ' + index + ': ' + distanceInMeters(crd[0], crd[1], poiPos[0], poiPos[1]));
            markers[index]._popup.setContent("<b>POI " + (index + 1) + "</b><br>" + (Math.round(distance * 100) / 100) + " m");
            if (distance <= 3) {
               if(markers[index].options.icon.options.iconUrl.includes('orange') === false){
                markers[index].setIcon(markerIconReached);
               }
            }
        });
    

    }
    function error(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
    }
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    navigator.geolocation.watchPosition(success, error, options);
}
watchPosition();

let pwaPrompt;
const prompt = document.querySelector('#pwa-install-prompt');
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    pwaPrompt = e;
    prompt.classList.add('show');
})

prompt.addEventListener('click', function(event) {
    if (event.target.dataset.id === 'pwa-install-y' && pwaPrompt) {
        pwaPrompt.prompt();
        pwaPrompt.userChoice.then(() => {
            prompt.classList.remove('show');
            pwaPrompt = null;
        });
    } else {
        prompt.classList.remove('show');
    }
});