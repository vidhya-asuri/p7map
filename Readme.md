# Neighborhood map project


This is a one page application that displays points of interest (bookstores/related to books) located in a specific neighborhood.


> I plan to be add locations related to bakeries/food and others soon.


### Version
0.0.1


## Cloning/setting up.




#### Step 1: Clone the repo(use root user if needed) 


``` sh
sudo git clone https://github.com/vidhya-asuri/map.git
```

#### Step 2: Move reposirotry to web server root directory, if not already in web root.



#### Step 3: Launch application by loading list.html in a browser.


If running from localhost, here's a sample URL to use: http://localhost:8000/p7map/list.html


``` sh
sudo git clone https://github.com/vidhya-asuri/map.git
```

## How to use/run the application.

Open list.html in the root directory in a browser; this should load the map.


list.js in the javascript directory contains all the javascript code that is needed for the application.


When the page loads the application displays a full page map with markers showing hard-coded points of interest.
Clicking on the hamburger icon opens an off-canvas menu with two components:


> a text box to enter search text to filter location.


> a list view that displays names of locations that are displayed on the map.


Type some text into the box and the locations and markers should be filtered based on the search text.


For now, the starting characters in the search text is used as the filtering criterion 






### UI components.


This project uses Foundation with Grunt. 


The single page for this application consists of a title bar and a full page map with an off canvas menu to the left.
Clicking on the 'hamburger' icon pulls up a side-bar. The side-bar has a search text box and a list of points of interest. 


The list of points of interest and the markers on the map are updated based on the search text entered in the search text box. 


The marker icons are from Templatic - https://templatic.com/news/100-free-templatic-map-icons/




### APIs used


This application uses Google Maps and Foursquare APIs. 


### Code related stuff




> list.js 


* This file contains all the javascript needed to run the application.


The starting point is the ``` initialize ``` function.


The ``` initialize ``` function calls Google's Geocoder API to get location detaisl for 'Fisherman's wharf, SanFrancisco'


The location details from the Geocoder's results are passed to the ``` getBookstores ``` function which submits a request to Foursquare to search for bookstores. 


When the response from Foursquare succeeds, ``` processFrsqrBooks ``` is called with the response.


 ``` processFrsqrBooks ```  populates the ViewModel used by Knockout.
 
 
 ``` bookstoresDetailsMarkers ``` 
 * creates markers for points of interest.
 * sets up click handler for markers; click handler displays an infowindow when marker is clicked.
 
 
 
  ``` getSearchText ```  is called when the oninput event is triggered on the search text box.
  * This function updates 
    *  the list of locations displayed in the listivew (off-canvas menu)
    *  markers, so only markers for locations in the list view are displayed.
  


 
 ##### ViewModel.
 
 The View model consists of observable arrays for
 * names of locations 
 * list of lcoations that match the search text in the search textbox, containing a subset of the names of locations
 * list of markers.
 * the search text in the text box in the off canvas menu.
