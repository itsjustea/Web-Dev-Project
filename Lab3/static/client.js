// set global variables as null first
var useremail = "";
var searchemail = "";

// the code required to display a view
// Displaying a certain view
var displayView = {
    show: function (id) {
        document.getElementById(id + "Page").innerHTML = document.getElementById(id + "View").innerHTML;
        if (id == "profile") {
            showMyProfile();    
            attachHandler();
            homeTab = document.getElementById("hometab");
            homeTab.className = "tab-cur";
            useremail = localStorage.getItem("email");
            refreshboard(useremail);
            console.log("user email during first display " + useremail);
        }
    },
    hide: function (id) {
        document.getElementById(id + "Page").innerHTML = "";
    }
};

var initlocalstorage = function(){
    if(localStorage.getItem("token")==null){
        localStorage.setItem("token","[]");
    }
}


//code for websocket
// callback function will trigger if the socket connection is successful
function connectSocket(token, callback){
    console.log("Socket associated with token:  " + token);
    const ws = new WebSocket("ws://127.0.0.1:5000/echo");
    // after calling echo websocket server, it will trigger the onopen function once to see if the connection is established
    ws.onopen = function () {
        if (ws.readyState === WebSocket.OPEN) {
            console.log("Sending message..." + token);
            ws.send(token, (err) => {
                if (err) {
                    console.error("Send error:", err);
                } else {
                    console.log("Message sent successfully.");
                }
            });
        } else {
            console.error("WebSocket is not open:", ws.readyState);
        }
        
        if (callback) {
            // console.log("Callback line 52")
            // This triggers the callback function that uses the connectSocket function
            callback();
        }
    };
    
    // triggers when server side sends a message/response to the client
    ws.onmessage = function (response){
        console.log("Message received from server:", response.data);
        // ws.send("ACK: " + event.data); // Send acknowledgment back
        if (response.data=="logout"){
            //logout without closing connection
            console.log("client logout")
            localStorage.setItem("token","[]");
            // ws.send("close");
            window.location.reload()
        }

        if (response.data == "close"){
            // only for closing 
            ws.send("close");
        }
    };

    ws.onclose = function() {
        console.log("connection closed");
    }

    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };
}

// code that is executed as the page is loaded
window.onload = function() {
    initlocalstorage();
    var token = JSON.parse(localStorage.getItem("token"))

    // only when the user is logged out, it will shows the welcome view
    if(JSON.parse(localStorage.getItem("token")).length == 0){
        displayView.show("welcome");
    }else{
        console.log("token when onload : " + token)
        useremail = localStorage.getItem("email");
        console.log("email when onload : " + useremail)
        // console.log(typeof token)
        connectSocket(token, function() {
            displayView.hide("welcome");
            displayView.show("profile");
        });
        // document.getElementById("defaultOpen").click();
    }
};

// Adding the signin mechanism - Step 5
var login = function(){
    if (true) {
        var email = document.getElementById('login-email').value;
        var password = document.getElementById('login-pw').value;
        var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function(){
            if (httpReq.responseText === ""){
                // do nothing
            } 
            else {
                var httpResp = JSON.parse(httpReq.responseText);
                if (httpReq.status==200){
                    if (httpResp.success){
                        result = httpResp.token;
                        token = JSON.stringify(result);
                        tokenSocket = JSON.parse(token)
                        localStorage.setItem("token", token);
                        localStorage.setItem("email", email);
                        connectSocket(tokenSocket, function() {
                            displayView.hide("welcome");
                            displayView.show("profile");
                        });
                        useremail = email;
                        document.getElementById("signinalert").innerText = httpResp.message;
                    }
                    else {
                        document.getElementById("signinalert").innerText = httpResp.message;
                    }
                }
                else{
                    document.getElementById("signinalert").innerText = httpResp.message;
                }
            }
        };
        postRequest(httpReq, "sign_in" ,JSON.stringify({'username' : email, 'password' : password}), null);
        return false;
    }
}

function postRequest(request, url, data, token){
    request.open("POST", url, true);
    if (token !=null) {
        request.setRequestHeader("token", token);
    }
    request.setRequestHeader("Content-type","application/json; charset=utf-8");
    request.send(data);
}

