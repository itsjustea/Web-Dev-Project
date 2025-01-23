var useremail = "";
var searchemail = "";

var displayView = {
    // the code required to display a view\
    show: function (id) {
        document.getElementById(id + "Page").innerHTML = document.getElementById(id + "View").innerHTML;
        console.log(id);
        if (id == "profile") {
            useremail = serverstub.getUserDataByToken(JSON.parse(localStorage.getItem("token"))).data.email;
            // attachHandler();
            showMyProfile();
            // refreshwall(useremail);
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
    //You shall put your own custom code here.
    initlocalstorage();
    //only when the user is logged out, it will shows the welcome view
    if(JSON.parse(localStorage.getItem("token")).length == 0){
        displayView.show("welcome");
    }else{
        displayView.show("profile");
    }
};

// User field validation - Step 3
function pwValidation(ev) {
    const entered_pw = document.getElementById('signup-pw').value;
    const confirm_pw = document.getElementById('signup-repeatPSW').value;

    if(entered_pw.length < 8 || confirm_pw.length < 8) {
        alert('Entered password must be at least 8 characters long');
    }else if(entered_pw != confirm_pw){
        // Password do not match, clear fields and alert user
        window.alert('Passwords do not match, please re-enter your password again');
        entered_pw.value = '';
        confirm_pw.value = '';
    }else if(entered_pw === confirm_pw){
        // Passwords match, proceed with form submission
        return true;
    }else{
        window.alert('Sign up failed, please try again.');
        console.log("Unhandled exception");
    }

    return false;
}

var signup = function() {
    // Get values from the form inputs
    var email = document.getElementById('signup-email').value;
    var password = document.getElementById('signup-pw').value;
    var firstName = document.getElementById('signup-fname').value;
    var familyName = document.getElementById('signup-famname').value;
    var gender = document.getElementById('signup-gender').value;
    var city = document.getElementById('signup-city').value;
    var country = document.getElementById('signup-country').value;

    var newUser = {email, password, firstName, familyName, gender, city, country};
    console.log(newUser)
    var submitResult = serverstub.signUp(newUser);
    // submitResult.success = true;

    document.getElementById("signupalert").innerText = submitResult.success;

    if (submitResult.success){
        document.getElementById("signupalert").style.color = "black";

        var token = "";
        var loginResult = serverstub.signIn(email,password);
        if (loginResult.success){
            token = loginResult.data;
            localStorage.setItem("token", JSON.stringify(token));
            displayView.show("profile");
            displayView.hide("welcome");
            useremail = email;
            showMyProfile();
            refreshwall(email);
        }
    }

    alert('Form submitted successfully!');
}

function showMyProfile(){
    showOthersProfile(useremail);
    document.getElementById("profileheader").innerHTML = "Your Profile";
}

var refreshwall = function (email) {
    var token = JSON.parse(localStorage.getItem("token"));
    var refreshresult = serverstub.getUserMessagesByEmail(token,email);
    var wall = document.getElementById("messagewall");
    document.getElementById("wallalert").innerText = refreshresult.message;
    if(refreshresult.success){
        var msgs = refreshresult.data;
        var msg = "";
        wall.innerHTML = "<tr><th>Author</th><th>Message</th></tr>";
        for(var i=0;i<msgs.length;i++){
            msg = "<tr><td>" + msgs[i].writer + "</td><td>" + msgs[i].content + "</td></tr>" ;
            wall.innerHTML += msg;
        }
    }
    if(email === useremail){
        document.getElementById("wallheader").innerHTML = "Your Message Wall:";
    }else{
        document.getElementById("wallheader").innerHTML = email + "'s Message Wall:";
    }
}


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
       refreshwall(useremail);
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

    // Sign out function
    document.getElementById("logout").addEventListener("click",function(){
        var token = JSON.parse(localStorage.getItem("token"));
        var signoutresult = serverstub.signOut(token);
        if(signoutresult.success){
            displayView.hide("profile");
            displayView.show("welcome");
            localStorage.setItem("token","[]");
            useremail = "";
            searchemail = "";
            document.getElementById("loginalert").innerHTML = signoutresult.message;
        }
    },false);

}