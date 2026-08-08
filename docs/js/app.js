const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const moviesDiv = document.getElementById("movies");
const paginationPages = document.getElementById("paginationPages");
const paginationInfo = document.getElementById("paginationInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const firstBtn = document.getElementById("firstBtn");
const lastBtn = document.getElementById("lastBtn");

let currentPage = 1;
let totalPages = 500; // default TMDB popular pages limit
let isSearchMode = false;

// Logout
function logout() {
    showToast("Logged out successfully.");
    setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    }, 800);
}

// Render 5-Page Sliding Window Pagination Controls
function renderPagination() {
    if (!paginationPages) return;
    paginationPages.innerHTML = "";

    if (isSearchMode) {
        paginationInfo.textContent = "Search Results";
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        if (firstBtn) firstBtn.disabled = true;
        if (lastBtn) lastBtn.disabled = true;
        return;
    }

    const windowSize = 5;
    // Calculate 5-page window start & end
    const windowIndex = Math.floor((currentPage - 1) / windowSize);
    const startPage = windowIndex * windowSize + 1;
    const endPage = Math.min(startPage + windowSize - 1, totalPages);

    // Create page buttons 1 to 5 (or 6 to 10, etc.)
    for (let page = startPage; page <= endPage; page++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.classList.add("page-btn");
        if (page === currentPage) {
            btn.classList.add("active");
        }
        btn.textContent = page;
        btn.onclick = () => loadMovies(page);
        paginationPages.appendChild(btn);
    }

    if (paginationInfo) {
        paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (firstBtn) firstBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    if (lastBtn) lastBtn.disabled = currentPage >= totalPages;
}

// Load Popular Movies with Page
async function loadMovies(page = 1) {
    isSearchMode = false;
    try {
        moviesDiv.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 16px; padding: 40px;">Loading popular movies...</p>`;

        const response = await fetch(`${API}/movies/popular?page=${page}`);
        const data = await response.json();

        if (!response.ok) {
            moviesDiv.innerHTML = `<p style="color: #ef4444; text-align: center;">${data.message || "Failed to load movies"}</p>`;
            return;
        }

        currentPage = data.page || page;
        if (data.totalPages) {
            // TMDB API caps page queries at maximum 500
            totalPages = Math.min(data.totalPages, 500);
        }

        moviesDiv.innerHTML = "";

        if (!data.results || data.results.length === 0) {
            moviesDiv.innerHTML = `<p style="text-align: center; color: var(--text-muted);">No movies found.</p>`;
            return;
        }

        data.results.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");

            const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : "https://via.placeholder.com/300x450?text=No+Image";

            const rating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : "N/A";
            const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";

            movieCard.innerHTML = `
                <img src="${poster}" alt="${escapeHTML(movie.title)}" loading="lazy">
                <h3>${escapeHTML(movie.title)}</h3>
                <p style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <span style="color: var(--star-gold); font-weight: 700;">⭐ ${rating} / 5</span>
                    <span style="background: var(--input-bg); padding: 4px 10px; border-radius: 12px; font-size: 12px;">📅 ${year}</span>
                </p>
            `;

            movieCard.addEventListener("click", () => {
                window.location.href = `movie.html?id=${movie.id}`;
            });

            moviesDiv.appendChild(movieCard);
        });

        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        moviesDiv.innerHTML = `<p style="color: #ef4444; text-align: center;">❌ ${error.message}</p>`;
    }
}

// Search Movies
async function searchMovie() {
    const queryInput = document.getElementById("searchInput");
    const query = queryInput ? queryInput.value.trim() : "";

    if (!query) {
        loadMovies(1);
        return;
    }

    isSearchMode = true;
    try {
        moviesDiv.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 40px;">Searching for "${escapeHTML(query)}"...</p>`;

        const response = await fetch(`${API}/movies/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!response.ok) {
            moviesDiv.innerHTML = `<p style="color: #ef4444; text-align: center;">${data.message}</p>`;
            return;
        }

        moviesDiv.innerHTML = "";

        if (!data.results || data.results.length === 0) {
            moviesDiv.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 16px; padding: 40px;">No movies found matching "${escapeHTML(query)}".</p>`;
            renderPagination();
            return;
        }

        data.results.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");

            const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : "https://via.placeholder.com/300x450?text=No+Image";

            const rating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : "N/A";
            const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";

            movieCard.innerHTML = `
                <img src="${poster}" alt="${escapeHTML(movie.title)}" loading="lazy">
                <h3>${escapeHTML(movie.title)}</h3>
                <p style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <span style="color: var(--star-gold); font-weight: 700;">⭐ ${rating} / 5</span>
                    <span style="background: var(--input-bg); padding: 4px 10px; border-radius: 12px; font-size: 12px;">📅 ${year}</span>
                </p>
            `;

            movieCard.addEventListener("click", () => {
                window.location.href = `movie.html?id=${movie.id}`;
            });

            moviesDiv.appendChild(movieCard);
        });

        renderPagination();

    } catch (error) {
        moviesDiv.innerHTML = `<p style="color: #ef4444; text-align: center;">❌ ${error.message}</p>`;
    }
}

// Navigation helpers
function previousPage() {
    if (currentPage > 1) {
        loadMovies(currentPage - 1);
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        loadMovies(currentPage + 1);
    }
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        loadMovies(page);
    }
}

function goToLastPage() {
    loadMovies(totalPages);
}

// Utility HTML escaper
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

// Bind search input Enter key
const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            searchMovie();
        }
    });
}

// Navbar Scroll behavior
let lastScrollTop = 0;
const navbar = document.querySelector(".navbar");
if (navbar) {
    window.addEventListener("scroll", () => {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll <= 120) {
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
}

// Initialize Home Page
loadMovies(1);