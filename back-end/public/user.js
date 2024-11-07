// Fetch user data to display Login/Logout button
import { handleFavReposBtn } from "./handleFavReposBtn.js";

export const fetchUserData = () => {
  fetch("/user")
    .then((response) => response.json())
    .then((data) => {
      // Display favorite repositories button and user info if user is logged in
      const userInfoDiv = document.getElementById("user-info");
      const favReposBtnContainer = document.getElementById(
        "favReposBtnContainer"
      );

      if (data.username) {
        // Display user info and logout link
        userInfoDiv.innerHTML = `
          <span class="username">Hello, ${data.username}!</span> 
          <a href="/logout">Logout</a>
          `;

        // Display favorite repositories button
        favReposBtnContainer.style.display = "block";
        favReposBtnContainer.innerHTML =
          '<button id="favReposBtn">Favorite Repositories</button>';
        // Handle click event to Favorite repositories Button
        handleFavReposBtn();
      } else {
        userInfoDiv.innerHTML = '<a href="/auth/github">Login with GitHub</a>';
      }
    })
    .catch((error) => console.error("Error fetching user data:", error));
};