// Adding the signup mechanism - Step 4
var signup = function() {
    var email = document.getElementById('signup-email').value;
    var password = document.getElementById('signup-pw').value;
    var password_confirmation = document.getElementById('signup-repeatPSW').value;
    var firstname = document.getElementById('signup-fname').value;
    var familyname = document.getElementById('signup-famname').value;
    var gender = document.getElementById('signup-gender').value;
    var city = document.getElementById('signup-city').value;
    var country = document.getElementById('signup-country').value;
    var newUser = {email, password, firstname, familyname, gender, city, country};
    var httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function(){
        if (httpReq.responseText === ""){
            // do nothing, this serves as a sanity check
        }
        else{
            var httpResp = JSON.parse(httpReq.responseText);
            // console.log(httpResp);
            // HTTP Ready states: 0: UNSENT, 1: OPENED, 2: HEADERS_RECEIVED, 3: LOADING, 4: DONE
            if (httpReq.status === 200 && httpReq.readyState == 4) {
                console.log("sign up status " + httpResp.success); 
                if (httpResp.success){
                    document.getElementById("signupalert").innerText = httpResp.message;
                }
                else {
                    document.getElementById("signupalert").innerText = httpResp.message;
                }
            }
            else{
                document.getElementById("signupalert").innerText = httpResp.message;
            }
        }
    };
    postRequest(httpReq, "sign_up", JSON.stringify({'email' : email,
                                                    'firstName': firstname,
                                                    'familyName': familyname,
                                                    'gender' : gender,
                                                    'city' : city,
                                                    'country': country,
                                                    'password_confirmation': password_confirmation,
                                                    'password' : password}) , null);
    }

// allows user to change password in the Account page
var changePassword = function(){
    var token = JSON.parse(localStorage.getItem("token")); // current user's email
    var oldPassword = document.getElementById('oldPassword').value;
    var newPassword = document.getElementById('newPassword').value;
    var confirmNewPassword = document.getElementById('confirmNewPassword').value;
    var httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function(){
        if (httpReq.responseText === ""){
            // do nothing
        }
        else{
            console.log("Ready State " + httpReq.readyState)
            console.log("Status " + httpReq.status)
            var httpResp = JSON.parse(httpReq.responseText);
            if (httpReq.status === 200) {
                console.log(httpResp);
                userData = httpResp.data;
                console.log("HTTP RESP SUCCESS " + httpResp.success)
                console.log("USER DATA " + userData);        
                if (httpResp.success){
                    console.log("SUCCESS: Change PW Message:" +  httpResp.message);
                    document.getElementById("accountalert").innerText = httpResp.message;
                }
                else {
                    console.log(httpResp.message);
                    document.getElementById("accountalert").innerText = httpResp.message;
                }
            }
            else{
                console.log(httpResp.message);
                document.getElementById("accountalert").innerText = httpResp.message;
            }
        }
    };
    postRequest(httpReq, "change_password", JSON.stringify({'token': token, 'oldPassword' : oldPassword, 'newPassword' : newPassword, 'checkNewPassword' : confirmNewPassword}) , token);
    return false;
}

// function to show current useremail's profile
function showMyProfile(){
    var token = JSON.parse(localStorage.getItem("token"));
    var httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function(){
        if (httpReq.responseText === ""){
            // do nothing
        }
        else {

            var httpResp = JSON.parse(httpReq.responseText);
            userData = httpResp.data;
            console.log("Response when onload: " + httpResp)
            if (httpReq.readyState === 4 && httpReq.status === 200) {
                useremail = userData.email
                console.log("email " + useremail);
                console.log("HTTP RESP SUCCESS " + httpResp.success)
                console.log("USER DATA " + userData);        
                if (httpResp.success){
                    document.getElementById("profileemail").innerHTML = userData.email;
                    document.getElementById("profilefname").innerHTML = userData.firstName;
                    document.getElementById("profilefamname").innerHTML = userData.familyName;
                    document.getElementById("profilegender").innerHTML =userData.gender;
                    document.getElementById("profilecity").innerHTML = userData.city;
                    document.getElementById("profilecountry").innerHTML = userData.country;
                    console.log(httpResp.message);
                }
                else {
                    console.log("error " + httpResp.message);
                }
            }
        }
    };
    document.getElementById("postalert").innerText = "";
    document.getElementById("profileheader").innerHTML = "Your Profile";
    document.getElementById("postheader").innerHTML = "Post a message";   
    postRequest(httpReq, "get_user_data_by_token", JSON.stringify({'token' : token}), token);
    return false;   
}

// function to show other profile when searching
var showOtherProfile = function(email){    
    var token = JSON.parse(localStorage.getItem("token"));
    document.getElementById("postalert").innerText = "";
    var httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function(){
        if (httpReq.responseText === ""){
            // do nothing
        }
        else{
            var httpResp = JSON.parse(httpReq.responseText);
            if (httpReq.readyState === 4 && httpReq.status === 200) {
                console.log(httpResp);
                var searchUserData = httpResp.data;      
                if (httpResp.success){
                    searchemail = searchUserData.email;
                    document.getElementById("profileemail").innerHTML = searchUserData.email;
                    document.getElementById("profilefname").innerHTML = searchUserData.firstName;
                    document.getElementById("profilefamname").innerHTML = searchUserData.familyName;
                    document.getElementById("profilegender").innerHTML = searchUserData.gender;
                    document.getElementById("profilecity").innerHTML = searchUserData.city;
                    document.getElementById("profilecountry").innerHTML = searchUserData.country;
                    document.getElementById("profileheader").innerHTML = searchUserData.firstName + "'s Profile"; 
                    document.getElementById("homecontent").className = "content-cur";   
                }
                else {
                    document.getElementById("searchalert").innerHTML = "No such user found, please try again.";
                    // document.getElementById("homecontent").className ="content";
                }
            }
        }
    };
    postRequest(httpReq, "get_user_data_by_email", JSON.stringify({'token' : token , 'email' : email}), token);   
    return false;
}

