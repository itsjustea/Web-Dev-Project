var useremail = "";
var searchemail = "";

// the code required to display a view
var displayView = {
    show: function (id) {
        document.getElementById(id + "Page").innerHTML = document.getElementById(id + "View").innerHTML;
        if (id == "profile") {
            useremail = serverstub.getUserDataByToken(JSON.parse(localStorage.getItem("token"))).data.email;
            attachHandler();
            showMyProfile();
            
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
        displayView.show("profile");
        displayView.hide("welcome");
        useremail = email;
        showMyProfile();
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

    // For testing - Bryan
    // for(f in newUser){
    //     console.log(f + "type: " + typeof(newUser[f]));
    // }

    var submitResult = serverstub.signUp(newUser);

    document.getElementById("signupalert").innerText = submitResult.message;

    if (submitResult.success){
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
    // showOthersProfile(useremail);
    document.getElementById("profileheader").innerHTML = "Your Profile";
}

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
       showMyProfile();
       
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