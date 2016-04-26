//https://developers.google.com/places/javascript/
//https://developers.google.com/maps/documentation/javascript/places#placeid

// Link to google api-key for the MapP5 project 
// https://console.developers.google.com/apis/credentials?project=mapp5-1232

// https://maps.googleapis.com/maps/api/place/radarsearch/json?location=48.859294,2.347589&radius=5000&type=cafe&keyword=vegetarian&key=YOUR_API_KEY

// var geocoderSearchResult;
//var nyc = new google.maps.LatLng(40.7127, 74.0059);
var sfo = {
    lat: -37.7833,
    lng: 122.4167
};

$('#googleMapError').hide();
var map;
//http://stackoverflow.com/questions/14184956/async-google-maps-api-v3-undefined-is-not-a-function
function loadMap() {
    // Request for latitide and longitude of Fisherman's wharf, SanFrancisco, CA.
    var geocoder = new google.maps.Geocoder();
    var address = 'fisherman\'s wharf, sanfrancisco, CA, USA';
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        switch(status){
        case 'OK':
        if (status == google.maps.GeocoderStatus.OK) {
            map = new google.maps.Map(document.getElementById('map'), {
                center: sfo,
                zoom: 15,
                scrollwheel: false
            });
            var infowindow = new google.maps.InfoWindow();
            var service = new google.maps.places.PlacesService(map);
            var geocoderSearchResult = results[0];
            map.setCenter(geocoderSearchResult.geometry.location);
            getBookstores(geocoderSearchResult, map).then(function(response) {
                processFrsqrBooks(response, map, infowindow);
            }, function(error) {
                $('#googleMapError').text("Could not load FourSquare data" + error);
                $('#googleMapError').show();
                console.log(error);
            });
        };
        break;
        case 'ZERO_RESULTS': 
        break;
        case 'OVER_QUERY_LIMIT': 
        break;
        case 'REQUEST_DENIED': 
                $('#googleMapError').text(status);
                $('#googleMapError').show();
        break;
        case 'INVALID_REQUEST': 
                $('#googleMapError').text(status);
                $('#googleMapError').show();
        break;
        case 'UNKNOWN_ERROR': 
        break;
        }

    });

}

var ids = [];
var contentPhotoUrl = null;
var bookstorePhotos = [];
var bakeryPhotos = [];

function processFrsqrBooks(response, map, infowindow) {
    if (getBooksRequest.readyState === XMLHttpRequest.DONE) {
        if (getBooksRequest.status === 200) {
            var jsonResponse = JSON.parse(getBooksRequest.responseText);
            var bkstr = []; // array, holds the frsqrItem object literal that is defined inside the loop below. 
            var bkstrNames = []; // array, holds just names from the frsqrItem object literal that is defined inside the loop below.
            var frsqrBookItems = [];
            if (jsonResponse.response.groups.length > 0) {
                bookVenues = jsonResponse.response.groups[0];
                items = bookVenues.items;
                for (var i = 0; i < items.length; i++) {
                    // object that holds data for individual locations from the Foursquare response.
                    var frsqrItem = {
                            tips: '',
                            venue: {
                                'name': '',
                                'venueUrl': '',
                                'venuePhotoUrl': '',
                                'rating': 0.0,
                                'lat': 0,
                                'lng': 0
                            },
                            index: ''
                        }
                        // populate the object literal with data from the response.
                    frsqrItem.tips = items[i].tips;
                    frsqrItem.venue.name = items[i].venue.name;
                    frsqrItem.venue.venueUrl = items[i].venue.url;
                    frsqrItem.venue.lat = items[i].venue.location.lat;
                    frsqrItem.venue.lng = items[i].venue.location.lng;
                    frsqrItem.venue.index = i;
                    // Photos for the locations,   
                    if (items[i].venue.photos.count > 0) {
                        // there is at least one photo - so construct photo url. 
                        var groups = items[i].venue.photos.groups;
                        // Some Foursquare 'venues' do not have photos, so check if the location has any photos
                        if (groups.length > 0) {
                            var photoItems = groups[0].items;
                            if (photoItems.length > 0) {
                                frsqrItem.venue.venuePhotoUrl = photoItems[0].prefix + '50x50' + photoItems[0].suffix;
                            }
                        }
                    }
                    frsqrItem.venue.rating = items[i].venue.rating;
                    frsqrBookItems.push(frsqrItem);
                    bkstr[i] = {
                        name: frsqrItem.venue.name,
                        item: frsqrItem
                    };
                    bkstrNames[i] = frsqrItem.venue.name;
                }
                // bookstoreViewModel  - global ViewModel object 
                // The next three lines populate the observable arrays in the viewmodel. 
                bookstoreViewModel.bookstores(bkstr);
                bookstoreViewModel.bookstoreNames(bkstrNames);
                bookstoreViewModel.filteredVenues(bkstrNames);
            }
            bookstoresDetailsMarkers(map, infowindow, frsqrBookItems);
        } else {
            alert('There was a problem with the request.');
        }
    }
}


