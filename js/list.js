//https://developers.google.com/places/javascript/
//https://developers.google.com/maps/documentation/javascript/places#placeid

// Link to google api-key for the MapP5 project 
// https://console.developers.google.com/apis/credentials?project=mapp5-1232

// https://maps.googleapis.com/maps/api/place/radarsearch/json?location=48.859294,2.347589&radius=5000&type=cafe&keyword=vegetarian&key=YOUR_API_KEY

var sfo = {
    lat: -37.7833,
    lng: 122.4167
};

$('#googleMapError').hide();
var map, infowindow;

 
function handleErrors(event, source, lineno, colno, error) {
    $('#googleMapError').text("There was an error loading resources. Please correct and try again");
    $('#googleMapError').show();
}

// Thanks to the following link for help with this function.
//http://stackoverflow.com/questions/14184956/async-google-maps-api-v3-undefined-is-not-a-function
// This function is called when google maps is ready to be loaded. (this is the callback when the map is loaded asynchronously.

/*

Uses geocoder to obtain lat and lng values for the location of interest.
Passes the location info to getBookstores, which queries Foursquare.  
If getBookstores succeeds then processFrsqrBooks is called with the response from FourSquare.
*/

function loadMap() {
    infowindow = new google.maps.InfoWindow({});
    infowindow.isOpen = false; // property of global infowindow variable that holds the open state of the infowindow.
    // Request latitide and longitude of Fisherman's wharf, SanFrancisco, CA.
    var geocoder = new google.maps.Geocoder();
    var address = 'fisherman\'s wharf, sanfrancisco, CA, USA';
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        switch (status) {
            case 'OK':
                if (status == google.maps.GeocoderStatus.OK) {
                    map = new google.maps.Map(document.getElementById('map'), {
                        center: sfo,
                        zoom: 15,
                        scrollwheel: false
                    });
                    var service = new google.maps.places.PlacesService(map);
                    var geocoderSearchResult = results[0];
                    map.setCenter(geocoderSearchResult.geometry.location);
                    getBookstores(geocoderSearchResult).then(function(response) {
                        processFrsqrBooks(response);
                    }, function(error) {
                        $('#googleMapError').text("Could not load FourSquare data" + error);
                        $('#googleMapError').show();
                        console.log(error);
                    });
                }
                break;
            case 'ZERO_RESULTS':
                $('#googleMapError').text(status);
                $('#googleMapError').show();
                break;
            case 'OVER_QUERY_LIMIT':
                $('#googleMapError').text(status);
                $('#googleMapError').show();
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
                $('#googleMapError').text(status);
                $('#googleMapError').show();
                break;
        }

    });

}
/*
 This function is called when the request to Foursquare succeeds i.e. comes back with any result. 
 If the status code of the response is 200, then the knockout observable arrays are populated with the 
result data. 
*/
function processFrsqrBooks(response) {
    if (getBooksRequest.readyState === XMLHttpRequest.DONE) {
        if (getBooksRequest.status === 200) {
            var jsonResponse = JSON.parse(getBooksRequest.responseText);
            var bkstr = []; // array, holds the frsqrItem object literal that is defined inside the loop below. 
            var frsqrBookItems = [];
            if (jsonResponse.response.groups.length > 0) {
                bookVenues = jsonResponse.response.groups[0];
                items = bookVenues.items;
                for (var i = 0; i < items.length; i++) {
                    // object that holds data for individual locations from the Foursquare response.
                    var frsqrItem = new Venue();
                    // populate the object literal with data from the response.
                    frsqrItem.tips = items[i].tips;
                    frsqrItem.name = items[i].venue.name;
                    frsqrItem.venueUrl = items[i].venue.url;
                    frsqrItem.lat = items[i].venue.location.lat;
                    frsqrItem.lng = items[i].venue.location.lng;
                    frsqrItem.index = i;
                    // Photos for the locations,   
                    if (items[i].venue.photos.count > 0) {
                        // there is at least one photo - so construct photo url. 
                        var groups = items[i].venue.photos.groups;
                        // Some Foursquare 'venues' do not have photos, so check if the location has any photos
                        if (groups.length > 0) {
                            var photoItems = groups[0].items;
                            if (photoItems.length > 0) {
                                frsqrItem.venuePhotoUrl = photoItems[0].prefix + '50x50' + photoItems[0].suffix;
                            }
                        }
                    }
                    frsqrItem.rating = items[i].venue.rating;
                    frsqrItem.marker = createMarker(frsqrItem);
                    bookstoreViewModel.venues.push(frsqrItem);
                }
            }
        } else {
            alert('There was a problem with the request.');
        }
    }
}


