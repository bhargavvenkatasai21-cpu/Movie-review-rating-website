requireLogin();

const token = getToken();
const currentUser = getCurrentUser();

const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");

const movieDetails = document.getElementById("movieDetails");
const reviewsDiv = document.getElementById("reviews");
const favoriteBtn = document.getElementById("favoriteBtn");

// Modal elements
const editReviewModal = document.getElementById("editReviewModal");
const editModalRatingInput = document.getElementById("editModalRating");
const editModalReviewText = document.getElementById("editModalReviewText");
const editModalRatingText = document.getElementById("editModalRatingText");
const editModalStars = document.querySelectorAll("#editModalStarRating .modal-star");

const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

let currentMovie = null;
let isFavorite = false;
let editingReviewId = null;
let deletingReviewId = null;

if (!movieId && movieDetails) {
    movieDetails.innerHTML = "<h2>Movie not found.</h2>";
}

// Rating Labels Map
const ratingNames = {
    1: "😞 Poor",
    2: "🙂 Fair",
    3: "😊 Good",
    4: "😃 Very Good",
    5: "🤩 Excellent"
};

// Load Movie Details
async function loadMovieDetails() {
    try {
        const response = await fetch(`${API}/movies/${movieId}`);
        const movie = await response.json();
        currentMovie = movie;

        if (!response.ok) {
            movieDetails.innerHTML = `
                <h2>Error</h2>
                <p>${movie.message || "Failed to load movie details"}</p>
            `;
            return;
        }

        const poster = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://via.placeholder.com/500x750?text=No+Image+Available";

        const hours = Math.floor(movie.runtime / 60);
        const minutes = movie.runtime % 60;
        const runtime = hours === 0
            ? `${minutes}m`
            : minutes === 0
                ? `${hours}h`
                : `${hours}h ${minutes}m`;

        const languages = movie.spoken_languages
            ?.map(lang => lang.english_name)
            .join(", ") || "N/A";

        const genres = movie.genres?.map(g => g.name).join(", ") || "N/A";
        const ratingVal = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : "N/A";

        movieDetails.innerHTML = `
            <img src="${poster}" alt="${movie.title}">
            <div class="movie-info">
                <h1>${movie.title}</h1>
                
                <div class="movie-meta-tags">
                    <span class="meta-badge rating-badge">⭐ ${ratingVal} / 5</span>
                    <span class="meta-badge">📅 ${movie.release_date || "Unknown"}</span>
                    <span class="meta-badge">⏱ ${runtime}</span>
                    <span class="meta-badge">🎞 ${movie.status || "Released"}</span>
                </div>

                <div class="movie-meta-tags" style="margin-top: 8px;">
                    <span class="meta-badge">🎭 ${genres}</span>
                    <span class="meta-badge">🌍 ${languages}</span>
                </div>

                ${movie.tagline ? `<p style="font-style: italic; color: #fda4af; margin: 15px 0 10px;">"${movie.tagline}"</p>` : ''}

                <p class="overview">
                    <strong>Overview:</strong><br>
                    ${movie.overview || "No overview available for this movie."}
                </p>
            </div>
        `;

    } catch (error) {
        movieDetails.innerHTML = `
            <h2>Failed to load movie details</h2>
            <p>${error.message}</p>
        `;
    }
}

