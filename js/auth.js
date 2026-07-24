document.addEventListener("DOMContentLoaded", () => {

    const signupForm = document.getElementById("signupForm");

    if (!signupForm) return;

    signupForm.addEventListener("submit", function(e){

        e.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const mobile = document.getElementById("mobile").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const terms = document.getElementById("terms").checked;

        if(fullName === ""){
            alert("Enter Full Name");
            return;
        }

        if(email === ""){
            alert("Enter Email");
            return;
        }

        if(mobile.length !== 10){
            alert("Enter Valid Mobile Number");
            return;
        }

        if(password.length < 8){
            alert("Password must contain at least 8 characters");
            return;
        }

        if(password !== confirmPassword){
            alert("Passwords do not match");
            return;
        }

        if(!terms){
            alert("Accept Terms & Conditions");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const alreadyExists = users.find(user => user.email === email);

        if(alreadyExists){
            alert("Email already registered");
            return;
        }

        users.push({
            fullName,
            email,
            mobile,
            password
        });

        localStorage.setItem("users", JSON.stringify(users));

        alert("Account Created Successfully!");

        window.location.href = "index.html";

    });

});


const forgotForm = document.getElementById("forgotForm");

if (forgotForm) {
    forgotForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("forgotEmail").value.trim();

        const users = JSON.parse(localStorage.getItem("users")) || [];

        const user = users.find(u => u.email === email);

        if (user) {
            alert("Password Reset Link has been sent to your Email.");
            window.location.href = "index.html";
        } else {
            alert("No account found with this Email Address.");
        }
    });
}