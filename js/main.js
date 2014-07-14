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

function retrieveNearbyPoints(latitude, longitude, radius, map) {
    // mongo query
//    $.getJSON('https://api.mongolab.com/api/1/databases/test-geospatial/collections/locations' + '?q=' + JSON.stringify({"loc": { "$near": [latitude, longitude], "$maxDistance": radius}}) + '&apiKey=510d8ebde4b0a39e79ee5a83',
//      function (data) {
//          $("#debug-p").html("got ajax result");
//          addMarkers(data, map); 
////        $("#results").html(JSON.stringify(data));
//       }
//    );
//    alert("Sending request to web service");
    // sql query
    $.ajax({
        type: 'POST',
        url: 'http://172.16.151.35:4041/ContextService.svc',
        dataType: 'xml',
        contentType: 'text/xml; charset=utf-8',
        data: '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body xmlns:m="http://tempuri.org/"><m:GetMeetingsWithinRadius><m:lat>'+latitude+'</m:lat><m:lon>'+longitude+'</m:lon><m:radius>'+radius+'</m:radius></m:GetMeetingsWithinRadius></soap:Body></soap:Envelope>',
        beforeSend: function (xhr)
        {
            xhr.setRequestHeader('SOAPAction', 'http://tempuri.org/IContextService/GetMeetingsWithinRadius');
        },
        success: function(resp, type, xhr) {
            var jsonResponse = JSON.parse($(xhr.responseXML).find("GetMeetingsWithinRadiusResult").text())["Table"];
            addMarkers(jsonResponse, map);
//            alert(JSON.stringify(jsonResponse));
        },
        error: function(err) { 
            alert(err.status + ' ' + err.statusText); 
        }
   });
    
};

//function getDistance(point) {
//
//    //Gets the distance from mms, stores it in the variable distance
//    var EarthRadius = 6371;
//
//    var MeetLat = point[0];
//    var MeetLong = point[1];
//    
//    var userLat = (currentLatitude * 2 * Math.PI) / 360;
//    var mmsLat = (MeetLat * 2 * Math.PI) / 360;
//    var diffLat = ((MeetLat - currentLatitude) * 2 * Math.PI) / 360;
//    var diffLong = ((MeetLong - currentLongitude) * 2 * Math.PI) / 360;
//    var EArc = ((Math.sin(diffLat/2) * Math.sin(diffLat/2)) +
//            (Math.cos(userLat) * Math.cos(mmsLat) *
//            Math.sin(diffLong/2) * Math.sin(diffLong/2)));
//
//    var Echord = 2 * Math.atan2(Math.sqrt(EArc), Math.sqrt(1-EArc));
//
//    var kmdistance = EarthRadius * Echord; 
//    
//    if (kmdistance < 0.5) {
//
//        if (((Math.round(kmdistance * 10000))/10) == '1') {
//
//            distance = "Distance: " + ((Math.round(kmdistance * 10000))/10) + " meter";
//        }
//        else {
//
//            distance = "Distance: " + ((Math.round(kmdistance * 10000))/10) + " meters";
//        }
//
//    } else {
//
//        if (((Math.round(kmdistance * 10))/10) == '1') {
//
//           distance = "Distance: " + ((Math.round(kmdistance * 10))/10) + " kilometer";
//        }
//        else {
//
//            distance = "Distance: " + ((Math.round(kmdistance * 10))/10) + " kilometers";
//        }
//    }    
//    
//    if (kmdistance < 0.2) {
//        //DO STUFF LIKE LOAD MEETINGS, SEND PUSH NOTIFICATIONS, ETC.
//    }   
//
//}

//Sets the login div to a higher z-index than the map, essentially hiding the map
function setTopZ() {
    document.getElementById("login").style.zIndex = "1";
}

//Check username and password input, show map if good 
    //NEED TO MAKE THIS CONNECT TO DBASE WITH USER INFO, CHECK FOR USERS, AND OUTPUT USER'S MEETING INFO ON MAP
function checkInput() {
    var uname = document.getElementById("uname").value;   
    var pword = document.getElementById("pword").value;
    
    if (uname != "test") {
        document.getElementById("unameerror").style.visibility = "visible";
    }
    else {
        document.getElementById("unameerror").style.visibility = "hidden";        
    }
    
    if (pword != "test") {
        document.getElementById("pworderror").style.visibility = "visible";        
    }
    else {
        document.getElementById("pworderror").style.visibility = "hidden";        
    }
    
    if ((uname == "test") && (pword == "test")) {
        var logindiv = document.getElementById("login").style.zIndex = -1;
    }

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
    attachSecretMessage(marker, meeting);
  }
};


// The five markers show a secret message when clicked
// but that message is not within the marker's instance data
function attachSecretMessage(marker, meeting) {
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
//    }
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