var distance;
var RADIUS = 25000;
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
      zoom: 9,
      center: new google.maps.LatLng(42.4043, -71.2813)
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
//    currMarker.setMap(map);
//    currMarker.setIcon("../images/Google Maps Marker Blue.png");
    currMarker = new google.maps.Marker({map: map, icon: 'http://maps.gpsvisualizer.com/google_maps/icons/google/blue.png'});
    
    var circle = new google.maps.Circle({
      map: map,
      radius: RADIUS,    // 10km in metres
      fillColor: '#AA0000'
    });
    circle.bindTo('center', currMarker, 'position');
    
    var suc = function(p){
//        alert("got GPS update!");
        
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
           
            retrieveNearbyPoints(currentLatitude, currentLongitude, RADIUS, map);
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



//Sets the login div to a higher z-index than the map, essentially hiding the map
function setTopZ() {
    document.getElementById("login").style.zIndex = "1";
}

//Check username and password input, show map if good 
function checkInput() {
    var uname = document.getElementById("uname").value;   
    var pword = document.getElementById("pword").value;
    validateUser(uname, pword);
}

function addMarkers(data, map) {
  for (var meet in nearbyMarkers) {
     nearbyMarkers[meet].setMap(null);
  }

  nearbyMarkers = [];
  for (var m in data) {
    var meeting = data[m];
      
    var point = [meeting.Latitude, meeting.Longitude];

    var position = new google.maps.LatLng(point[0], point[1]);
      
    var marker = new google.maps.Marker({
      position: position,
      map: map
    });
    
    //Gets the distance to each meeting to display when meeting is clicked
//    getDistance(point);
      
    nearbyMarkers.push(marker);
    attachData(marker, meeting);
  }
};


function attachData(marker, meeting) {
    // modify message so that when clicked, it hides map-canvas 
    // and displays info about this meeting
    
//    var organizer = meeting.organizer;
    var content = "<div class='panel panel-primary'>";
    content += "<div class='panel-heading clearfix'><h1 class='panel-title pull-left' style=''>"+meeting.Title+"</h1><br><span class='panel-title pull-left'>" +meeting.StartTime + " on " + meeting.Date.substring(0, 10) + "<br>" + meeting.Distance.toString().split(".")[0] + "m away</span></div>";//<a class='btn btn-primary btn-sm back-to-map pull-right'>Back to Map</a></div>";
    content += "<div class='panel-body'>";
    content += meeting.Description;
//    if (organizer) { 
        content += "<br><div><span>" + meeting.Name + " (Organizer) </span><a class='contact'  href='tel:"+ meeting.Phone +"'>";
        content += "<button class='btn btn-default btn-success'><span class='glyphicon glyphicon-earphone'></span></button></a>";
        content += "<a class='contact' href='mailto:"+ meeting.Email +"'><button class='btn btn-default btn-primary'><span class='glyphicon glyphicon-envelope'></span></button></a></div>";
        content += "</div></div>"; 

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