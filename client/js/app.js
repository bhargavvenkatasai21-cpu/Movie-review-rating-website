const moviesDiv = document.getElementById("movies");

async function searchMovie() {
  const query = document.getElementById("searchInput").value;

  const response = await fetch(
    `http://localhost:5000/api/movies/search?query=${query}`
  );

  const data = await response.json();

  moviesDiv.innerHTML = "";

  data.results.forEach(movie => {
    const movieCard = document.createElement("div");

    movieCard.classList.add("movie-card");

    movieCard.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>⭐ ${(movie.vote_average / 2).toFixed(1)} / 5</p>                      
      <p>${movie.release_date}</p>
      
    `;

    movieCard.addEventListener("click", () => {
      window.location.href = `movie.html?id=${movie.id}`;
    });

    moviesDiv.appendChild(movieCard);
  });
}

async function loadMovies() {
  const response = await fetch(
    "http://localhost:5000/api/movies/popular"
  );

  const data = await response.json();

  data.results.forEach(movie => {
    const movieCard = document.createElement("div");

    movieCard.classList.add("movie-card");

    movieCard.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>⭐ ${(movie.vote_average / 2).toFixed(1)} / 5</p>             
      <p>${movie.release_date}</p>
    `;

    movieCard.addEventListener("click", () => {
      window.location.href = `movie.html?id=${movie.id}`;
    });

    moviesDiv.appendChild(movieCard);
  });
}

document
  .getElementById("searchInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchMovie();
    }
  });

loadMovies();