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
}
    
document.addEventListener("intel.xdk.device.ready",onDeviceReady,false); 
      

//function getLocation()
//    {
//        if (navigator.geolocation)
//        {
//        navigator.geolocation.getCurrentPosition(showPosition,showError);
//        }
//    };
//
//    function showPosition(position)
//    {
//        var latlon=position.coords.latitude+","+position.coords.longitude;
//
//        var img_url="http://maps.googleapis.com/maps/api/staticmap?center="
//        +latlon+"&zoom=14&size=400x300&sensor=false";alert("<img src='"+img_url+"'>");
//        $("#map").html("<img src='"+img_url+"'>");
//    };
//
//    function showError(error)
//    {
//        switch(error.code) 
//        {
//        case error.PERMISSION_DENIED:
//          doc.innerHTML="Request for Geolocation denied by the user."
//          break;
//        case error.POSITION_UNAVAILABLE:
//          doc.innerHTML="Unavailable location information."
//          break;
//        case error.TIMEOUT:
//          doc.innerHTML="Location request timed out."
//          break;
//        case error.UNKNOWN_ERROR:
//          doc.innerHTML="UNKNOWN_ERROR."
//          break;
//        }
//    };

//Beep button functionality
function beepOnce()
{
    intel.xdk.notification.beep(1);
//    getLocation();
} 

$(document).ready(function () {
    
    var options = { frequency: 150, adjustForRotation: false };

    //function that modifies the position of the arrow
    function onsuccess(acceleration) 
    {
        var Acceleration_X = acceleration.x;
        var Acceleration_Y = acceleration.y;
        $("#acc_x").html("Acc X: " + Acceleration_X);
        $("#acc_y").html("Acc Y: " + Acceleration_Y);
    };

    intel.xdk.accelerometer.watchAcceleration(onsuccess, options);  
    
    var doc=document.getElementById("demo");
    
    var suc = function(p){
        if (p.coords.latitude != undefined)
        {
            var currentLatitude = p.coords.latitude;
            var currentLongitude = p.coords.longitude;
            $("#geo_lat").html("Geo Lat: " + currentLatitude);
            $("#geo_long").html("Geo Long: " + currentLongitude);
            
            $.getJSON('https://api.mongolab.com/api/1/databases/test-geospatial/collections/locations'
                      + '?q=' + JSON.stringify({"loc": { "$near": [currentLatitude, currentLongitude], "$maxDistance": 1}}) + '&apiKey=510d8ebde4b0a39e79ee5a83',
              function (data) {
                 $("#results").html(JSON.stringify(data)); showCurrentLocation(p);
//                 alert("retrieved"); 
              }
            );
        }

    };
    var fail = function(){ 
        alert("geolocation failed"); 
        getLocation();
    };
    intel.xdk.geolocation.watchPosition(suc, fail);
});