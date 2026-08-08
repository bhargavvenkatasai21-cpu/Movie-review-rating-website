requireLogin();

const token = getToken();
const currentUser = getCurrentUser();

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const avatarBadge = document.getElementById("avatarBadge");
const reviewsCountEl = document.getElementById("reviewsCount");
const favoritesCountEl = document.getElementById("favoritesCount");

const myReviewsDiv = document.getElementById("myReviews");
const myFavoritesDiv = document.getElementById("myFavorites");

// Modals
const profileEditModal = document.getElementById("profileEditModal");
const profileEditRatingInput = document.getElementById("profileEditRatingInput");
const profileEditReviewText = document.getElementById("profileEditReviewText");
const profileEditRatingText = document.getElementById("profileEditRatingText");
const profileModalStars = document.querySelectorAll("#profileEditStarRating .profile-modal-star");

const profileDeleteModal = document.getElementById("profileDeleteModal");
const confirmProfileDeleteBtn = document.getElementById("confirmProfileDeleteBtn");

const profileRemoveFavoriteModal = document.getElementById("profileRemoveFavoriteModal");
const confirmProfileRemoveFavBtn = document.getElementById("confirmProfileRemoveFavBtn");

let editingReviewId = null;
let deletingReviewId = null;
let removingFavoriteMovieId = null;

const ratingNames = {
    1: "😞 Poor",
    2: "🙂 Fair",
    3: "😊 Good",
    4: "😃 Very Good",
    5: "🤩 Excellent"
};

// Render User Profile Header
if (currentUser) {
    if (userName) userName.textContent = currentUser.name || "User Profile";
    if (userEmail) userEmail.textContent = currentUser.email || "";
    if (avatarBadge && currentUser.name) {
        avatarBadge.textContent = currentUser.name.charAt(0).toUpperCase();
    }
}

// Load My Reviews
async function loadMyReviews() {
    try {
        const response = await fetch(`${API}/reviews/myreviews`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const reviews = await response.json();

        if (!response.ok) {
            showToast(reviews.message || "Failed to load reviews", "#ef4444");
            return;
        }

        if (reviewsCountEl) reviewsCountEl.textContent = reviews.length;
        myReviewsDiv.innerHTML = "";

        if (reviews.length === 0) {
            myReviewsDiv.innerHTML = "<p style='color: var(--text-muted); padding: 10px;'>You haven't reviewed any movies yet.</p>";
            return;
        }

        for (const review of reviews) {
            let movie = { title: "Movie Details", poster_path: null };
            try {
                const movieRes = await fetch(`${API}/movies/${review.movieId}`);
                if (movieRes.ok) movie = await movieRes.json();
            } catch (e) {
                console.error("Movie detail fetch error:", e);
            }

            const card = document.createElement("div");
            card.classList.add("review-card");

            const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : "https://via.placeholder.com/200x300?text=No+Image";

            const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
            const reviewDate = new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });

            const escapedReview = encodeURIComponent(JSON.stringify(review.review));

            card.innerHTML = `
                <div class="profile-review">
                    <img src="${poster}" class="profile-poster" alt="${escapeHTML(movie.title)}" loading="lazy">
                    <div class="profile-review-info">
                        <h3>🎬 ${escapeHTML(movie.title)}</h3>
                        <p class="review-stars">${stars}</p>
                        <p class="review-text">${escapeHTML(review.review)}</p>
                        <small class="review-date">🕒 ${reviewDate}</small>

                        <div class="review-actions">
                            <button type="button" class="btn-edit" onclick="openProfileEditModal('${review._id}', ${review.rating}, '${escapedReview}')">
                                ✏ Edit Review
                            </button>
                            <button type="button" class="btn-delete" onclick="openProfileDeleteModal('${review._id}')">
                                🗑 Delete Review
                            </button>
                        </div>
                    </div>
                </div>
            `;

            myReviewsDiv.appendChild(card);
        }

    } catch (error) {
        showToast(error.message, "#ef4444");
    }
}

