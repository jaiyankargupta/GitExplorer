// Handle click event to Star repositories Button
export const handleStarRepo = (starButton) => {
  starButton.addEventListener("click", function (event) {
    const owner = event.target.getAttribute("data-owner");
    const repo = event.target.getAttribute("data-repo");

    fetch("/star", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ owner, repo }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message);
        } else {
          alert(data.error);
        }
      })
      .catch((error) => console.error("Error starring repository:", error));
  });
};