// function to search the user by the email, retrieves the info and the message board
var searchuser = function(){
    var token = JSON.parse(localStorage.getItem("token"));
    var trysearchemail = document.getElementById("searchemail").value;
    var httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function(){
        if (httpReq.responseText === ""){
            // do nothing
        }
        else {
            // console.log("Ready State " + httpReq.readyState);
            // console.log("Status " + httpReq.status);
            var httpResp = JSON.parse(httpReq.responseText);
            if (httpReq.status === 200) {
                console.log(httpResp);
                var searchUserData = httpResp.data;
                console.log("HTTP RESP SUCCESS " + httpResp.success)
                console.log("Searched user DATA " + searchUserData);    
                console.log(httpResp.success)   
                if (httpResp.success){
                    document.getElementById("searchalert").innerHTML = "";
                    console.log("type of searched email " + typeof(searchUserData.email));
                    console.log("user email " + useremail);

                    if (searchUserData.email == useremail){
                        console.log("showing profiles yea");
                        showMyProfile();
                        // document.getElementById("homecontent").className ="content-cur";
                    }
                    else {
                        console.log("before i display : " + searchUserData.email);
                        showOtherProfile(searchUserData.email);
                    }
                    document.getElementById("homecontent").className ="content-cur";
                    refreshboard(searchUserData.email);
                }
                else {
                    // No such user is found
                    console.log("no user found message :" + httpResp.message)
                    document.getElementById("searchalert").innerHTML = httpResp.message;
                    document.getElementById("homecontent").className ="content";
                }
            }
            else {
               // No such user is found
                console.log("no user found message :" + httpResp.message);
                document.getElementById("searchalert").innerHTML = httpResp.message;
                document.getElementById("homecontent").className ="content";
            }
        }
    };
    postRequest(httpReq, "get_user_data_by_email", JSON.stringify({'token' : token, 'email' : trysearchemail}), token);
}

// function to post the message on either own wall or other email wall
var postMessage = function(){
    var token = JSON.parse(localStorage.getItem("token"));
    var message = document.getElementById("addmessage").value;
    if (typeof message === "undefined") {
        // do nothing
        return false;
    }
    else{

        var email;
        if (document.getElementById("browsetab").className === "tab-cur"){
            email = searchemail;
        }
        else {
            email = useremail;
        }
        console.log("receiver email " + email);
        var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function(){
            if (httpReq.responseText === ""){
                // do nothing
            }
            else {
                // console.log("Ready State " + httpReq.readyState)
                // console.log("Status " + httpReq.status)
                var httpResp = JSON.parse(httpReq.responseText);
                if (httpReq.status === 200) {
                    console.log(httpResp);
                    userData = httpResp.data;
                    console.log("HTTP RESP SUCCESS " + httpResp.success)
                    console.log("USER DATA " + userData);        
                    if (httpResp.success){
                        document.getElementById("postalert").innerText = httpResp.message;
                        refreshboard(email);
                        
                    }
                    else {
                        console.log(httpResp.message)
                        document.getElementById("postalert").innerText = httpResp.message;
                    }
                document.getElementById("addmessage").value = ""; // clears the textfield after the submission to prevent resubmission
                }
                else{
                    console.log(httpResp.message)
                    document.getElementById("postalert").innerText = httpResp.message;
                }
            }
        };
        postRequest(httpReq, "post_message", JSON.stringify({'token' : token , 'email' : email, 'message' : message}) , token);
        // return false;
    }
}