// Load Favorites
async function loadFavorites() {
    try {
        const response = await fetch(`${API}/favorites`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const favorites = await response.json();

        if (!response.ok) {
            showToast(favorites.message || "Failed to load favorites", "#ef4444");
            return;
        }

        if (favoritesCountEl) favoritesCountEl.textContent = favorites.length;
        myFavoritesDiv.innerHTML = "";

        if (favorites.length === 0) {
            myFavoritesDiv.innerHTML = "<p style='color: var(--text-muted); padding: 10px;'>No favorite movies added yet.</p>";
            return;
        }

        favorites.forEach(movie => {
            const card = document.createElement("div");
            card.classList.add("review-card");

            const poster = movie.poster
                ? `https://image.tmdb.org/t/p/w300${movie.poster}`
                : "https://via.placeholder.com/200x300?text=No+Image";

            const rating = movie.rating ? (movie.rating / 2).toFixed(1) : "N/A";

            card.innerHTML = `
                <div class="profile-review">
                    <img src="${poster}" class="profile-poster" alt="${escapeHTML(movie.title)}" loading="lazy">
                    <div class="profile-review-info">
                        <h3>🎬 ${escapeHTML(movie.title)}</h3>
                        <p style="color: var(--star-gold); font-weight: 700; margin: 8px 0;">⭐ ${rating} / 5</p>

                        <div class="review-actions">
                            <button type="button" class="view-btn" onclick="window.location.href='movie.html?id=${movie.movieId}'">
                                🎬 View Details
                            </button>
                            <button type="button" class="btn-delete" onclick="openProfileRemoveFavModal('${movie.movieId}')">
                                🤍 Remove
                            </button>
                        </div>
                    </div>
                </div>
            `;

            myFavoritesDiv.appendChild(card);
        });

    } catch (error) {
        showToast(error.message, "#ef4444");
    }
}

// ----------------------------------------------------
// EDIT REVIEW MODAL LOGIC FOR PROFILE PAGE
// ----------------------------------------------------
function openProfileEditModal(reviewId, currentRating, encodedReviewStr) {
    editingReviewId = reviewId;
    let reviewText = "";
    try {
        reviewText = JSON.parse(decodeURIComponent(encodedReviewStr));
    } catch (e) {
        reviewText = encodedReviewStr;
    }

    profileEditRatingInput.value = currentRating;
    profileEditReviewText.value = reviewText;
    updateProfileModalStars(currentRating);

    if (profileEditModal && typeof profileEditModal.showModal === 'function') {
        profileEditModal.showModal();
    } else if (profileEditModal) {
        profileEditModal.setAttribute('open', 'true');
    }
}

function closeProfileEditModal() {
    if (profileEditModal && typeof profileEditModal.close === 'function') {
        profileEditModal.close();
    } else if (profileEditModal) {
        profileEditModal.removeAttribute('open');
    }
    editingReviewId = null;
}

function updateProfileModalStars(val) {
    profileModalStars.forEach(star => {
        star.classList.toggle("active", Number(star.dataset.value) <= val);
    });
    if (profileEditRatingText) {
        profileEditRatingText.textContent = val ? ratingNames[val] : "Select rating";
    }
}

profileModalStars.forEach(star => {
    star.addEventListener("mouseover", () => {
        updateProfileModalStars(Number(star.dataset.value));
    });
    star.addEventListener("click", () => {
        const val = Number(star.dataset.value);
        profileEditRatingInput.value = val;
        updateProfileModalStars(val);
    });
});

const profileStarContainer = document.getElementById("profileEditStarRating");
if (profileStarContainer) {
    profileStarContainer.addEventListener("mouseleave", () => {
        updateProfileModalStars(Number(profileEditRatingInput.value));
    });
}

async function saveProfileEditedReview() {
    if (!editingReviewId) return;

    const newRating = Number(profileEditRatingInput.value);
    const newReviewText = profileEditReviewText.value.trim();

    if (newRating < 1 || newRating > 5) {
        showToast("Please select a rating between 1 and 5.", "#ef4444");
        return;
    }
    if (!newReviewText) {
        showToast("Review text cannot be empty.", "#ef4444");
        return;
    }

    const saveBtn = document.getElementById("saveProfileEditBtn");
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
        closeProfileEditModal();
        await loadMyReviews();

    } catch (error) {
        showToast(error.message, "#ef4444");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
    }
}

