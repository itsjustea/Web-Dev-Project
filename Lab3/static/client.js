// set global variables as null first
var useremail = "";
var searchemail = "";

// the code required to display a view
// Displaying a certain view - Step 2
var displayView = {
    show: function (id) {
        document.getElementById(id + "Page").innerHTML = document.getElementById(id + "View").innerHTML;
        if (id == "profile") {
            // useremail = serverstub.getUserDataByToken(JSON.parse(localStorage.getItem("token"))).data.email;
            showMyProfile();    
            attachHandler();
            homeTab = document.getElementById("hometab");
            homeTab.className = "tab-cur";
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
function connectSocket(token, callback){
    // console.log("socket  " + token);
    // var ws = new WebSocket("ws://127.0.0.1:5000/api");
    // const socket = new WebSocket('ws://' + location.host + '/echo');
    const ws = new WebSocket("ws://127.0.0.1:5000/echo");
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
        console.log("line 50: ws.readyState"+ ws.readyState)
        if (callback) {
            console.log("Callback line 52")
            callback();
        }
    };
    
    ws.onmessage = function (event){
        console.log("Message received from server:", event.data);
        // ws.send("ACK: " + event.data); // Send acknowledgment back
    };
    

    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    };
}

//code that is executed as the page is loaded.
window.onload = function() {
    initlocalstorage();
    //only when the user is logged out, it will shows the welcome view
    if(JSON.parse(localStorage.getItem("token")).length == 0){
        displayView.show("welcome");
    }else{
        token = JSON.parse(localStorage.getItem("token"))
        // console.log(typeof token)
        connectSocket(token, function() {
            displayView.hide("welcome");
            displayView.show("profile");
        });
        // connectSocket();
        document.getElementById("defaultOpen").click();
    }
};

// User field validation - Step 3
function pwValidation() {
    const entered_pw = document.getElementById('signup-pw');
    const confirm_pw = document.getElementById('signup-repeatPSW');

    // 3. Both password fields must contain the same string
    if (entered_pw.value !== confirm_pw.value) {
        alert('Passwords do not match. Please re-enter your password.');
        entered_pw.value = ''; // Clear the password fields
        confirm_pw.value = '';
        return false;
    }
    // 4. The password must be at least X characters long (assume X = 8)
    if (entered_pw.value.length < 8 || confirm_pw.value.length < 8) {
        alert('Entered password must be at least 8 characters long.');
        entered_pw.value = ''; // Clear the password fields
        confirm_pw.value = '';
        return false;
    }

    console.log('Passwords match, proceed!');
    return true;
}

// Adding the signin mechanism - Step 5
var login = function(){
    if (true) {
        var email = document.getElementById('login-email').value;
        var password = document.getElementById('login-pw').value;
        var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function(){
            if (httpReq.status==200){
                // console.log(httpReq.responseText);
                var httpResp = JSON.parse(httpReq.responseText);
                // console.log("test");
                // console.log(httpResp.token);
                if (httpResp.success){
                    result = httpResp.token;
                    token = JSON.stringify(result);
                    // console.log("result " + result);
                    // console.log("token " + token);
                    // console.log("hi "  + JSON.parse(token));
                    // console.log("line 117  " + typeof token);
                    // localStorage.setItem("email", email);
                    localStorage.setItem("token", token);
                    connectSocket(result, function() {
                        displayView.hide("welcome");
                        displayView.show("profile");
                    });
                    
                }
                else {
                    feedback(httpResp.message);
                }
            }
        };
        postRequest(httpReq, "sign_in" ,JSON.stringify({'username' : email, 'password' : password}));
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

function getRequest(request, url, data){
    request.open("GET", url, true);
    if (data!=null) {
            // console.log('why')
            request.setRequestHeader("token", data);
    }
    request.setRequestHeader("Content-type","application/json; charset=utf-8");
    request.send(data);
  }

// Adding the signup mechanism - Step 4
var signup = function() {
    var validateCheck = pwValidation();
    if(!validateCheck){
        return false;
    }
    // Get values from the form inputs
    var email = document.getElementById('signup-email').value;
    var password = document.getElementById('signup-pw').value;
    var firstname = document.getElementById('signup-fname').value;
    var familyname = document.getElementById('signup-famname').value;
    var gender = document.getElementById('signup-gender').value;
    var city = document.getElementById('signup-city').value;
    var country = document.getElementById('signup-country').value;
    var newUser = {email, password, firstname, familyname, gender, city, country};
    var submitResult = serverstub.signUp(newUser);
    document.getElementById("signupalert").innerText = submitResult.message;

    if (submitResult.success){
        var token = "";
        var loginResult = serverstub.signIn(email,password);
        if (loginResult.success){
            token = loginResult.data;
            localStorage.setItem("token", JSON.stringify(token));
            displayView.hide("welcome");
            displayView.show("profile");
            useremail = email;
            // Set the currently logged in user in this session - change after lab 2.
            localStorage.setItem("loggedInUser", JSON.stringify(newUser));
            showMyProfile();
        }
    }
    alert('Form submitted successfully!');
}

// Allows user to change password in the Account page.
var changePassword = function(){
    var token = JSON.parse(localStorage.getItem("token")); // current user's email
    var oldPassword = document.getElementById('oldPassword').value;
    var newPassword = document.getElementById('newPassword').value;
    var confirmNewPassword = document.getElementById('confirmNewPassword').value;
    if (newPassword !== confirmNewPassword) {
        document.getElementById("accountalert").innerText = "ERROR: New passwords do not match. Please try again.";
        return;
    }

    let changePWResult = serverstub.changePassword(token, oldPassword, newPassword);
    if(changePWResult.success){
        console.log("SUCCESS: Change PW Message:" +  changePWResult.message);
        document.getElementById("accountalert").innerText = "Password Changed Successfully!";
    }else{
        console.log("FAILED: Change PW Message:" +  changePWResult.message);
        document.getElementById("accountalert").innerText = "ERROR: Password not changed. Please try again.";
    }
}

// function to show current useremail's profile
function showMyProfile(){  
    // console.log("string " + localStorage.getItem("token"));
    var token = JSON.parse(localStorage.getItem("token"));
    var httpReq = new XMLHttpRequest();
    loggedInUser = getRequest(httpReq, "get_user_data_by_token", token);

    var httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function(){
            if (httpReq.readyState === 4 && httpReq.status === 200) {
                var httpResp = JSON.parse(httpReq.responseText);
                console.log("line 246 " + httpResp);
                // console.log(httpResp.token);
                if (httpResp.success){
                    document.getElementById("profileemail").innerHTML = httpResp.data.email;
                    document.getElementById("profilefname").innerHTML = httpResp.data.firstname;
                    document.getElementById("profilefamname").innerHTML = httpResp.data.familyname;
                    document.getElementById("profilegender").innerHTML =httpResp.data.gender;
                    document.getElementById("profilecity").innerHTML = httpResp.data.city;
                    document.getElementById("profilecountry").innerHTML = httpResp.data.country;
                }
                else {
                    feedback(httpResp.message);
                }
            }
        };
    

    // console.log("test" + loggedInUser.success);

    document.getElementById("postalert").innerText = "";
    // if (loggedInUser.success) {
    //     // Display user information via global variable - to change after implementing lab 2's data retrieval via serverstub.js
    //     document.getElementById("profileemail").innerHTML = loggedInUser.data.email;
    //     document.getElementById("profilefname").innerHTML = loggedInUser.data.firstname;
    //     document.getElementById("profilefamname").innerHTML = loggedInUser.data.familyname;
    //     document.getElementById("profilegender").innerHTML =loggedInUser.data.gender;
    //     document.getElementById("profilecity").innerHTML = loggedInUser.data.city;
    //     document.getElementById("profilecountry").innerHTML = loggedInUser.data.country;
    // }
    document.getElementById("profileheader").innerHTML = "Your Profile";
    document.getElementById("postheader").innerHTML = "Post a message";      
}

// function to show other profile when searching
var showOtherProfile = function(email){    
    var token = JSON.parse(localStorage.getItem("token"));
    var searchedData = serverstub.getUserDataByEmail(token, email);
    document.getElementById("postalert").innerText = "";
    if (searchedData.success) {
        // Display searched email's information via global variable - to change after implementing lab 2's data retrieval via serverstub.js
        document.getElementById("profileemail").innerHTML = searchedData.data.email;
        document.getElementById("profilefname").innerHTML = searchedData.data.firstname;
        document.getElementById("profilefamname").innerHTML = searchedData.data.familyname;
        document.getElementById("profilegender").innerHTML = searchedData.data.gender;
        document.getElementById("profilecity").innerHTML = searchedData.data.city;
        document.getElementById("profilecountry").innerHTML = searchedData.data.country;
    }
    document.getElementById("profileheader").innerHTML = searchedData.data.firstname + "'s Profile";    
}

// function to search the user by the email, retrieves the info and the message board
var searchuser = function(){
    var token = JSON.parse(localStorage.getItem("token"));
    searchemail = document.getElementById("searchemail").value;
    var result = serverstub.getUserDataByEmail(token, searchemail);
    if (result.success){
        document.getElementById("searchalert").innerHTML = "";
        if (searchemail === useremail){
            showMyProfile();
        }
        else {
            showOtherProfile(searchemail);
        }
        refreshboard(searchemail);
        document.getElementById("homecontent").className ="content-cur";
    }else{
        // No such uer is found
        document.getElementById("searchalert").innerHTML = "No such user found, please try again.";
        document.getElementById("homecontent").className ="content";
    }
}

// function to post the message on either own wall or other email wall
var postMessage = function(){
    var token = JSON.parse(localStorage.getItem("token"));
    var message = document.getElementById("addmessage").value;
    var email = "";
    if (document.getElementById("browsetab").className === "tab-cur"){
        email = searchemail;
    }
    else {
        email = useremail;
    }

    if (message === "") {
        postresult.success === false;
    }
    else {
        var postresult = serverstub.postMessage(token,message,email);
        document.getElementById("postalert").innerText = postresult.message;
        if (postresult.success){
            refreshboard(email);
            document.getElementById("addmessage").value = ""; // clears the textfield after the submission to prevent resubmission
        }
    }
}

// function to refresh the message board
var refreshboard =  function (email) {
    var token = JSON.parse(localStorage.getItem("token"));
    // var refreshresult = serverstub.getUserMessagesByEmail(token,email);

    var wall = document.getElementById("messageboard");
    // document.getElementById("messageboard").innertext = refreshresult.message;

    if (email === useremail) {
        document.getElementById("wallheader").innerHTML = "Your Message Wall:";
    }
    
    else{
        document.getElementById("wallheader").innerHTML = email + "'s Message Wall:";
    }

    if (refreshresult.success) {
        var messages = refreshresult.data;
        if (messages.length === 0) {
            // if user has no message, will display this message
            wall.innerHTML = "No messages currently";
        }
        else {
            var message = "";
            wall.innerHTML = "<tr><th>User</th><th>Message</th></tr>";
            // for loop to iterate the messages
            for(var i=0;i<messages.length;i++){
                message = "<tr><td>" + messages[i].writer + "</td><td>" + messages[i].content + "</td></tr>" ;
                wall.innerHTML += message;
            }
        }
    }
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
            // var token = JSON.parse(localStorage.getItem("token"));
            var httpReq = new XMLHttpRequest();
            
            httpReq.onreadystatechange = function(){
        
            if (httpReq.status==200){
                    var httpResp = JSON.parse(httpReq.responseText);
                    if (httpResp.success){
                        result = httpResp.token;
                        token = JSON.stringify(result);
                        console.log("client js line 432 " + token);
                        displayView.hide("profile");
                        displayView.show("welcome");
                        localStorage.clear();
                        localStorage.removeItem("token", JSON.stringify(token));
                        localStorage.setItem("token","[]");
                        useremail = "";
                        searchemail = "";
                        document.getElementById("loginalert").innerHTML = signoutresult.message;
                    }
                    else {
                        feedback(httpResp.message);
                    }
                }
            };
            postRequest(httpReq, "sign_out" ,JSON.stringify({'token' : result}), null);
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