// This function sets up markes for points of interest and adds click handlers to all the markers. 
function createMarker(frsqrItem) {
    var content = "";
    // The marker object , 
    // - animation property set to DROP.
    // - icon property is set to an icon from Templatic     
    var marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        title: frsqrItem.name,
        icon: './templatic/books-media.png',
        //infowindow: new google.maps.InfoWindow(),
        position: {
            lat: frsqrItem.lat,
            lng: frsqrItem.lng
        }
    });
    content = content + "</br>";
    content = content + "<p> " + marker.title + "</p>";
    content = content + "<img src=\"" + frsqrItem.venuePhotoUrl + "\"/>";
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
            self.setAnimation(google.maps.Animation.BOUNCE, 1400);
            stopAnimation(marker);
        }
        // TODO: Open the infowindow only if it is not already open.
        if(!infowindow.isOpen){
            //The infowindow is not already open.
            infowindow.setContent(self.content);
            infowindow.open(self.map, this);
            infowindow.isOpen = true;
        }
        else{
            infowindow.close();
            infowindow.setContent(self.content);
            infowindow.open(self.map, this);
            infowindow.isOpen = true;
        }
            
    });
    return marker;
}

var stopAnimation = function(marker) {
    setTimeout(function() {
        marker.setAnimation(null);
    }, 1400);
};



// code attribution: https://github.com/mdn/promises-test/blob/gh-pages/index.html 
/*
 This function takes the result from the geocoder request and subits a request to the Foursquare API.
*/

function getBookstores(geocoderSearchResult) {

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



var Venue = function() {
    this.tips = '';
    this.name = '';
    this.venueUrl = '';
    this.venuePhotoUrl = '';
    this.rating = 0.0;
    this.lat = 0;
    this.lng = 0;
    this.index = '';
    this.marker = {};
    this.displaySelection = function() {
        if(!infowindow.isOpen){
            //The infowindow is not already open.
            infowindow.setContent(this.marker.content); 
            infowindow.open(map, this.marker);
            infowindow.isOpen = true;
        }
        else{
            infowindow.close();
            infowindow.setContent(this.marker.content); 
            infowindow.open(map, this.marker);
            infowindow.isOpen = true;
        }
        if (this.marker.getAnimation() !== null) {
            this.marker.setAnimation(null);
        } else {
            this.marker.setAnimation(google.maps.Animation.BOUNCE, 1400);
            stopAnimation(this.marker);
        }
 
    };

};



/*

*****   Knockout  ********* 

*/

// View Model for bookstore.  
function BookstoreViewModel() {
    var self = this;
    self.searchText = ko.observable('');
    self.visibleMarkers = ko.observableArray([]);
    self.markers = ko.observableArray([]);

    self.venues = ko.observableArray();
    self.showMarkers = function(element, index, array){
        if(!element.marker.getVisible()){
            element.marker.setVisible(true);
        }
    };
    self.visibleVenues = ko.computed(function() {
        var searchInput = self.searchText().toLowerCase();
        if (searchInput === '') {
            self.venues().forEach(self.showMarkers);
            return self.venues();
        } else {
            return ko.utils.arrayFilter(self.venues(), function(venue) {
                //return ko.utils.stringStartsWith(item.name().toLowerCase(), filter);
                if (venue.name.toLowerCase().indexOf(searchInput) > -1) {
                    // make sure venue marker is turned on.
                    if(!venue.marker.getVisible()){
                      venue.marker.setVisible(true);
                    }
                    return venue;
                } else {
                    venue.marker.setVisible(false);
                }
            });
        }
    }, self.venues());

}

var bookstoreViewModel = new BookstoreViewModel();

// Attribution/thanks!: http://stackoverflow.com/questions/20857594/knockout-filtering-on-observable-array

ko.applyBindings(bookstoreViewModel);

var getBooksRequest;
var getBakeriesRequest;
var bookPhotosRequest;
var bakeryPhotosRequest;
