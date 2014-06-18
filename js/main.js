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
    
    $("#headlineDIV").html("ooo");
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
        $("#debug-p").html("got gps result");
        if (p.coords.latitude !== undefined)
        {
            var currentLatitude = p.coords.latitude;
            var currentLongitude = p.coords.longitude;
            $("#geo_lat").html("Geo Lat: " + currentLatitude);
            $("#geo_long").html("Geo Long: " + currentLongitude);
            
            retrieveNearbyPoints(currentLatitude, currentLongitude, 1);
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
      
//Beep button functionality
function beepOnce()
{
    intel.xdk.notification.beep(1); $("#headlineDIV").html("oo");
} 

function retrieveNearbyPoints(latitude, longitude, radius) {
    $.getJSON('https://api.mongolab.com/api/1/databases/test-geospatial/collections/locations' + '?q=' + JSON.stringify({"loc": { "$near": [latitude, longitude], "$maxDistance": radius}}) + '&apiKey=510d8ebde4b0a39e79ee5a83',
      function (data) {
          $("#debug-p").html("got ajax result");
          $("#results").html(transformMeetingJSON(data));
//        $("#results").html(JSON.stringify(data));
       }
    );
};

function transformMeetingJSON(data) {
    var out = "<ul>";
    for (var m in data) {
        out += "<li>";
        out += data[m].title;
        out += ": ";
        out += data[m].description;
        out += " (located at [" + data[m].loc + "])";
        out += "</li>";
    }
    out += "</ul>";
    return out;
};