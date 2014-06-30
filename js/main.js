/*jslint browser:true, devel:true, white:true, vars:true, eqeq:true */
/*global intel:false*/
/*
 * This function runs once the page is loaded, but the JavaScript bridge library is not yet active.
 */
var distance;
var currentLatitude;
var currentLongitude;

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
      zoom: 10,
      center: new google.maps.LatLng(42.4043, -71.2813)
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
//    currMarker.setMap(map);
//    currMarker.setIcon("../images/Google Maps Marker Blue.png");
    currMarker = new google.maps.Marker({map: map, icon: 'http://maps.gpsvisualizer.com/google_maps/icons/google/blue.png'});
    
    var circle = new google.maps.Circle({
      map: map,
      radius: 10000,    // 10km in metres
      fillColor: '#AA0000'
    });
    circle.bindTo('center', currMarker, 'position');
    
//    attachSecretMessage(currMarker, "Current Position");
    
    var suc = function(p){
        $("#debug-p").html("got gps result");
        if (p.coords.latitude !== undefined)
        {
            currentLatitude = p.coords.latitude;
            currentLongitude = p.coords.longitude;
            $("#geo_lat").html("Geo Lat: " + currentLatitude);
            $("#geo_long").html("Geo Long: " + currentLongitude);
            
            var position = new google.maps.LatLng(currentLatitude, currentLongitude);
            currMarker.setPosition(position);
            map.setCenter(position);
           
            retrieveNearbyPoints(currentLatitude, currentLongitude, 10./112, map);
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
          addMarkers(data, map); 
//        $("#results").html(JSON.stringify(data));
       }
    );
};

function getDistance(point) {

    //Gets the distance from mms, stores it in the variable distance
    var EarthRadius = 6371;

    var MeetLat = point[0];
    var MeetLong = point[1];
    
    var userLat = (currentLatitude * 2 * Math.PI) / 360;
    var mmsLat = (MeetLat * 2 * Math.PI) / 360;
    var diffLat = ((MeetLat - currentLatitude) * 2 * Math.PI) / 360;
    var diffLong = ((MeetLong - currentLongitude) * 2 * Math.PI) / 360;
    var EArc = ((Math.sin(diffLat/2) * Math.sin(diffLat/2)) +
            (Math.cos(userLat) * Math.cos(mmsLat) *
            Math.sin(diffLong/2) * Math.sin(diffLong/2)));

    var Echord = 2 * Math.atan2(Math.sqrt(EArc), Math.sqrt(1-EArc));

    var kmdistance = EarthRadius * Echord; 
    
    if (kmdistance < 0.5) {

        if (((Math.round(kmdistance * 10000))/10) == '1') {

            distance = "Distance: " + ((Math.round(kmdistance * 10000))/10) + " meter";
        }
        else {

            distance = "Distance: " + ((Math.round(kmdistance * 10000))/10) + " meters";
        }

    } else {

        if (((Math.round(kmdistance * 10))/10) == '1') {

           distance = "Distance: " + ((Math.round(kmdistance * 10))/10) + " kilometer";
        }
        else {

            distance = "Distance: " + ((Math.round(kmdistance * 10))/10) + " kilometers";
        }
    }    
    
    if (kmdistance < 0.2) {
        //DO STUFF LIKE LOAD MEETINGS, SEND PUSH NOTIFICATIONS, ETC.
    }   

}

function addMarkers(data, map) {
  for (var meet in nearbyMarkers) {
     nearbyMarkers[meet].setMap(null);
  }

  nearbyMarkers = [];
  for (var m in data) {
    var meeting = data[m];
    var point = meeting.loc;

    var position = new google.maps.LatLng(point[0], point[1]);
      
    var marker = new google.maps.Marker({
      position: position,
      map: map
    });
    
    //Gets the distance to each meeting to display when meeting is clicked
    getDistance(point);
      
    nearbyMarkers.push(marker);
    attachSecretMessage(marker, meeting);
  }
};


// The five markers show a secret message when clicked
// but that message is not within the marker's instance data
function attachSecretMessage(marker, meeting) {
    // modify message so that when clicked, it hides map-canvas 
    // and displays info about this meeting
    
    var organizer = meeting.organizer;
    var content = "<div class='panel panel-primary'>";
    content += "<div class='panel-heading clearfix'><h1 class='panel-title pull-left' style=''>"+meeting.title+"</h1><br><span class='panel-title pull-left'>" +meeting.startTime + " on " + meeting.date + "<br>" + distance + "</span></div>";//<a class='btn btn-primary btn-sm back-to-map pull-right'>Back to Map</a></div>";
    content += "<div class='panel-body'>";
    content += meeting.description;
    if (organizer) { 
        content += "<br><div><span>" + (organizer ? organizer.name : "")+ " (Organizer) </span><a class='contact'  href='tel:"+(organizer ? organizer.phoneNumber : "")+"'>";
        content += "<button class='btn btn-default btn-success'><span class='glyphicon glyphicon-earphone'></span></button></a>";
        content += "<a class='contact' href='mailto:"+(organizer ? organizer.email:"")+"'><button class='btn btn-default btn-primary'><span class='glyphicon glyphicon-envelope'></span></button></a></div>";
        content += "</div></div>"; 
    }
//    var infowindow = new google.maps.InfoWindow({
//        content: content
//    });

    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(content);
        infoWindow.open(marker.get('map'), marker);
    });
}
 
var currMarker = null;
var infoWindow = new InfoBox({
			 disableAutoPan: false
			,zIndex: null
			,boxStyle: { 
                opacity: 1.0
			 }
			,closeBoxMargin: "10px 2px 2px 2px"
			,closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
			,infoBoxClearance: new google.maps.Size(1, 1)
			,isHidden: false
			,pane: "floatPane"
			,enableEventPropagation: false
		});
var nearbyMarkers = [];