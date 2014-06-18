/*jslint browser:true, devel:true, white:true, vars:true, eqeq:true */
/*global intel:false*/
/*
 * This function runs once the page is loaded, but the JavaScript bridge library is not yet active.
 */
var init = function () {
};

window.addEventListener("load", init, false);  

 //  Prevent Default Scrolling  
var preventDefaultScroll = function(event) 
{
    // Prevent scrolling on this element
    event.preventDefault();
    window.scroll(0,0);
    return false;
};
    
window.document.addEventListener("touchmove", preventDefaultScroll, false);
/*
 * Device Ready Code 
 * This event handler is fired once the JavaScript bridge library is ready
 */
function onDeviceReady()
{
    //lock orientation
    intel.xdk.device.setRotateOrientation("portrait");
    intel.xdk.device.setAutoRotate(false);
        
    //manage power
    intel.xdk.device.managePower(true,false);

    //hide splash screen
    intel.xdk.device.hideSplashScreen();       
    
    var mapOptions = {
      zoom: 8,
      center: new google.maps.LatLng(42.4, -71.3)
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    currMarker.setMap(map);
    attachSecretMessage(currMarker, "Current Position");
    
    var suc = function(p){
        $("#debug-p").html("got gps result");
        if (p.coords.latitude !== undefined)
        {
            var currentLatitude = p.coords.latitude;
            var currentLongitude = p.coords.longitude;
            $("#geo_lat").html("Geo Lat: " + currentLatitude);
            $("#geo_long").html("Geo Long: " + currentLongitude);
            
            var position = new google.maps.LatLng(currentLatitude, currentLongitude);
            currMarker.setPosition(position);
            
            retrieveNearbyPoints(currentLatitude, currentLongitude, 1, map);
        }
    };
    
    var fail = function (error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    };
    navigator.geolocation.watchPosition(suc, fail);
//    intel.xdk.geolocation.watchPosition(suc, fail);
}
    
document.addEventListener("intel.xdk.device.ready",onDeviceReady,false); 

function retrieveNearbyPoints(latitude, longitude, radius, map) {
    $.getJSON('https://api.mongolab.com/api/1/databases/test-geospatial/collections/locations' + '?q=' + JSON.stringify({"loc": { "$near": [latitude, longitude], "$maxDistance": radius}}) + '&apiKey=510d8ebde4b0a39e79ee5a83',
      function (data) {
          $("#debug-p").html("got ajax result");
          $("#results").html(meetingJSONtoHTML(data, map));
//        $("#results").html(JSON.stringify(data));
       }
    );
};

function meetingJSONtoHTML(data, map) {
    for (var meet in nearbyMeetings) {
       nearbyMeetings[meet].setMap(null);
    }
    
    nearbyMeetings = [];
    var out = "<ul>";
    for (var m in data) {
        var meeting = data[m];
        var point = meeting.loc;
        thisMeeting = meeting.title;
        thisMeeting += ": ";
        thisMeeting += meeting.description;
        thisMeeting += " (located at [" + point + "])";
        
        var position = new google.maps.LatLng(point[0], point[1]);
        var marker = new google.maps.Marker({
          position: position,
          map: map
        });
        nearbyMeetings.push(marker);
        attachSecretMessage(marker, thisMeeting);
        out += "<li>" + thisMeeting + "</li>";
    }
    out += "</ul>";
    return out;
};

// The five markers show a secret message when clicked
// but that message is not within the marker's instance data
function attachSecretMessage(marker, point) {
  var infowindow = new google.maps.InfoWindow({
    content: point
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(marker.get('map'), marker);
  });
}
 
var currMarker = new google.maps.Marker();
var nearbyMeetings = [];