var useremail = "";
var searchemail = "";

// the code required to display a view
// Displayview currently submitting user message
var displayView = {
    show: function (id) {
        document.getElementById(id + "Page").innerHTML = document.getElementById(id + "View").innerHTML;
        console.log(id);
        if (id == "profile") {
            useremail = serverstub.getUserDataByToken(JSON.parse(localStorage.getItem("token"))).data.email;
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

window.onload = function() {
    //code that is executed as the page is loaded.
    initlocalstorage();
    //only when the user is logged out, it will shows the welcome view
    if(JSON.parse(localStorage.getItem("token")).length == 0){
        displayView.show("welcome");
    }else{
        displayView.show("profile");
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

var login = function(){
    var email = document.getElementById('login-email').value;
    var password = document.getElementById('login-pw').value;
    
    var loginResult = serverstub.signIn(email,password);
    console.log(loginResult);
    document.getElementById("signinalert").innerText = loginResult.message;
    var token = "";
    if (loginResult.success){
        token = loginResult.data;
        localStorage.setItem("token", JSON.stringify(token));
        displayView.hide("welcome");
        displayView.show("profile");
    }
    alert('Form submitted successfully!');
}


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
            // refreshwall(email);
        }
    }
    alert('Form submitted successfully!');
}

// Allows user to change password in the Account page.
var changePassword = function(){
    var token = JSON.parse(localStorage.getItem("token")); // current user's email
    var oldPassword = document.getElementById('oldPassword').value;
    var newPassword = document.getElementById('newPassword').value;

    let changePWResult = serverstub.changePassword(token, oldPassword, newPassword);
    if(changePWResult.success){
        console.log("SUCCESS: Change PW Message:" +  changePWResult.message);
        document.getElementById("accountalert").innerText = "Password Changed Successfully!";
    }else{
        console.log("FAILED: Change PW Message:" +  changePWResult.message);
        document.getElementById("accountalert").innerText = "ERROR: Password not changed. Please try again.";
    }

}

function showMyProfile(){    
    var token = JSON.parse(localStorage.getItem("token"));
    var loggedInUser = serverstub.getUserDataByEmail(token, useremail);
    
    if (loggedInUser.success) {
        // Display user information via global variable - to change after implementing lab 2's data retrieval via serverstub.js
        document.getElementById("profileemail").innerHTML = loggedInUser.data.email;
        document.getElementById("profilefname").innerHTML = loggedInUser.data.firstname;
        document.getElementById("profilefamname").innerHTML = loggedInUser.data.familyname;
        document.getElementById("profilegender").innerHTML =loggedInUser.data.gender;
        document.getElementById("profilecity").innerHTML = loggedInUser.data.city;
        document.getElementById("profilecountry").innerHTML = loggedInUser.data.country;
    }
    document.getElementById("profileheader").innerHTML = "Your Profile";
    document.getElementById("postheader").innerHTML = "Post a message";      
}

var postMessage = function(){
    var token = JSON.parse(localStorage.getItem("token"));
    var message = document.getElementById("addmessage").value;
    console.log(message);
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
            // console.log(postresult.success)
            refreshboard(email);
        }
    }

}

var refreshboard =  function (email) {
    var token = JSON.parse(localStorage.getItem("token"));
    var refreshresult = serverstub.getUserMessagesByEmail(token,useremail);
    console.log(refreshresult);
    var wall = document.getElementById("messageboard");
    document.getElementById("messageboard").innertext = refreshresult.message;
    // console.log("message1");
    // if (refreshresult.data.message === ""){
    //     refreshresult.success === false;
    // }

    if (email === useremail) {
        document.getElementById("wallheader").innerHTML = "Your Message Wall:";
    }else{
        document.getElementById("wallheader").innerHTML = email + "'s Message Wall:";
    }

    if (refreshresult.success) {
        // console.log("message2");
        var messages = refreshresult.data;
        console.log(messages)
        if (messages.length === 0) {
            wall.innerHTML = "No messages currently";
        }
        else {
            // console.log(messages);
            var message = "";
            wall.innerHTML = "<tr><th>User</th><th>Message</th></tr>";
            for(var i=0;i<messages.length;i++){
                message = "<tr><td>" + messages[i].writer + "</td><td>" + messages[i].content + "</td></tr>" ;
                wall.innerHTML += message;
            }
        }
    }

    
}

var refreshbutton = function(){
    if(document.getElementById("browsetab").className==="tab-cur"){
        refreshboard(searchemail);
    }else{
        refreshboard(useremail);
    }
}



// function showMyAccount(){    
//     var token = JSON.parse(localStorage.getItem("token"));
//     var loggedInUser = serverstub.getUserDataByEmail(token, useremail);
//     console.log("Goes into here");
//     displayView.hide("profile");
//     displayView.show("account");
//     //     // Display user information via global variable - to change after implementing lab 2's data retrieval via serverstub.js
//     document.getElementById("account_email").innerHTML = loggedInUser.data.email;
//     document.getElementById("account_fname").innerHTML = loggedInUser.data.firstname;
//     document.getElementById("account_famname").innerHTML = loggedInUser.data.familyname;
//     document.getElementById("account_gender").innerHTML =loggedInUser.data.gender;
//     document.getElementById("account_city").innerHTML = loggedInUser.data.city;
//     document.getElementById("account_country").innerHTML = loggedInUser.data.country;

//     document.getElementById("accountheader").innerHTML = "Your Account";
// }

// function that handles events
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
        attachHandler();
        if (!searchemail){
            homeContent.className = "content";
        }else{
            searchuser(searchemail);
        }
    },false);

    // Sign out function executed when button with id = logout is clicked
    document.getElementById("logout").addEventListener("click",function(){
        var token = JSON.parse(localStorage.getItem("token"));
        var signoutresult = serverstub.signOut(token);
        if(signoutresult.success){
            // displayView.hide("account");
            displayView.hide("profile");
            displayView.show("welcome");
            localStorage.setItem("token","[]");
            useremail = "";
            searchemail = "";
            document.getElementById("loginalert").innerHTML = signoutresult.message;
        }
    },false);

}