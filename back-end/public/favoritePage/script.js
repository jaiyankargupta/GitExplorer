import { displayRepositories } from "../displayFavRepos.js";

document.addEventListener("DOMContentLoaded", () => {
  fetch("/favorites")
    .then((response) => response.json())
    .then((repos) => {
      displayRepositories(repos);
    })
    .catch((error) =>
      console.error("Error fetching favorite repositories:", error)
    );
});