// function to refresh the message board
var refreshboard =  function (email) {
    console.log("email parsed in refresh board" + email);
    var token = JSON.parse(localStorage.getItem("token"));
    // var refreshresult = serverstub.getUserMessagesByEmail(token,email);
    var wall = document.getElementById("messageboard");
    // document.getElementById("messageboard").innertext = refreshresult.message;
    if (email === useremail) {
        console.log("user email when refresh board :" + email);
        document.getElementById("wallheader").innerHTML = "Your Message Wall:";
    }
    
    else{
        console.log("user email when refresh board :" + email);
        document.getElementById("wallheader").innerHTML = email + "'s Message Wall:";
    }
    var httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function(){
        if (httpReq.responseText === ""){
            // do nothing
        }
        else{
            // console.log("Ready State " + httpReq.readyState)
            // console.log("Status " + httpReq.status)
            var httpResp = JSON.parse(httpReq.responseText);
            if (httpReq.status === 200) {
                console.log("REFRESH BOARD RESPONSE : " + httpResp);
                userData = httpResp.data;
                // console.log("HTTP RESP SUCCESS " + httpResp.success)
                // console.log("USER DATA " + userData);        
                if (httpResp.success){
                    // wall.innerHTML = httpResp.data
                    var messages = httpResp.data;
                    if (messages.length === 0) {
                        // if user has no message, will display this message
                        wall.innerHTML = "No messages currently";
                    }
                    else {
                        var message = "";
                        wall.innerHTML = "<tr><th>User</th><th>Message</th></tr>";
                        // for loop to iterate the messages
                        for(var i=0;i<messages.length;i++){
                            message = "<tr><td>" + messages[i].sender_email
                            + "</td><td>" + messages[i].content + "</td></tr>" ;
                            wall.innerHTML += message;
                        }
                    }
                }
                else {
                    wall.innerHTML = "No messages currently";
                }
            }
            else{
                wall.innerHTML = httpResp.message
            }
        }
    };
    postRequest(httpReq, "get_user_messages_by_email", JSON.stringify({'email' : email, 'token' : token}), token);
    return false;
}

// button function when on submit
var refreshbutton = function(){
    if(document.getElementById("browsetab").className==="tab-cur"){
        // refresh the searched email's board
        refreshboard(searchemail);
    }else{
        // refresh own board
        refreshboard(useremail);
    }
}

// Implementing tabs - Step 6
var attachHandler = function () {
    var homeTab = document.getElementById("hometab");
    var accountTab = document.getElementById("accounttab");
    var browseTab = document.getElementById("browsetab");
    var homeContent = document.getElementById("homecontent");
    var accountContent = document.getElementById("accountcontent");
    var browseContent = document.getElementById("browsecontent");

    // Switching tabs
    homeTab.addEventListener("click",function(){
        homeTab.className = "tab-cur";
        accountTab.className = "tab";
        browseTab.className = "tab";
        homeContent.className = "content-cur";
        accountContent.className = "content";
        browseContent.className = "content";
        showMyProfile();
        refreshboard(useremail);
       
    },false);

    accountTab.addEventListener("click",function(){
        homeTab.className = "tab";
        accountTab.className = "tab-cur";
        browseTab.className = "tab";
        homeContent.className = "content";
        accountContent.className = "content-cur";
        browseContent.className = "content";
        
    },false);

    browseTab.addEventListener("click",function(){
        homeTab.className = "tab";
        accountTab.className = "tab";
        browseTab.className = "tab-cur";
        accountContent.className = "content";
        browseContent.className = "content-cur";
        if (!searchemail){
            homeContent.className = "content";
        }else{
            searchuser(searchemail);
        }
    },false);

    // Sign out function executed when button with id = logout is clicked
    document.getElementById("logout").addEventListener("click",function(){
        if (true) {
            var tokenSignout = JSON.parse(localStorage.getItem("token"));
            console.log(tokenSignout);
            var result = localStorage.getItem("token");
            var httpReq = new XMLHttpRequest();
            httpReq.onreadystatechange = function(){
                if (httpReq.responseText === ""){
                    // do nothing
                }
                else {

                    if (httpReq.readyState == 4 && httpReq.status==200){
                            var httpResp = JSON.parse(httpReq.responseText);
                            if (httpResp.success){
                                // result = httpResp.token;
                                token = JSON.stringify(result);
                                // tokenSignout = JSON.parse(token) // used for postrequest
                                
                                console.log("client js line 432 " + token);
                                console.log("client js line 433 " + result);
                                displayView.hide("profile");
                                displayView.show("welcome");
                                localStorage.clear();
                                // localStorage.removeItem("token", JSON.stringify(token));
                                // localStorage.setItem("token","[]");
                                useremail = "";
                                searchemail = "";
                                // document.getElementById("loginalert").innerHTML = httpResp.message;
                            }
                            else {
                                console.log(httpResp.message);
                            }
                    }
                }
            };
        postRequest(httpReq, "sign_out" ,JSON.stringify({'token' : tokenSignout}), null);
        return false;
        }
    },false);
}



////// for test
function clearTokens() {
    displayView.hide("profile");
    displayView.show("welcome");
    var httpReq = new XMLHttpRequest();
    postRequest(httpReq, "deletealltoken" ,null, null);
    localStorage.clear();
    localStorage.removeItem("token", JSON.stringify(token));
};

////// for test
function clearAllTable() {
    displayView.hide("profile");
    displayView.show("welcome");
    var httpReq = new XMLHttpRequest();
    postRequest(httpReq, "deleteall" ,null, null);
    localStorage.clear();
};