// Unstar a repository

export const handleUnstarRepo = (event) => {
  const owner = event.target.getAttribute("data-owner");
  const repo = event.target.getAttribute("data-repo");
  const repoCard = event.target.closest(".repository-card");

  fetch("/unstar", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ owner, repo }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        console.log("delete");
        alert(data.message);

        if (repoCard) {
          repoCard.remove();
        }
      } else {
        alert(data.error);
      }
    })
    .catch((error) => console.error("Error unstarring repository:", error));
};
