import { fetchUserData } from "./user.js";
import { handleStarRepo } from "./handleStarRepo.js";

document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("searchButton");
  const repositoriesContainer = document.getElementById("repositories");
  const rateLimitMessage = document.getElementById("rateLimitMessage");
  const tourButton = document.getElementById("tourButton");

  const loader = document.querySelector(".loader");

  // Create a pagination
  const paginationContainer = document.createElement("div");
  paginationContainer.id = "paginationContainer";

  // const loadMoreButton = document.createElement('button');
  // loadMoreButton.textContent = 'Load More';
  // loadMoreButton.id = 'loadMoreButton';
  // loadMoreButton.style.display = 'none';
  repositoriesContainer.after(paginationContainer);

  let currentPage = 1;
  let currentQuery = "";
  let totalPages = 1;

  startTour();
  tourButton.addEventListener("click", startTour);
  searchButton.addEventListener("click", fetchRepositories);
  // loadMoreButton.addEventListener("click", loadMoreRepositories);

  async function fetchRepositories(event, page = 1) {
    event.preventDefault();

    // Remove any existing repositories from the previous search
    repositoriesContainer.innerHTML = "";

    const language = document.getElementById("customLanguage").value;
    const topic = document.getElementById("topic").value;

    const keyword = document.getElementById("keyword").value;

    const sortOptions = Array.from(
      document.querySelectorAll('input[name="sort"]:checked')
    ).map((el) => el.value);

    let query = "https://api.github.com/search/repositories?q=";
    const filters = [];

    if (language) filters.push(`language:${language}`);
    if (topic) filters.push(`topic:${topic}`);
    if (keyword) filters.push(keyword);

    query += filters.join("+");

    if (sortOptions.length > 0) {
      query += `&sort=${sortOptions.join(",")}&order=desc`;
    }

    query += `&page=${page}&per_page=10`;

    currentQuery = query;

    showLoader();

    try {
      const response = await fetch(query);
      const data = await response.json();
      if (data) {
        const repositories = data.items;

        // Because Github API only allows fetching up to 1000 results, we need to limit the total pages to 100
        // https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28
        totalPages = 100;

        // Getting the rate limit headers from response
        const rateLimitRemain = response.headers.get("X-RateLimit-Remaining");
        const rateLimitReset = response.headers.get("X-RateLimit-Reset");
        const rateResetInSeconds =
          convertRateLimitResetToSeconds(rateLimitReset); // Convert the rate limit reset time to seconds
        const rateLimitRemainInt = parseInt(rateLimitRemain); // Ensure that the rate limit is an integer, value returned is a string

        // Alert user if the rate limit is almost reached (< 5)
        if (rateLimitRemainInt < 5) {
          rateLimitMessage.innerHTML = `Reminder: You have ${rateLimitRemain} ${
            rateLimitRemain > 1 ? "requests" : "request"
          } left.`;
        }

        // If the rate limit is 0 or exceeded, show an error message
        if (rateLimitRemainInt === 0) {
          throw new Error(
            `Rate limit exceeded. Please try again after ${rateResetInSeconds} ${
              rateResetInSeconds > 1 ? "seconds" : "second"
            }.`
          );
        }

        if (repositories.length === 0 && page === 1) {
          repositoriesContainer.innerHTML = "<h2>No repositories found.</h2>";
          loadMoreButton.style.display = "none";
        } else {
          if (page === 1) {
            repositoriesContainer.innerHTML = "";
          }
          displayRepositories(repositories);
          renderPagination();
          // loadMoreButton.style.display =
          //   repositories.length === 10 ? "block" : "none";
        }
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
      repositoriesContainer.innerHTML = `<h2>An error occurred while fetching repositories: ${error.message}</h2>`;
      rateLimitMessage.innerHTML = "";
    } finally {
      hideLoader();
    }
  }

  // async function loadMoreRepositories() {
  //   currentPage++;
  //   await fetchRepositories({ preventDefault: () => {} }, currentPage);
  // }

  function displayRepositories(repositories) {
    repositories.forEach((repo, index) => {
      const repoCard = document.createElement("div");
      repoCard.className = "repository-card";
      repoCard.style.opacity = "0";
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
                      <button class="star-btn" data-owner="${
                        repo.owner.login
                      }" data-repo="${repo.name}">⭐</button>
                  </div>
              </div>
          </div>
      `;

      repositoriesContainer.appendChild(repoCard);

      // Handle click event to Star repositories Button
      const starButton = repoCard.querySelector(".star-btn");
      handleStarRepo(starButton);

      setTimeout(() => {
        repoCard.style.opacity = "1";
        repoCard.style.transform = "translateY(0)";
      }, index * 100);
    });
  }

  function createButton(text, className, isDisabled, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    if (isDisabled === true) {
      className += " disabled";
    }
    button.className = className;
    button.disabled = isDisabled;
    button.addEventListener("click", onClick);
    return button;
  }

  function renderPagination() {
    paginationContainer.innerHTML = "";

    if (totalPages !== 1) {
      // Create "Previous" button
      const previousButton = createButton(
        "Previous",
        "pagination-button",
        currentPage === 1,
        () => {
          if (currentPage > 1) {
            currentPage--;
            fetchRepositories({ preventDefault: () => {} }, currentPage);
          }
        }
      );
      paginationContainer.appendChild(previousButton);

      const createPageButton = (page) => {
        const pageButton = createButton(
          page,
          "pagination-button",
          page === currentPage,
          () => {
            currentPage = page;
            fetchRepositories({ preventDefault: () => {} }, currentPage);
          }
        );
        paginationContainer.appendChild(pageButton);
      };
      createPageButton(1);

      // Show ellipsis if there are more than 3 pages between the first page and the current page
      if (currentPage > 4) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        paginationContainer.appendChild(ellipsis);
      }

      // Show a few pages around the current page
      for (
        let i = Math.max(2, currentPage - 2);
        i <= Math.min(totalPages - 1, currentPage + 2);
        i++
      ) {
        createPageButton(i);
      }

      // Show ellipsis if there are more than 3 pages between the current page and the last page
      if (currentPage < totalPages - 3) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        paginationContainer.appendChild(ellipsis);
      }

      // Always show the last page
      if (totalPages > 1) {
        createPageButton(totalPages);
      }

      const nextButton = createButton(
        "Next",
        "pagination-button",
        currentPage === totalPages,
        () => {
          if (currentPage < totalPages) {
            currentPage++;
            fetchRepositories({ preventDefault: () => {} }, currentPage);
          }
        }
      );
      paginationContainer.appendChild(nextButton);
    }
  }

  function convertRateLimitResetToSeconds(rateLimitReset) {
    // Get the current Unix time (in seconds)
    const currentTime = Math.floor(Date.now() / 1000);

    // Calculate the remaining time in seconds
    const timeRemainingInSeconds = rateLimitReset - currentTime;

    return timeRemainingInSeconds;
  }

  function showLoader() {
    loader.style.display = "inline-block";
    repositoriesContainer.style.display = "none";
    searchButton.disabled = true;
    searchButton.textContent = "Searching...";
  }

  function hideLoader() {
    loader.style.display = "none";
    repositoriesContainer.style.display = "flex";
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }

  function startTour() {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        classes: "shadow-md bg-purple-dark",
        scrollTo: { behavior: "smooth", block: "center" },
      },
    });

    tour.addStep({
      id: "language",
      text: "Select the programming language you are interested in.",
      attachTo: { element: "#customLanguage", on: "bottom" },
      buttons: [{ text: "Next", action: tour.next }],
    });

    tour.addStep({
      id: "topic",
      text: "Optionally enter a topic to narrow down your search.",
      attachTo: { element: "#topic", on: "bottom" },
      buttons: [{ text: "Next", action: tour.next }],
    });

    tour.addStep({
      id: "keyword",
      text: "Optionally enter keyword to narrow down your search.",
      attachTo: { element: "#keyword", on: "bottom" },
      buttons: [{ text: "Next", action: tour.next }],
    });

    tour.addStep({
      id: "sort",
      text: "Choose to Sort repositories by Commits, Issues, Pull Requests, Forks and Stars",
      attachTo: { element: "#stars", on: "bottom" },
      buttons: [{ text: "Next", action: tour.next }],
    });

    tour.addStep({
      id: "search",
      text: "Click the Search button to fetch top repositories matching your criteria.",
      attachTo: { element: "#searchButton", on: "bottom" },
      buttons: [{ text: "Finish", action: tour.complete }],
    });

    tour.start();
  }

  // Fetch user data to display Login/Logout button
  fetchUserData();

  document
    .getElementById("myForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      console.log("Form submission prevented!");
    });
});