// Check Favorites
async function checkFavorite() {
    try {
        const response = await fetch(`${API}/favorites/check/${movieId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        isFavorite = data.isFavorite;
        favoriteBtn.innerHTML = isFavorite
            ? "❤️ Remove from Favorites"
            : "🤍 Add to Favorites";
    } catch (error) {
        console.error("Favorite check error:", error);
    }
}

// Load Reviews
async function loadReviews() {
    try {
        const response = await fetch(`${API}/reviews/${movieId}`);
        if (!response.ok) throw new Error("Failed to load reviews");

        const reviews = await response.json();
        reviewsDiv.innerHTML = "";

        if (reviews.length === 0) {
            reviewsDiv.innerHTML = `
                <p style="color: var(--text-muted); font-size: 15px;">No reviews yet. Be the first to share your review!</p>
            `;
            return;
        }

        reviews.forEach(review => {
            const reviewCard = document.createElement("div");
            reviewCard.classList.add("review-card");

            const isOwner = currentUser && review.userId && (review.userId._id === currentUser.id || review.userId === currentUser.id);
            const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

            const reviewDate = new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });

            // Store raw review string safely for modal edit
            const escapedReview = encodeURIComponent(JSON.stringify(review.review));

            reviewCard.innerHTML = `
                <h4>👤 ${review.userId?.name || "Movie Enthusiast"}</h4>
                <p class="review-stars">${stars}</p>
                <p class="review-text">${escapeHTML(review.review)}</p>
                <p class="review-date">🕒 ${reviewDate}</p>

                ${isOwner ? `
                    <div class="review-actions">
                        <button type="button" class="btn-edit" onclick="openEditModal('${review._id}', ${review.rating}, '${escapedReview}')">
                            ✏ Edit
                        </button>
                        <button type="button" class="btn-delete" onclick="promptDeleteModal('${review._id}')">
                            🗑 Delete
                        </button>
                    </div>
                ` : ""}
            `;

            reviewsDiv.appendChild(reviewCard);
        });

    } catch (error) {
        reviewsDiv.innerHTML = `<p style="color: #ef4444;">❌ ${error.message}</p>`;
    }
}

// Add Review
async function addReview() {
    const ratingInput = document.getElementById("rating");
    const rating = Number(ratingInput.value);
    const review = document.getElementById("review").value.trim();

    if (rating < 1 || rating > 5 || !review) {
        showToast("Please select a rating star and enter your review.", "#ef4444");
        return;
    }

    const submitBtn = document.getElementById("submitReviewBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting Review...";

    try {
        const response = await fetch(`${API}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ movieId, rating, review })
        });

        const data = await response.json().catch(() => ({ message: "Something went wrong." }));

        if (!response.ok) {
            showToast(data.message, "#ef4444");
            return;
        }

        showToast("Review submitted successfully!");

        ratingInput.value = "";
        document.getElementById("review").value = "";
        document.querySelectorAll("#addStarRating .star").forEach(s => s.classList.remove("active"));
        document.getElementById("rating-text").textContent = "Select your rating";

        await loadReviews();

    } catch (error) {
        showToast(error.message, "#ef4444");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Review";
    }
}

// Setup Add Review Star Rating
const addStars = document.querySelectorAll("#addStarRating .star");
const addRatingInput = document.getElementById("rating");
const addRatingText = document.getElementById("rating-text");
const addStarContainer = document.getElementById("addStarRating");

if (addStars.length && addRatingInput && addRatingText) {
    addStars.forEach(star => {
        star.addEventListener("mouseover", () => {
            const val = Number(star.dataset.value);
            addStars.forEach(s => s.classList.toggle("active", Number(s.dataset.value) <= val));
            addRatingText.textContent = ratingNames[val];
        });

        star.addEventListener("click", () => {
            const val = Number(star.dataset.value);
            addRatingInput.value = val;
            addStars.forEach(s => s.classList.toggle("active", Number(s.dataset.value) <= val));
            addRatingText.textContent = ratingNames[val];
        });
    });

    if (addStarContainer) {
        addStarContainer.addEventListener("mouseleave", () => {
            const val = Number(addRatingInput.value);
            addStars.forEach(star => star.classList.toggle("active", Number(star.dataset.value) <= val));
            addRatingText.textContent = val ? ratingNames[val] : "Select your rating";
        });
    }
}

// ----------------------------------------------------
// CUSTOM EDIT REVIEW MODAL LOGIC (Replaces Alert/Prompt)
// ----------------------------------------------------
function openEditModal(reviewId, currentRating, encodedReviewStr) {
    editingReviewId = reviewId;
    let reviewText = "";
    try {
        reviewText = JSON.parse(decodeURIComponent(encodedReviewStr));
    } catch (e) {
        reviewText = encodedReviewStr;
    }

    editModalRatingInput.value = currentRating;
    editModalReviewText.value = reviewText;
    updateModalStars(currentRating);

    if (editReviewModal && typeof editReviewModal.showModal === 'function') {
        editReviewModal.showModal();
    } else if (editReviewModal) {
        editReviewModal.setAttribute('open', 'true');
    }
}

function closeEditModal() {
    if (editReviewModal && typeof editReviewModal.close === 'function') {
        editReviewModal.close();
    } else if (editReviewModal) {
        editReviewModal.removeAttribute('open');
    }
    editingReviewId = null;
}

function updateModalStars(val) {
    editModalStars.forEach(star => {
        star.classList.toggle("active", Number(star.dataset.value) <= val);
    });
    editModalRatingText.textContent = val ? ratingNames[val] : "Select rating";
}

