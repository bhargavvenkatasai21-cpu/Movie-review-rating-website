const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const moviesDiv = document.getElementById("movies");

let currentPage = 1;
let totalPages = 1;

// Logout

function logout() {

  showToast("Logged out successfully.");

    setTimeout(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    

    window.location.href = "login.html";
    }, 800);

}

// Search Movies

async function searchMovie() {

    const query = document.getElementById("searchInput").value.trim();

    if (!query) {
        loadMovies();
        return;
    }

    try {

        const response = await fetch(
            `https://movie-review-rating-website.onrender.com/api/movies/search?query=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        if (!response.ok) {
            moviesDiv.innerHTML = `<p>${data.message}</p>`;
            return;
        }

        moviesDiv.innerHTML = "";

        if (data.results.length === 0) {

            moviesDiv.innerHTML = `
                <p>No movies found.</p>
            `;

            return;

        }

        data.results.forEach(movie => {

            const movieCard = document.createElement("div");

            movieCard.classList.add("movie-card");

            const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : "https://via.placeholder.com/300x450?text=No+Image";

            movieCard.innerHTML = `
                <img src="${poster}" alt="${movie.title}">

                <h3>${movie.title}</h3>

                <p>⭐ ${(movie.vote_average / 2).toFixed(1)} / 5</p>

                <p>${movie.release_date || "Unknown"}</p>
            `;

            movieCard.addEventListener("click", () => {
                window.location.href = `movie.html?id=${movie.id}`;
            });

            moviesDiv.appendChild(movieCard);

        });

        // Disable pagination while searching
        document.getElementById("pageNumber").textContent = "Search Results";

        document.getElementById("prevBtn").disabled = true;
        document.getElementById("nextBtn").disabled = true;

    } catch (error) {

        moviesDiv.innerHTML = `
            <p>${error.message}</p>
        `;

    }

}

// Load Popular Movies

async function loadMovies(page = 1) {

    try {

        const response = await fetch(
            `https://movie-review-rating-website.onrender.com/api/movies/popular?page=${page}`
        );

        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            moviesDiv.innerHTML = `<p>${data.message}</p>`;
            return;
        }

        currentPage = data.page;
        totalPages = data.totalPages;

        moviesDiv.innerHTML = "";

        data.results.forEach(movie => {

            const movieCard = document.createElement("div");

            movieCard.classList.add("movie-card");

            const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : "https://via.placeholder.com/300x450?text=No+Image";

            movieCard.innerHTML = `
                <img src="${poster}" alt="${movie.title}">

                <h3>${movie.title}</h3>

                <p>⭐ ${(movie.vote_average / 2).toFixed(1)} / 5</p>

                <p>${movie.release_date || "Unknown"}</p>
            `;

            movieCard.addEventListener("click", () => {
                window.location.href = `movie.html?id=${movie.id}`;
            });

            moviesDiv.appendChild(movieCard);

        });

        document.getElementById("pageNumber").textContent =
            `Page ${currentPage} of ${totalPages}`;

        document.getElementById("prevBtn").disabled =
            currentPage === 1;

        document.getElementById("nextBtn").disabled =
            currentPage === totalPages;

    } catch (error) {

        moviesDiv.innerHTML = `
            <p>${error.message}</p>
        `;

    }

}

// Previous Page

function previousPage() {

    if (currentPage > 1) {
        loadMovies(currentPage - 1);
    }

}

// Next Page

function nextPage() {

    if (currentPage < totalPages) {
        loadMovies(currentPage + 1);
    }

}

// Search on Enter

document
    .getElementById("searchInput")
    .addEventListener("keypress", function (e) {

        if (e.key === "Enter") {
            searchMovie();
        }

    });

// Load Movies

loadMovies();


// Navbar Animation

let lastScrollTop = 0;

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    let currentScroll =
        window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll <= 150) {

        navbar.style.top = "0";

        lastScrollTop = currentScroll;

        return;

    }

    if (currentScroll > lastScrollTop) {

        navbar.style.top = "-80px";

    } else {

        navbar.style.top = "0";

    }

    lastScrollTop = currentScroll;

});