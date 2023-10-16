document
  .getElementById("username")
  .addEventListener("keydown", function (event) {
    if (event.keyCode === 13) fetchRepos();
  });

async function fetchRepos() {
  const username = document.getElementById("username").value;
  if (!username) return alert("Please enter a GitHub username.");

  try {
    const [profile, repos] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`).then((res) =>
        res.json()
      ),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated`).then(
        (res) => res.json()
      ),
    ]);

    if (!profile || !repos) return alert("Error: Unable to fetch data.");

    const repoContainer = document.getElementById("repoContainer");
    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );

    repoContainer.innerHTML = `<div id="profile-background">
                                <div id="profile-container">
                                    <img src="${profile.avatar_url}" class="profile-pic" alt="${username}'s Profile Picture">
                                    <h2>${profile.name}</h2>
                                    <span class="username">${profile.login}</span>
                                    <p>${profile.bio}</p>
                                </div>
                                    <button onclick="window.open('${profile.html_url}', '_blank')">Follow</button>
                              </div>
                    
                        <p>Repos: ${profile.public_repos} Followers: ${profile.followers} Following: ${profile.following}</p>
                        <p>⭐: ${totalStars}</p>
                    
                    `;

    for (let i = 0; i < 2 && i < repos.length; i++) {
      const repo = repos[i];
      const repoDiv = document.createElement("div");
      repoDiv.innerHTML = `<h2>${repo.name}</h2><a href="${repo.html_url}" target="_blank">View on GitHub</a>`;
      repoContainer.appendChild(repoDiv);
    }

    displayImages(username);
    await setBackground();
  } catch (error) {
    console.error("Network Error:", error);
  }
}

// generate charts
function displayImages(username) {
  const images = [
    {
      id: "top-langs",
      url: `https://github-readme-stats.vercel.app/api/top-langs?username=${username}&show_icons=true&locale=en&layout=compact`,
    },
    {
      id: "user-stats",
      url: `https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&locale=en`,
    },
    {
      id: "streak-stats",
      url: `https://github-readme-streak-stats.herokuapp.com/?user=${username}`,
    },
    {
      id: "contribution-graph",
      url: `https://ghchart.rshah.org/40916c/${username}`,
    },
  ];

  images.forEach((img) => {
    const imageElement = document.getElementById(img.id);
    imageElement.style.display = "block";
    imageElement.src = img.url;
  });
}

// profile background
async function setBackground() {
  const response = await fetch(
    "https://api.unsplash.com/photos/random?query=programming&client_id=9-VX4xJ6eSMuRCnKpGQP_zyM_QqSgKtmvHZmUR4DTYs"
  );
  const data = await response.json();
  const imageUrl = data.urls.full;
  document.getElementById(
    "profile-background"
  ).style.cssText = `background-image: url(${imageUrl});
`;
}
