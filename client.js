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
    // Prevent form submission until validation is complete
    // ev.preventDefault();

    const entered_pw = document.getElementById('signup-pw');
    const confirm_pw = document.getElementById('signup-repeatPSW');

    // Check if the password fields are empty

    // 1. No field shall be blank
    // if (!entered_pw.value || !confirm_pw.value) {
    //     alert('All fields are required. Please fill in all the fields.');
    //     console.log("goes into here")
    //     return false;
    // }

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
        return false;
    }

    alert('Passwords match!');

    // // Check if password fields are empty
    // if(!entered_pw || !confirm_pw){
    //     alert('Please enter a password');
    // }else{
    //     if(entered_pw.value.length >= 8 && confirm_pw.value.length >= 8){
    //         // Password has a valid length >= 8 characters.
    //         if (entered_pw.value !== confirm_pw.value) {
    //             // Passwords do not match, clear fields and alert user
    //             alert('Passwords do not match, please re-enter your password again');
    //             entered_pw. value = '';
    //             confirm_pw.value = '';
    //         } else if (entered_pw.value === confirm_pw.value) {
    //             // Passwords match, proceed with form submission
    //             alert('Passwords match! Form submitted.');
    //             return true;
    //         } else {
    //             alert('Sign up failed, please try again.');
    //             console.log("Unhandled exception");
    //         }
    //     }else{
    //         alert('Entered password must be at least 8 characters long');
    //     }
    // }

    return false;    
}
    
    
