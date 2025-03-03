// set global variables as null first
var useremail = "";
var searchemail = "";

// the code required to display a view
// Displaying a certain view - Step 2
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

//code that is executed as the page is loaded.
window.onload = function() {
    initlocalstorage();
    var token = JSON.parse(localStorage.getItem("token"))
    if(JSON.parse(localStorage.getItem("token")).length == 0){
        displayView.show("welcome");
    }else{
        useremail = localStorage.getItem("email");
        connectSocket(token, function() {
            displayView.hide("welcome");
            displayView.show("profile");
        });
    }
};

// Adding the signin mechanism - Step 5
var login = function(){
    if (true) {
        var email = document.getElementById('login-email').value;
        var password = document.getElementById('login-pw').value;
        var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function(){
            if (httpReq.responseText === "") {
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
                        // document.getElementById("signinalert").innerText = httpResp.message;
                        document.getElementById("signinalert").innerText = "Logging in";
                    }
                }

                else if (httpReq.status==401){
                    document.getElementById("signinalert").innerText = "User does not exist.";
                }

                else{
                    // document.getElementById("signinalert").innerText = httpResp.message;
                    document.getElementById("signinalert").innerText = "Wrong Password, please try again.";
                }
            }
        };
        postRequest(httpReq, "sign_in" ,JSON.stringify({'username' : email, 'password' : password}), null);
        return false;
    }
}

