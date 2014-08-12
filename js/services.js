LOCALTESTING = false;

SERVICEURL = LOCALTESTING ? 'http://172.16.151.35:4041/ContextService.svc' 
                          : 'http://dev.mms.org:9000/MobileMeetingsData/ContextService.svc';
NAMESPACE = 'http://tempuri.org/';
INTERFACE = 'IContextService';
// returns 
function retrieveNearbyPoints(latitude, longitude, radius, map) {
//    alert("Sending request to GetMeetingsWithinRadius service");
    getSOAPResponse(
        SERVICEURL, 'GetMeetingsWithinRadius', 
        {lat:latitude, lon:longitude, radius:radius}, 
        NAMESPACE, INTERFACE, 
        function(resp, type, xhr) {
            var jsonResponse = JSON.parse($(xhr.responseXML).find("GetMeetingsWithinRadiusResult").text())["Table"];
            addMarkers(jsonResponse, map);
//            alert(JSON.stringify(jsonResponse));
        },
        function(err) { 
            alert(err.status + ' ' + err.statusText); 
        }
    );
};

function insertUser() {
    getSOAPResponse(
        SERVICEURL, 'AddUser', 
        {username:document.getElementById("uname").value,
         password:document.getElementById("pword").value}, 
        NAMESPACE, INTERFACE, 
        function(resp, type, xhr) {
            var jsonResponse = JSON.parse($(xhr.responseXML).find("AddUserResult").text());
//            alert(JSON.stringify(jsonResponse));
            if (JSON.stringify(jsonResponse) === "true") {
//                alert("Added User!");
                $("#loginError").css("visibility", "hidden");  
            } else {
                $("#loginError").css("visibility", "visible");
                $("#loginError").html("User " + username + " already exists");
            }
        },
        function(err) { 
            alert(err.status + ' ' + err.statusText); 
        }
    );
};


function validateUser(username, password) {
    getSOAPResponse(
        SERVICEURL, 'ValidateUser', 
        {username:username,password:password}, 
        NAMESPACE, INTERFACE, 
        function(resp, type, xhr) {
            var jsonResponse = JSON.parse($(xhr.responseXML).find("ValidateUserResult").text());

            if (JSON.stringify(jsonResponse) === "true") {
                var logindiv = $("#login").css("zIndex", -1);
                $("#loginError").css("visibility", "hidden");  
            } else {
                $("#loginError").css("visibility", "visible");
                $("#loginError").html("No such user/password combo exists");
            }
        }, function (xhr, ajaxOptions, thrownError) {
            alert(xhr.responseText);
            alert(thrownError);
        }
    );
};

function getSOAPResponse(url, method, params, ns, interface, success, error) {
    paramString = ""
    for (param in params) {
        paramString += '<m:'+param+'>'+params[param]+'</m:'+param+'>'
    }
    $.ajax({
        type: 'POST',
        url: url,
        dataType: 'xml',
        contentType: 'text/xml; charset=utf-8',
        data: '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body xmlns:m="'+ns+'"><m:'+method+'>'+paramString+'</m:'+method+'></soap:Body></soap:Envelope>',
        beforeSend: function (xhr)
        {
            xhr.setRequestHeader('SOAPAction', ns + interface + '/' + method);
        },
        success: success,
        error: error
   });
};