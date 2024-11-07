// Handle click event to Favorite repositories Button
import { displayRepositories } from "./displayFavRepos.js";

export const handleFavReposBtn = () => {
  document.getElementById("favReposBtn").addEventListener("click", function () {
    window.location.href = "/favoritePage";

    fetch("/favorites")
      .then((response) => response.json())
      .then((repos) => {
        const favoriteDiv = document.getElementById("favorites");
        favoriteDiv.innerHTML = "";
        if (repos.length > 0) {
          displayRepositories(repos);
        } else {
          favoriteDiv.innerHTML = "<p>No favorite repositories found.</p>";
        }
      })
      .catch((error) =>
        console.error("Error fetching favorite repositories:", error)
      );
  });
};
