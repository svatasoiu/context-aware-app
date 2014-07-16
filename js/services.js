// returns 
function retrieveNearbyPoints(latitude, longitude, radius, map) {
    getSOAPResponse(
        'http://172.16.151.35:4041/ContextService.svc', 'GetMeetingsWithinRadius', 
        {lat:latitude, lon:longitude, radius:radius}, 
        'http://tempuri.org/', 'IContextService', 
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
        'http://172.16.151.35:4041/ContextService.svc', 'AddUser', 
        {username:document.getElementById("uname").value,
         password:document.getElementById("pword").value}, 
        'http://tempuri.org/', 'IContextService', 
        function(resp, type, xhr) {
            var jsonResponse = JSON.parse($(xhr.responseXML).find("AddUserResult").text());

            if (JSON.stringify(jsonResponse) === "true") {
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
        'http://172.16.151.35:4041/ContextService.svc', 'ValidateUser', 
        {username:username,password:password}, 
        'http://tempuri.org/', 'IContextService', 
        function(resp, type, xhr) {
            var jsonResponse = JSON.parse($(xhr.responseXML).find("ValidateUserResult").text());

            if (JSON.stringify(jsonResponse) === "true") {
                var logindiv = $("#login").css("zIndex", -1);
                $("#loginError").css("visibility", "hidden");  
            } else {
                $("#loginError").css("visibility", "visible");
                $("#loginError").html("No such user/password combo exists");
            }
        }, function(err) { 
            alert(err.status + ' ' + err.statusText); 
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