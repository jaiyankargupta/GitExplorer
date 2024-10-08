document.addEventListener('DOMContentLoaded', function () {
  const searchButton = document.getElementById('searchButton');
  const repositoriesContainer = document.getElementById('repositories');
  const rateLimitMessage = document.getElementById('rateLimitMessage');
  const tourButton = document.getElementById('tourButton');

  const loader = document.querySelector('.loader');
  const loadMoreButton = document.createElement('button');
  loadMoreButton.textContent = 'Load More';
  loadMoreButton.id = 'loadMoreButton';
  loadMoreButton.style.display = 'none';
  repositoriesContainer.after(loadMoreButton);

  let currentPage = 1;
  let currentQuery = '';

  startTour();
  tourButton.addEventListener('click', startTour);
  searchButton.addEventListener('click', fetchRepositories);
  loadMoreButton.addEventListener('click', loadMoreRepositories);

  async function fetchRepositories(event, page = 1) {
    event.preventDefault();

    const language = document.getElementById('customLanguage').value;
    const topic = document.getElementById('topic').value;

    const keyword = document.getElementById('keyword').value;

    const sortOptions = Array.from(
      document.querySelectorAll('input[name="sort"]:checked')
    ).map((el) => el.value);

    let query = 'https://api.github.com/search/repositories?q=';
    const filters = [];

    if (language) filters.push(`language:${language}`);
    if (topic) filters.push(`topic:${topic}`);
    if (keyword) filters.push(keyword);

    query += filters.join('+');

    if (sortOptions.length > 0) {
      query += `&sort=${sortOptions.join(',')}&order=desc`;
    }

    query += `&page=${page}&per_page=10`;

    currentQuery = query;

    showLoader();

    try {
      const response = await fetch(query);
      const data = await response.json();
      const repositories = data.items;

      // Getting the rate limit headers from response
      const rateLimitRemain = response.headers.get('X-RateLimit-Remaining');
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');
      const rateResetInSeconds = convertRateLimitResetToSeconds(rateLimitReset); // Convert the rate limit reset time to seconds
      const rateLimitRemainInt = parseInt(rateLimitRemain); // Ensure that the rate limit is an integer, value returned is a string

      // Alert user if the rate limit is almost reached (< 5)
      if (rateLimitRemainInt < 5) {
        rateLimitMessage.innerHTML = `Reminder: You have ${rateLimitRemain} ${
          rateLimitRemain > 1 ? 'requests' : 'request'
        } left.`;
      }

      // If the rate limit is 0 or exceeded, show an error message
      if (rateLimitRemainInt === 0) {
        throw new Error(
          `Rate limit exceeded. Please try again after ${rateResetInSeconds} ${
            rateResetInSeconds > 1 ? 'seconds' : 'second'
          }.`
        );
      }

      if (repositories.length === 0 && page === 1) {
        repositoriesContainer.innerHTML = '<h2>No repositories found.</h2>';
        loadMoreButton.style.display = 'none';
      } else {
        if (page === 1) {
          repositoriesContainer.innerHTML = '';
        }
        displayRepositories(repositories);
        loadMoreButton.style.display =
          repositories.length === 10 ? 'block' : 'none';
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
      repositoriesContainer.innerHTML = `<h2>An error occurred while fetching repositories: ${error.message}</h2>`;
      rateLimitMessage.innerHTML = '';
    } finally {
      hideLoader();
    }
  }

  async function loadMoreRepositories() {
    currentPage++;
    await fetchRepositories({ preventDefault: () => {} }, currentPage);
  }

  function displayRepositories(repositories) {
    repositories.forEach((repo, index) => {
      const repoCard = document.createElement('div');
      repoCard.className = 'repository-card';
      repoCard.style.opacity = '0';
      repoCard.style.transform = 'translateY(20px)';
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
            <p>${repo.description || 'No description available.'}</p>
            <div class="details">
              <p>Owner: ${repo.owner.login}</p>
              <p>Open Issues: ${repo.open_issues_count}</p>
              <p>Bio: ${repo.owner.bio || 'No bio available.'}</p>

            </div>
          </div>
        `;

      repositoriesContainer.appendChild(repoCard);

      setTimeout(() => {
        repoCard.style.opacity = '1';
        repoCard.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  function convertRateLimitResetToSeconds(rateLimitReset) {
    // Get the current Unix time (in seconds)
    const currentTime = Math.floor(Date.now() / 1000);

    // Calculate the remaining time in seconds
    const timeRemainingInSeconds = rateLimitReset - currentTime;

    return timeRemainingInSeconds;
  }

  function showLoader() {
    loader.style.display = 'inline-block';
    repositoriesContainer.style.display = 'none';
    searchButton.disabled = true;
    searchButton.textContent = 'Searching...';
  }

  function hideLoader() {
    loader.style.display = 'none';
    repositoriesContainer.style.display = 'flex';
    searchButton.disabled = false;
    searchButton.textContent = 'Search';
  }

  function startTour() {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        classes: 'shadow-md bg-purple-dark',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    });

    tour.addStep({
      id: 'language',
      text: 'Select the programming language you are interested in.',
      attachTo: { element: '#customLanguage', on: 'bottom' },
      buttons: [{ text: 'Next', action: tour.next }],
    });

    tour.addStep({
      id: 'topic',
      text: 'Optionally enter a topic to narrow down your search.',
      attachTo: { element: '#topic', on: 'bottom' },
      buttons: [{ text: 'Next', action: tour.next }],
    });

    tour.addStep({
      id: 'keyword',
      text: 'Optionally enter keyword to narrow down your search.',
      attachTo: { element: '#keyword', on: 'bottom' },
      buttons: [{ text: 'Next', action: tour.next }],
    });

    tour.addStep({
      id: 'sort',
      text: 'Choose to Sort repositories by Commits, Issues, Pull Requests, Forks and Stars',
      attachTo: { element: '#stars', on: 'bottom' },
      buttons: [{ text: 'Next', action: tour.next }],
    });

    tour.addStep({
      id: 'search',
      text: 'Click the Search button to fetch top repositories matching your criteria.',
      attachTo: { element: '#searchButton', on: 'bottom' },
      buttons: [{ text: 'Finish', action: tour.complete }],
    });

    tour.start();
  }

  document
    .getElementById('myForm')
    .addEventListener('submit', function (event) {
      event.preventDefault();
      console.log('Form submission prevented!');
    });
});