// ----------------------------------------------------
// DELETE REVIEW MODAL LOGIC FOR PROFILE PAGE
// ----------------------------------------------------
function openProfileDeleteModal(reviewId) {
    deletingReviewId = reviewId;
    if (profileDeleteModal && typeof profileDeleteModal.showModal === 'function') {
        profileDeleteModal.showModal();
    } else if (profileDeleteModal) {
        profileDeleteModal.setAttribute('open', 'true');
    }
}

function closeProfileDeleteModal() {
    if (profileDeleteModal && typeof profileDeleteModal.close === 'function') {
        profileDeleteModal.close();
    } else if (profileDeleteModal) {
        profileDeleteModal.removeAttribute('open');
    }
    deletingReviewId = null;
}

if (confirmProfileDeleteBtn) {
    confirmProfileDeleteBtn.onclick = async function () {
        if (!deletingReviewId) return;

        confirmProfileDeleteBtn.disabled = true;
        confirmProfileDeleteBtn.textContent = "Deleting...";

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
            closeProfileDeleteModal();
            await loadMyReviews();

        } catch (error) {
            showToast(error.message, "#ef4444");
        } finally {
            confirmProfileDeleteBtn.disabled = false;
            confirmProfileDeleteBtn.textContent = "Delete Review";
        }
    };
}

// ----------------------------------------------------
// REMOVE FAVORITE MODAL LOGIC
// ----------------------------------------------------
function openProfileRemoveFavModal(movieId) {
    removingFavoriteMovieId = movieId;
    if (profileRemoveFavoriteModal && typeof profileRemoveFavoriteModal.showModal === 'function') {
        profileRemoveFavoriteModal.showModal();
    } else if (profileRemoveFavoriteModal) {
        profileRemoveFavoriteModal.setAttribute('open', 'true');
    }
}

function closeProfileRemoveFavModal() {
    if (profileRemoveFavoriteModal && typeof profileRemoveFavoriteModal.close === 'function') {
        profileRemoveFavoriteModal.close();
    } else if (profileRemoveFavoriteModal) {
        profileRemoveFavoriteModal.removeAttribute('open');
    }
    removingFavoriteMovieId = null;
}

if (confirmProfileRemoveFavBtn) {
    confirmProfileRemoveFavBtn.onclick = async function () {
        if (!removingFavoriteMovieId) return;

        confirmProfileRemoveFavBtn.disabled = true;
        confirmProfileRemoveFavBtn.textContent = "Removing...";

        try {
            const response = await fetch(`${API}/favorites/${removingFavoriteMovieId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json().catch(() => ({ message: "Something went wrong." }));
            if (!response.ok) {
                showToast(data.message, "#ef4444");
                return;
            }

            showToast("Removed from Favorites!");
            closeProfileRemoveFavModal();
            await loadFavorites();

        } catch (error) {
            showToast(error.message, "#ef4444");
        } finally {
            confirmProfileRemoveFavBtn.disabled = false;
            confirmProfileRemoveFavBtn.textContent = "Remove Favorite";
        }
    };
}

// Light dismiss / backdrop click for Profile modals
[profileEditModal, profileDeleteModal, profileRemoveFavoriteModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
        const rect = modal.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.bottom && rect.left <= e.clientX && e.clientX <= rect.right);
        if (!isInDialog) {
            if (modal === profileEditModal) closeProfileEditModal();
            if (modal === profileDeleteModal) closeProfileDeleteModal();
            if (modal === profileRemoveFavoriteModal) closeProfileRemoveFavModal();
        }
    });
});

// HTML escaper
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

// Initialize Profile Page
loadMyReviews();
loadFavorites();