function showProfilePage() {
    // Get email value and display it in the profile view
    const email = document.getElementById('login-email').value;
    if (email) {
        document.getElementById('login-email').textContent = email;
    }

    // Toggle views
    document.getElementById('signin-view').classList.add('hidden');
    document.getElementById('profile-view').classList.remove('hidden');
}


function showSignInPage() {
    // Clear the form inputs
    document.getElementById('signin-form').reset();

    // Toggle views
    document.getElementById('profile-view').classList.add('hidden');
    document.getElementById('signin-view').classList.remove('hidden');
}

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