// This function  
function bookstoresDetailsMarkers(map, infowindow, frsqrBookItems) {
    var content = "";
    var marker;
    for (var i = 0; i < frsqrBookItems.length; i++) {
        var lat = frsqrBookItems[i].venue.lat;
        var lng = frsqrBookItems[i].venue.lng;
        var latLng = {
            lat: lat,
            lng: lng
        };
        // The marker object , 
        // - animation property set to DROP.
        // - icon property is set to an icon from Templatic     
        marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            title: frsqrBookItems[i].venue.name,
            id: i,
            icon: './templatic/books-media.png',
            infowindow: infowindow,
            position: latLng
        });
        content = content + "</br>";
        content = content + "<p> " + marker.title + "</p>";
        content = content + "<img src=\"" + frsqrBookItems[marker.id].venue.venuePhotoUrl + "\"/>";
        marker.content = content;
        content = '';
        // add click handler to every marker.
        // When a marker is clicked, the name of the location and photo is displayed.
        // The animation property is set to bounce, so the marker bounces when you click on it 
        google.maps.event.addListener(marker, 'click', function() {
            var self = this;
            if (self.getAnimation() !== null) {
                self.setAnimation(null);
            } else {
                self.setAnimation(google.maps.Animation.BOUNCE);
            }
            /* content = content + "</br>";
            content = content + "<p> " + self.title + "</p>";
            content = content + "<img src=\"" + frsqrBookItems[self.id].venue.venuePhotoUrl + "\"/>"; */
            contentPhotoUrl = null;
            self.infowindow.setContent(self.content);
            // Open the infowindow only if it is not already open.
            //if(self.infowindow.getMap() === null || typeof self.infowindow.getMap()  === "undefined"){
                self.infowindow.open(self.map, this);
            //}
            //content = "";
        });
        // Insert the marker object into the markers observable array in the view model  
        bookstoreViewModel.markers.push(marker);
    }
}


/*
function initialize() {
    // Create a map to show the results, and an info window to
    // pop up if the user clicks on the place marker.

    // Request for latitide and longitude of Fisherman's wharf, SanFrancisco, CA.
    var geocoder = new google.maps.Geocoder();
    var address = 'fisherman\'s wharf, sanfrancisco, CA, USA';
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            geocoderSearchResult = results[0];
            map.setCenter(geocoderSearchResult.geometry.location);
            getBookstores(geocoderSearchResult).then(function(response) {
                processFrsqrBooks(response);
            }, function(error) {
                console.log(error);
            });
        }
    });
}
*/
// code attribution: https://github.com/mdn/promises-test/blob/gh-pages/index.html 
function getBookstores(geocoderSearchResult, map) {

    return new Promise(function(resolve, reject) {
        if (geocoderSearchResult.geometry.location) {
            map.setCenter(geocoderSearchResult.geometry.location);
            // Create a list and display all the results.
            var cll = geocoderSearchResult.geometry.location.lat() + "," + geocoderSearchResult.geometry.location.lng();
            var foursquareQuery = "https://api.foursquare.com/v2/venues/explore?client_id=F0XYIB113FEQQVQFFK5DGZ4V5PJBZA2DRNAXHFUW1G3UBE3N&client_secret=ZYY5PZ15D02DLZ0D3RGBADODPBC1KMKX4ZIQ4XNDNLUKBKEB&v=20140701&ll=" + cll + "&radius=1000&query=books&venuePhotos=1&limit=50";
            getBooksRequest = new XMLHttpRequest();
            if (!getBooksRequest) {
                alert('Giving up getBookstores:( Cannot create an XMLHTTP instance');
                return false;
            }
            getBooksRequest.open('GET', foursquareQuery);
            getBooksRequest.responseType = 'text';
            getBooksRequest.onload = function() {
                if (getBooksRequest.status === 200) {
                    resolve(getBooksRequest.response);
                } else {
                    reject(Error('Request did not load successfully' + getBooksRequest.statusText));
                }

            };
            getBooksRequest.onerror = function() {
                reject(Error('There was a network error'));
            };

            getBooksRequest.send();
        } // if ends
    });
}

