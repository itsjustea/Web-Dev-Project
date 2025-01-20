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