// Interactive modal stars
editModalStars.forEach(star => {
    star.addEventListener("mouseover", () => {
        const val = Number(star.dataset.value);
        updateModalStars(val);
    });

    star.addEventListener("click", () => {
        const val = Number(star.dataset.value);
        editModalRatingInput.value = val;
        updateModalStars(val);
    });
});

const modalStarContainer = document.getElementById("editModalStarRating");
if (modalStarContainer) {
    modalStarContainer.addEventListener("mouseleave", () => {
        const val = Number(editModalRatingInput.value);
        updateModalStars(val);
    });
}

// Save Edited Review
async function saveEditedReview() {
    if (!editingReviewId) return;

    const newRating = Number(editModalRatingInput.value);
    const newReviewText = editModalReviewText.value.trim();

    if (newRating < 1 || newRating > 5) {
        showToast("Please select a rating between 1 and 5.", "#ef4444");
        return;
    }

    if (!newReviewText) {
        showToast("Review text cannot be empty.", "#ef4444");
        return;
    }

    const saveBtn = document.getElementById("saveEditReviewBtn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
        const response = await fetch(`${API}/reviews/${editingReviewId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ rating: newRating, review: newReviewText })
        });

        const data = await response.json().catch(() => ({ message: "Something went wrong." }));

        if (!response.ok) {
            showToast(data.message, "#ef4444");
            return;
        }

        showToast("Review updated successfully!");
        closeEditModal();
        await loadReviews();

    } catch (error) {
        showToast(error.message, "#ef4444");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
    }
}

// ----------------------------------------------------
// CUSTOM DELETE REVIEW MODAL LOGIC (Replaces Confirm Alert)
// ----------------------------------------------------
function promptDeleteModal(reviewId) {
    deletingReviewId = reviewId;
    if (deleteConfirmModal && typeof deleteConfirmModal.showModal === 'function') {
        deleteConfirmModal.showModal();
    } else if (deleteConfirmModal) {
        deleteConfirmModal.setAttribute('open', 'true');
    }
}

function closeDeleteModal() {
    if (deleteConfirmModal && typeof deleteConfirmModal.close === 'function') {
        deleteConfirmModal.close();
    } else if (deleteConfirmModal) {
        deleteConfirmModal.removeAttribute('open');
    }
    deletingReviewId = null;
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = async function () {
        if (!deletingReviewId) return;

        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = "Deleting...";

        try {
            const response = await fetch(`${API}/reviews/${deletingReviewId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json().catch(() => ({ message: "Something went wrong." }));

            if (!response.ok) {
                showToast(data.message, "#ef4444");
                return;
            }

            showToast("Review deleted successfully!");
            closeDeleteModal();
            await loadReviews();

        } catch (error) {
            showToast(error.message, "#ef4444");
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = "Delete Review";
        }
    };
}

// Light dismiss / backdrop click for modals
[editReviewModal, deleteConfirmModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
        const rect = modal.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.bottom && rect.left <= e.clientX && e.clientX <= rect.right);
        if (!isInDialog) {
            if (modal === editReviewModal) closeEditModal();
            if (modal === deleteConfirmModal) closeDeleteModal();
        }
    });
});

// Favorites Toggle
async function toggleFavorite() {
    if (!currentMovie) return;
    try {
        let response;
        if (!isFavorite) {
            response = await fetch(`${API}/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    movieId: currentMovie.id || movieId,
                    title: currentMovie.title,
                    poster: currentMovie.poster_path,
                    rating: currentMovie.vote_average
                })
            });

            const data = await response.json();
            if (!response.ok) {
                showToast(data.message, "#ef4444");
                return;
            }
            isFavorite = true;
            favoriteBtn.innerHTML = "❤️ Remove from Favorites";
            showToast("Added to Favorites!");
        } else {
            response = await fetch(`${API}/favorites/${currentMovie.id || movieId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) {
                showToast(data.message, "#ef4444");
                return;
            }
            isFavorite = false;
            favoriteBtn.innerHTML = "🤍 Add to Favorites";
            showToast("Removed from Favorites!");
        }
    } catch (error) {
        showToast(error.message, "#ef4444");
    }
}

// Helper to sanitize HTML strings
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Initialize Page
if (movieId) {
    loadMovieDetails();
    loadReviews();
    checkFavorite();
}