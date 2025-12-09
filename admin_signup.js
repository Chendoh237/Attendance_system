// --- SIGNUP LOGIC ---
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const institution = document.getElementById("institution").value.trim();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("signupConfirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Save user to localStorage as mock database
        const user = { name, email, institution, password };
        localStorage.setItem("attendance_user", JSON.stringify(user));

        alert("Account created successfully!");
        window.location.href = "admin_login.html";
    });
}