document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("searchButton");
  const tourButton = document.getElementById("tourButton");
  const repositoriesContainer = document.getElementById("repositories");

  searchButton.addEventListener("click", fetchRepositories);
  tourButton.addEventListener("click", startTour);

  async function fetchRepositories() {
    const language = document.getElementById("customLanguage").value;
    const topic = document.getElementById("topic").value;
    const sort = document.querySelector('input[name="sort"]:checked').value;

    let query = `https://api.github.com/search/repositories?q=language:${language}`;
    if (topic) query += `+topic:${topic}`;
    query += `&sort=${sort}&order=desc`;

    // Update button text to indicate search in progress
    searchButton.textContent = "Searching...";
    searchButton.disabled = true;

    try {
      const response = await fetch(query);
      const data = await response.json();
      displayRepositories(data.items);
    } catch (error) {
      console.error("Error fetching repositories:", error);
    } finally {
      // Revert button text after search completes
      searchButton.textContent = "Search";
      searchButton.disabled = false;
    }
  }

  function displayRepositories(repositories) {
    repositoriesContainer.innerHTML = "";
    const fragment = document.createDocumentFragment();

    repositories.forEach((repo, index) => {
      const repoCard = document.createElement("div");
      repoCard.className = "repository-card";
      repoCard.style.opacity = "0";
      repoCard.style.transform = "translateY(20px)";
      repoCard.innerHTML = `
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <img src="${repo.owner.avatar_url}" alt="${repo.owner.login}" class="avatar">
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
            </div>
            <a href="${repo.html_url}" target="_blank">View on GitHub</a>
          </div>
        </div>
      `;

      fragment.appendChild(repoCard);

      // Add animation delay for a cascading effect
      setTimeout(() => {
        repoCard.style.opacity = "1";
        repoCard.style.transform = "translateY(0)";
      }, index * 100);
    });

    repositoriesContainer.appendChild(fragment);
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
      id: "sort",
      text: "Choose to sort repositories by stars or forks.",
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

  document.getElementById("myForm").addEventListener("submit", function(event) {
    // Prevent the form from being submitted
    event.preventDefault();
    
    // Perform additional actions or validations here
    console.log("Form submission prevented!");
  });
});
