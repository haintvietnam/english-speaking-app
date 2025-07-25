function validateLogin(e) {
  // e.preventDefault();
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  console.log(email);
  console.log(password);

  if (email === "user@example.com" && password === "password123") {
    window.location.href = "index.html"; // Redirect on successful login
    return false; // Prevent form submission
  } else {
    alert("Invalid email or password");
    return false;
  }
}