function postRequest(request, url, data, hashedData){
    request.open("POST", url, true);
    if (hashedData !=null) {
        request.setRequestHeader("hashedData", hashedData);
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
        if (httpReq.responseText === "") {
            // do nothing
        }
        else {
            var httpResp = JSON.parse(httpReq.responseText);
            console.log(httpResp);
            if (httpReq.status === 201 && httpReq.readyState == 4) {
                console.log("sign up status " + httpResp.success); 
                if (httpResp.success){
                    // document.getElementById("signupalert").innerText = httpResp.message;
                    document.getElementById("signupalert").innerText = "Registered Successfully, please login.";
                }
                // else {
                //     // document.getElementById("signupalert").innerText = httpResp.message;
                //     document.getElementById("signupalert").innerText = "User already existed.";
                // }
            }
            else if (httpReq.status === 409){
                // document.getElementById("signupalert").innerText = httpResp.message;
                document.getElementById("signupalert").innerText = "User has already existed.";
            }

            else{
                // document.getElementById("signupalert").innerText = httpResp.message;
                document.getElementById("signupalert").innerText = "Invalid registeration.";
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

// Allows user to change password in the Account page.
var changePassword = function(){
    var token = localStorage.getItem("token");
    var tokenChange = JSON.parse(token);
    var oldPassword = document.getElementById('oldPassword').value;
    var newPassword = document.getElementById('newPassword').value;
    var confirmNewPassword = document.getElementById('confirmNewPassword').value;
    var httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function(){
        if (httpReq.responseText === "") {
            // do nothing
        }
        else {

            console.log("Ready State " + httpReq.readyState)
            console.log("Status " + httpReq.status)
            var httpResp = JSON.parse(httpReq.responseText);
            if (httpReq.status === 200) {
                console.log(httpResp);
                userData = httpResp.data;
                console.log("HTTP RESP SUCCESS " + httpResp.success)
                console.log("USER DATA " + userData);        
                if (httpResp.success){
                    // console.log("SUCCESS: Change PW Message:" +  httpResp.message);
                    // document.getElementById("accountalert").innerText = httpResp.message;
                    document.getElementById("accountalert").innerText = "Password has been changed successfully."; 
                }
            }
            else if (httpReq.status === 403){
                console.log(httpResp.message);
                // document.getElementById("accountalert").innerText = httpResp.message;
                document.getElementById("accountalert").innerText = "Invalid old password.";
            }
            else{
                console.log(httpResp.message);
                // document.getElementById("accountalert").innerText = httpResp.message;
                document.getElementById("accountalert").innerText = "Invalid new password.";  
            }
        }
    };
    // Hashing token
    var data = newPassword + oldPassword + confirmNewPassword + tokenChange;
    var hashedData = hashData(data);
    postRequest(httpReq, "change_password", JSON.stringify({'token' : tokenChange, 'oldPassword' : oldPassword, 'newPassword' : newPassword, 'checkNewPassword' : confirmNewPassword}) , hashedData);
    return false;
}

// function to show current useremail's profile
function showMyProfile(){
    var token = localStorage.getItem("token")
    var tokenData = JSON.parse(token);
    var httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function(){
        if (httpReq.responseText === "") {
            // do nothing
        }else{
            console.log(httpReq.responseText);
            var httpResp = JSON.parse(httpReq.responseText);
            userData = httpResp.data;
            if (httpReq.readyState === 4 && httpReq.status === 200) {
                useremail = userData.email  
                if (httpResp.success){
                    document.getElementById("profileemail").innerHTML = userData.email;
                    document.getElementById("profilefname").innerHTML = userData.firstName;
                    document.getElementById("profilefamname").innerHTML = userData.familyName;
                    document.getElementById("profilegender").innerHTML =userData.gender;
                    document.getElementById("profilecity").innerHTML = userData.city;
                    document.getElementById("profilecountry").innerHTML = userData.country;
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
    var data = tokenData + tokenData;
    var hashedData = hashData(data);  
    console.log("data at client before hash " + data)
    postRequest(httpReq, "get_user_data_by_token", JSON.stringify({'token' : tokenData}), hashedData);
    return false;
}

// function to show other profile when searching
var showOtherProfile = function(email){    
    var token = JSON.parse(localStorage.getItem("token"));
    document.getElementById("postalert").innerText = "";
    var httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function(){
        if (httpReq.responseText === "") {
            // do nothing
        }
        else {
            var httpResp = JSON.parse(httpReq.responseText);
            if (httpReq.readyState === 4 && httpReq.status === 200) {
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
                }
            }
        }
    };
    var data = email + token;
    var hashedData = hashData(data);
    console.log("data at display other " + data);
    postRequest(httpReq, "get_user_data_by_email", JSON.stringify({'token' : token,'email' : email}), hashedData);   
    return false;
}

// function to search the user by the email, retrieves the info and the message board
var searchuser = function(){
    var token = localStorage.getItem("token");
    var tokenSearch = JSON.parse(token);
    var trysearchemail = document.getElementById("searchemail").value;
    var searchEmailString = trysearchemail.toString()
    var httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function(){
        if (httpReq.responseText === "") {
            // do nothing
        }
        else {
            var httpResp = JSON.parse(httpReq.responseText);
            if (httpReq.status === 200) {
                var searchUserData = httpResp.data;
                if (httpResp.success){
                    document.getElementById("searchalert").innerHTML = "";
                    if (searchUserData.email === useremail){
                        showMyProfile();
                    }
                    else {
                        showOtherProfile(searchUserData.email);
                    }
                    refreshboard(searchUserData.email);
                    document.getElementById("homecontent").className ="content-cur";
                }
                // else {
                //     // No such user is found
                //     // document.getElementById("searchalert").innerHTML = httpResp.message;
                //     document.getElementById("searchalert").innerHTML = "User does not exist.";
                //     document.getElementById("homecontent").className ="content";
                // }
            }
            else {
               // No such user is found
                // document.getElementById("searchalert").innerHTML = httpResp.message;
                document.getElementById("searchalert").innerHTML = "User does not exist.";
                document.getElementById("homecontent").className ="content";
            }
        }
    };
    var data = searchEmailString + tokenSearch;
    var hashedData = hashData(data);
    postRequest(httpReq, "get_user_data_by_email", JSON.stringify({'token' : tokenSearch ,'email' : searchEmailString}), hashedData);
    return false;
}

// function to post the message on either own wall or other email wall
var postMessage = function(){
    var token = localStorage.getItem("token");
    var tokenMessage = JSON.parse(token);
    var message = document.getElementById("addmessage").value;
    if (typeof message === "undefined") {
        // do nothing
        return false;
    }
    else {

        var email;
        if (document.getElementById("browsetab").className === "tab-cur"){
            email = searchemail;
        }
        else {
            email = useremail;
        }
        var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function(){
            if (httpReq.responseText === "") {
                // do nothing
            }
            else {
                var httpResp = JSON.parse(httpReq.responseText);
                if (httpReq.status === 200) {
                    userData = httpResp.data;
                    if (httpResp.success){
                        document.getElementById("addmessage").value = ""; // clears the textfield after the submission to prevent resubmission
                        // document.getElementById("postalert").innerText = httpResp.message;
                        document.getElementById("postalert").innerText = "Message posted.";
                        refreshboard(email);
                        
                    }
                    else {

                        document.getElementById("addmessage").value = ""; 
                        // document.getElementById("postalert").innerText = httpResp.message;
                    }
                }
                else{

                    document.getElementById("addmessage").value = ""; 
                    // document.getElementById("postalert").innerText = httpResp.message;
                    document.getElementById("postalert").innerText = "Message is blank.";
                    
                }
            }
        };
    }

    var data = email + message + tokenMessage;
    var hashedData = hashData(data);
    postRequest(httpReq, "post_message", JSON.stringify({'token': tokenMessage, 'email' : email, 'message' : message}) , hashedData);
    return false;
}

// function to refresh the message board
var refreshboard =  function (email) {
    var tokenMessage = JSON.parse(localStorage.getItem("token"));
    var wall = document.getElementById("messageboard");
    if (email === useremail) {
        document.getElementById("wallheader").innerHTML = "Your Message Wall:";
    }
    
    else{
        document.getElementById("wallheader").innerHTML = email + "'s Message Wall:";
    }
    var httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function(){
        if (httpReq.responseText === "") {
            // do nothing
        }else{
            var httpResp = JSON.parse(httpReq.responseText);
            if (httpReq.status === 200) {
                userData = httpResp.data;
         
                if (httpResp.success){
                    var messages = httpResp.data;
                    if (messages.length === 0) {
                        // if user has no message, will display this message
                        wall.innerHTML = "No messages currently for you.";
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
                    wall.innerHTML = "Unable to retreive messages currently for this user.";
                }
            }
            else{
                // wall.innerHTML = httpResp.message
                wall.innerHTML = "No messages currently for this user.";
            }
        }
    };
    
    var data = email + tokenMessage;
    var hashedData = hashData(data);
    postRequest(httpReq, "get_user_messages_by_email", JSON.stringify({'email' : email, 'token' : tokenMessage}), hashedData);
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
            var token = localStorage.getItem("token")
            var tokenSignout = JSON.parse(token);
            var result = localStorage.getItem("token");
            var httpReq = new XMLHttpRequest();
            httpReq.onreadystatechange = function(){
            if (httpReq.responseText === "") {
                // do nothing
            }
            else {

                if (httpReq.readyState == 4 && httpReq.status==200){
                        var httpResp = JSON.parse(httpReq.responseText);
                        if (httpResp.success){
                            token = JSON.stringify(result);
                            displayView.hide("profile");
                            displayView.show("welcome");
                            localStorage.clear();
                            useremail = "";
                            searchemail = "";
                            // document.getElementById("loginalert").innerHTML = httpResp.message;
                        }
                        else {
                            // d=
                        }
                    }
                };
            }
            var data = tokenSignout + tokenSignout;
            var hashedData = hashData(data);
            postRequest(httpReq, "sign_out" ,JSON.stringify({'token' : tokenSignout}), hashedData);
            return false;
        }
    },false);
}

///hash
function hashData(data) {
    const hashedData = CryptoJS.SHA256(data).toString();
    return hashedData;
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

