document
  .getElementById("username")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") fetchRepos();
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
    // Check if the user exists:
    if (profile.message === "Not Found") {
      return alert("GitHub user not found. 😑");
    }

    if (!profile || !repos) return alert("Error: Unable to fetch data.");

    // Make filter and sort options visible
    document.getElementById("languageFilter").style.display = "inline-block";
    document.getElementById("sortOrder").style.display = "inline-block";

    const repoContainer = document.getElementById("repoContainer");
    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );
    
    document.getElementById("charts").style.display = "block"
    document.getElementById("quotes").style.display = "none"

    repoContainer.innerHTML = `<div id="profile-background"></div>
                                <img src="${profile.avatar_url}" class="profile-pic" alt="${username}'s Profile Picture">
                                <div id="profile-container">
                                    <h2>${profile.name}</h2>
                                    <span class="username">${profile.login}</span>
                                    <p>${profile.bio}</p>
                                    <button class="follow-btn" onclick="window.open('${profile.html_url}', '_blank')">Follow</button>
                                </div>
                                <div class="social-container">
                                  <p>Repos: ${profile.public_repos}</p>
                                  <p>Followers: ${profile.followers}</p>
                                  <p>Following: ${profile.following}</p>
                                  <p>⭐: ${totalStars}</p>
                                </div>
                                <div class="repo-box">
                                    <div class="repo-header">Recent Repos</div>
                                    <div class="repo-list">
                                    </div>
                                </div> `;

    // Extract unique languages from the repos; filter out null/undefined languages
    const uniqueLanguages = [
      ...new Set(repos.map((repo) => repo.language).filter(Boolean)),
    ];
    // Get the language filter dropdown
    const languageFilter = document.getElementById("languageFilter");

    // Clear existing options first (except the first 'Filter by Language' option)
    while (languageFilter.options.length > 1) {
      languageFilter.remove(1);
    }

    // Populate the dropdown with unique languages
    uniqueLanguages.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang;
      option.textContent = lang;
      languageFilter.appendChild(option);
    });

    displayRepos(repos);

    // Event listeners for filter and sort:
    languageFilter.addEventListener("change", function () {
      const selectedLang = this.value;
      const filteredRepos = selectedLang
        ? repos.filter((repo) => repo.language === selectedLang)
        : repos;
      displayRepos(filteredRepos);
    });

    document
      .getElementById("sortOrder")
      .addEventListener("change", function () {
        const order = this.value;
        const sortedRepos = [...repos].sort((a, b) => {
          if (order === "name") return a.name.localeCompare(b.name);
          if (order === "updated_at")
            return new Date(b.updated_at) - new Date(a.updated_at);
          return 0;
        });
        displayRepos(sortedRepos);
      });

    displayRepos(repos);
    displayImages(username);
    // Start the spinning animation for the button
    document.getElementById("flickBtn").classList.add("loading");
    await setBackground();
  } catch (error) {
    console.error("Network Error:", error);
    document.getElementById("flickBtn").classList.remove("loading");
    alert("An error occurred. Please try again.");
  }
}

// repo
function displayRepos(repos) {
  const repoList = document.querySelector(".repo-list");
  repoList.innerHTML = ""; // clear existing repos

  repos.forEach((repo) => {
    const repoDiv = document.createElement("div");
    repoDiv.className = "repo-item";
    repoDiv.innerHTML = `
            <h2>${repo.name}</h2>
            <p>Language: ${repo.language}</p>
            <a href="${repo.html_url}" target="_blank">View on GitHub</a>
        `;
    repoList.appendChild(repoDiv);
  });
}

// generate charts
function displayImages(username) {
  const images = [
    {
      id: "top-langs",
      url: `https://github-readme-stats.vercel.app/api/top-langs?username=${username}&show_icons=true&theme=tokyonight&locale=en&layout=compact`,
    },
    {
      id: "user-stats",
      url: `https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=tokyonight&locale=en`,
    },
    {
      id: "streak-stats",
      url: `https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=tokyonight`,
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
    if (img.id === "contribution-graph") {
      document.getElementById("chart-label").style.display = "block";
    }
  });
}

// profile background
async function setBackground() {
  const response = await fetch(
    "https://api.unsplash.com/photos/random?query=programming&client_id=9-VX4xJ6eSMuRCnKpGQP_zyM_QqSgKtmvHZmUR4DTYs"
  );
  const data = await response.json();
  const imageUrl = data.urls.full;
  const img = new Image(); // Create a new Image object
  img.src = imageUrl;

  img.onload = () => {
    // This function will run once the image has loaded
    document.getElementById(
      "profile-background"
    ).style.cssText = `background-image: url(${imageUrl});`;
    document.getElementById("flickBtn").classList.remove("loading");
  };
}

// GIPHY
async function fetchGif(searchTerm) {
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?q=${searchTerm}&api_key=7zcr5tNW9JmYSO2awsqBqGK3OjpLjnh3&limit=10`
    );
    const data = await response.json();

    if (!data.data.length) {
      throw new Error(
        "Sorry, No results found for the provided search term!😔 "
      );
    }

    return data.data.map((gif) => gif.images.original.url);
  } catch (error) {
    throw error;
  }
}

const modal = document.getElementById("giphyModal");
const closeBtn = document.querySelector(".close");

let currentGifIndex = 0;
let gifs = [];

function displayGif(index) {
  const giphyContainer = document.getElementById("giphy-container");
  giphyContainer.innerHTML = `<img src="${gifs[index]}" alt="Giphy GIF">`;
}

function navigateGif(direction) {
  currentGifIndex += direction;
  if (currentGifIndex >= gifs.length) {
    currentGifIndex = 0;
  } else if (currentGifIndex < 0) {
    currentGifIndex = gifs.length - 1;
  }
  displayGif(currentGifIndex);
}

function searchGif() {
  const searchTerm = document.getElementById("search-term").value.trim();

  if (!searchTerm) {
    alert("Please enter a search term before searching.");
    return;
  }

  fetchGif(searchTerm)
    .then((urls) => {
      gifs = urls;
      currentGifIndex = 0;
      displayGif(currentGifIndex);
      modal.style.display = "block";
    })
    .catch((error) => {
      alert(error.message);
    });

  document.getElementById("search-term").value = "";
}

function checkEnter(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    searchGif();
  }
}

// Function to close the modal
closeBtn.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

async function generateQuote() {
  const category = 'success';
  const apiUrl = 'https://api.api-ninjas.com/v1/quotes?category=' + category;
  const apiKey = 'kYo51+WlNXECn/ELlkpIBA==LNDvdkxjMZGVmppP';

  const headers = {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
  };

  const authorDiv = document.getElementById('author');
  const quoteDiv = document.getElementById('quote');

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (result.length > 0) {
      quoteDiv.innerHTML = `"${result[0].quote}"`;
      authorDiv.innerHTML = `- ${result[0].author}`;
    } else {
      console.error('No quotes found in the API response.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

generateQuote();