function BakeryViewModel() {
    var self = this;
    self.bakeries = ko.observableArray([]);
}

// View Model for bookstore.  
function BookstoreViewModel() {
    var self = this;
    self.bookstores = ko.observableArray([]);
    self.bookstoreNames = ko.observableArray([]);
    self.selectedBookstoreNames = ko.observableArray([]);
    self.searchText = ko.observable();
    self.filteredVenues = ko.observableArray([]);
    self.filteredMarkers = ko.observableArray([]);
    self.markers = ko.observableArray([]);

};

var bookstoreViewModel = new BookstoreViewModel();

// Attribution/thanks!: http://stackoverflow.com/questions/20857594/knockout-filtering-on-observable-array

var bakeryViewModel = new BakeryViewModel();


ko.applyBindings(bookstoreViewModel, document.getElementById('bookstoresList'));
ko.applyBindings(bookstoreViewModel.searchText, document.getElementById('searchText'));

function indexOfVenue(element, index, array) {
    var self = this;
    if (this.toLocaleString() === array[index]) {
        return true;
    }
}
//searchText
function getSearchText(textBoxElem) {
    var text = textBoxElem.value.toLowerCase();
    console.log(JSON.stringify(bookstoreViewModel.filteredVenues));
    if (text !== '') {
        bookstoreViewModel.filteredVenues(bookstoreViewModel.bookstoreNames().map(function(item, index, array) {
            if (array[index].toLowerCase().includes(text)) {
                return array[index];
            } else {
                bookstoreViewModel.markers()[index].setMap(null);
            }

        }));
    } else {
        for (var m = 0; m < bookstoreViewModel.markers().length; m++) {
            bookstoreViewModel.markers()[m].setMap(map);
        }
        bookstoreViewModel.filteredVenues(bookstoreViewModel.bookstoreNames());
    }
    console.log(JSON.stringify(bookstoreViewModel.filteredVenues()));
};

function displaySelection() {
    // http://stackoverflow.com/questions/610336/retrieving-the-text-of-the-selected-option-in-select-element
    var self = this;
    var elem = document.getElementById('bookstoresList');
    if (elem.selectedIndex == -1)
        return null;
    var numSelected = bookstoreViewModel.selectedBookstoreNames().length;

    for (var i = 0; i < numSelected; i++) {
        var elem = bookstoreViewModel.selectedBookstoreNames()[i];
        // find the index in bookstores array corresponding to elem.
        var ind = bookstoreViewModel.bookstoreNames().findIndex(indexOfVenue, elem);
        console.log(ind);
        var frsqrItem = bookstoreViewModel.bookstores()[ind];
        if ((ind >= 0) && (ind < bookstoreViewModel.markers().length)) {
            var currentMarker = bookstoreViewModel.markers()[ind];
            var contentStr = '';
            contentStr = contentStr + "</br>";
            contentStr = contentStr + "<p> " + currentMarker.title + "</p>";
            contentStr = contentStr + "<img src=\"" + frsqrItem.item.venue.venuePhotoUrl + "\"/>";

            var infowindow = new google.maps.InfoWindow({
                content: contentStr
            });
            console.log(infowindow.content);
            currentMarker.infowindow = null;
            currentMarker.infowindow = infowindow;
            infowindow.open(currentMarker.map, currentMarker);

            if (currentMarker.getAnimation() !== null) {
                currentMarker.setAnimation(null);
                currentMarker.setAnimation(google.maps.Animation.BOUNCE);
            } else {
                currentMarker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }
    }
    // animate this marker.
}

var getBooksRequest;
var getBakeriesRequest;
var bookPhotosRequest;
var bakeryPhotosRequest;


// Run the initialize function when the window has finished loading.
