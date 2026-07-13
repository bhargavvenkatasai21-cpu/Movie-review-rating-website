requireLogin();

const token = getToken();
const currentUser = getCurrentUser();

const profileCard = document.getElementById("profileCard");
const myReviewsDiv = document.getElementById("myReviews");
const myFavoritesDiv = document.getElementById("myFavorites");

// Profile

profileCard.innerHTML = `
    <h2>${currentUser.name}</h2>
    <p>${currentUser.email}</p>
`;

// Load My Reviews

async function loadMyReviews() {

    try {

        const response = await fetch(
            `${API}/reviews/myreviews`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const reviews = await response.json();

        if (!response.ok) {
            showToast(reviews.message, "#ef4444");
            return;
        }

        myReviewsDiv.innerHTML = "";

        if (reviews.length === 0) {

            myReviewsDiv.innerHTML =
                "<p>You haven't reviewed any movies yet.</p>";

            return;

        }

        for (const review of reviews) {

            const movieResponse = await fetch(
                `${API}/movies/${review.movieId}`
            );

            const movie = await movieResponse.json();

            const card = document.createElement("div");

            card.classList.add("review-card");

            const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : "https://via.placeholder.com/200x300?text=No+Image";

            const stars = "⭐".repeat(review.rating);

            const reviewDate = new Date(review.createdAt)
                .toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                });

            card.innerHTML = `
                <div class="profile-review">

                    <img
                        src="${poster}"
                        class="profile-poster"
                    >

                    <div class="profile-review-info">

                        <h3>🎬 ${movie.title}</h3>

                        <p>${stars}</p>

                        <p>${review.review}</p>

                        <small>📅 ${reviewDate}</small>

                        <div class="review-actions">

                            <button
                                onclick='editReview(
                                    "${review._id}",
                                    ${review.rating},
                                    ${JSON.stringify(review.review)}
                                )'>
                                ✏ Edit
                            </button>

                            <button
                                onclick="deleteReview('${review._id}')">
                                🗑 Delete
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

        const response = await fetch(
            `${API}/favorites`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const favorites = await response.json();

        if (!response.ok) {
            showToast(favorites.message, "#ef4444");
            return;
        }

        myFavoritesDiv.innerHTML = "";

        if (favorites.length === 0) {

            myFavoritesDiv.innerHTML =
                "<p>No favorite movies yet.</p>";

            return;

        }

        favorites.forEach(movie => {

            const card = document.createElement("div");

            card.classList.add("review-card");

            const poster = movie.poster
                ? `https://image.tmdb.org/t/p/w300${movie.poster}`
                : "https://via.placeholder.com/200x300?text=No+Image";

            card.innerHTML = `
                <div class="profile-review">

                    <img
                        src="${poster}"
                        class="profile-poster"
                    >

                    <div class="profile-review-info">

                        <h3>🎬 ${movie.title}</h3>

                        <p>⭐ ${(movie.rating / 2).toFixed(1)} / 5</p>

                        <div class="favorite-actions">

                            <button
                                class="view-btn"
                                onclick="window.location.href='movie.html?id=${movie.movieId}'">
                                🎬 View Movie
                            </button>

                            <button
                                class="remove-btn"
                                onclick="removeFavorite(${movie.movieId})">
                                🗑 Remove
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

// Remove Favorite

async function removeFavorite(movieId) {

    const confirmRemove = confirm(
        "Remove this movie from favorites?"
    );

    if (!confirmRemove) return;

    try {

        const response = await fetch(
            `${API}/favorites/${movieId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            showToast(data.message, "#ef4444");

            return;

        }

        showToast("Removed from Favorites!");

        loadFavorites();

    } catch (error) {

        showToast(error.message, "#ef4444");

    }

}

// Delete Review

async function deleteReview(reviewId) {

    if (!confirm("Delete this review?")) return;

    try {

        const response = await fetch(
            `${API}/reviews/${reviewId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message, "#ef4444");
            return;
        }

        showToast("Review deleted!");

        loadMyReviews();

    } catch (error) {

        showToast(error.message, "#ef4444");

    }

}

// Edit Review

async function editReview(reviewId, currentRating, currentReview) {

    const newRating = prompt(
        "Enter rating (1-5)",
        currentRating
    );

    if (newRating === null) return;

    const newReview = prompt(
        "Edit Review",
        currentReview
    );

    if (newReview === null) return;

    try {

        const response = await fetch(
            `${API}/reviews/${reviewId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: newRating,
                    review: newReview
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message, "#ef4444");
            return;
        }

        showToast("Review updated!");

        loadMyReviews();

    } catch (error) {

        showToast(error.message, "#ef4444");

    }

}

// Load Page

loadMyReviews();
loadFavorites();