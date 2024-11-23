// Handle displaying the repositories
import { handleUnstarRepo } from "./handleUnstarRepo.js";

export function displayRepositories(repositories) {
  const favoritesContainer = document.getElementById("favorites");

  repositories.forEach((repo, index) => {
    const repoCard = document.createElement("div");
    repoCard.className = "repository-card";
    repoCard.style.opacity = "1";
    repoCard.style.transform = "translateY(20px)";
    repoCard.innerHTML = `
          <div class="flip-card-inner">
              <div class="flip-card-front">
                  <img src="${repo.owner.avatar_url}" alt="${
      repo.owner.login
    }" class="avatar">
                  <h3>${repo.name}</h3>
                  <p>★ ${repo.stargazers_count}</p>
                  <small>Forks: ${repo.forks_count}</small>
                  <small>Language: ${repo.language}</small>
              </div>
              <div class="flip-card-back">
                  <p>${repo.description || "No description available."}</p>
                  <div class="details">
                      <p>Owner: ${repo.owner.login}</p>
                      <p>Open Issues: ${repo.open_issues_count}</p>
                      <p>Bio: ${repo.owner.bio || "No bio available."}</p>
                      <a href="${
                        repo.html_url
                      }" target="_blank">View Repository</a>
                      <button class="unStar-btn" data-owner="${
                        repo.owner.login
                      }" data-repo="${repo.name}">⭐</button>
                  </div>
              </div>
          </div>
      `;

    favoritesContainer.appendChild(repoCard);

    // Handle click event to UnStar repositories Button
    const unStarButton = repoCard.querySelector(".unStar-btn");
    unStarButton.addEventListener("click", function (event) {
      handleUnstarRepo(event);
    });

    setTimeout(() => {
      repoCard.style.opacity = "1";
      repoCard.style.transform = "translateY(0)";
    }, index * 100);
  });
}
