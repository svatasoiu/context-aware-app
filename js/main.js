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
      
//Beep button functionality
function beepOnce()
{
    intel.xdk.notification.beep(1);
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
    
    var suc = function(p){
        if (p.coords.latitude != undefined)
        {
            var currentLatitude = p.coords.latitude;
            var currentLongitude = p.coords.longitude;
            $("#geo_lat").html("Geo Lat: " + currentLatitude);
            $("#geo_long").html("Geo Long: " + currentLongitude);
            
            $.getJSON('https://api.mongolab.com/api/1/databases/test-geospatial/collections/locations',

              {"q": {"loc": { "$nearSphere" : [ currentLongitude, currentLatitude ] ,
                             "$maxDistance" : 0.001 }},
//                      {"$near": [currentLatitude, currentLongitude],
//                         "$maxDistance": 0.0001}
               "apiKey": "510d8ebde4b0a39e79ee5a83",
               "l": 5},
              function (data) {
                 $("#results").html(JSON.stringify(data)); 
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

//    $.getJSON('https://api.mongolab.com/api/1/databases/test-geospatial/collections/locations',
//              {q: {"loc": {"$near": [5,5]}}, apiKey: "510d8ebde4b0a39e79ee5a83"},
//              function (data) {
//                 $("#results").html(JSON.stringify(data)); 
//                 alert("retrieved"); 
//              }
//    );
    
});