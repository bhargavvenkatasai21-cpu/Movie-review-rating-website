const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const currentUser = JSON.parse(localStorage.getItem("user"));

const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");

const movieDetails = document.getElementById("movieDetails");
const reviewsDiv = document.getElementById("reviews");

if (!movieId) {
    movieDetails.innerHTML = "<h2>Movie not found.</h2>";
    // throw new Error("Movie ID is missing."); it will stop the execution 
}

// Load Movie Details
async function loadMovieDetails() {
    try {
        const response = await fetch(
            `https://movie-review-rating-website.onrender.com/api/movies/${movieId}`
        );

        const movie = await response.json();

        if (!response.ok) {
            movieDetails.innerHTML = `
                <h2>Error</h2>
                <p>${movie.message}</p>
            `;
            return;
        }

        const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";          //image

    const hours = Math.floor(movie.runtime / 60);
    const minutes = movie.runtime % 60;                     //runtime

    const runtime =
    hours === 0
        ? `${minutes}m`
            : minutes === 0
            ? `${hours}h`
            : `${hours}h ${minutes}m`;

    const languages =
    movie.spoken_languages
        ?.map(lang => lang.english_name)
        .join(", ") || "N/A";

        movieDetails.innerHTML = `
            <img src="${poster}" alt="${movie.title}">

            <div class="movie-info">

                <h1>${movie.title}</h1>

                <p><strong>⭐ Rating:</strong> ${(movie.vote_average / 2).toFixed(1)} / 5</p>

                <p><strong>📅 Release Date:</strong> ${movie.release_date || "Unknown"}</p>

                <p><strong>🎭 Genres:</strong> ${movie.genres?.map(g => g.name).join(", ") || "N/A"}</p>

                <p><strong>⏱ Runtime:</strong> ${runtime}</p> 

                <p><strong>🌍 Languages:</strong> ${languages}</p>

                <p><strong>🎞 Status:</strong> ${movie.status || "Unknown"}</p>

                <p><strong>🎬 Tagline:</strong> ${movie.tagline || "N/A"}</p>

                <p><strong>Overview:</strong><br>
                ${movie.overview}</p>

            </div>
        `;

    } catch (error) {

        movieDetails.innerHTML = `
            <h2>Failed to load movie details</h2>
            <p>${error.message}</p>
        `;

    }
}

// Load Reviews
async function loadReviews() {
    try {

        const response = await fetch(
            `https://movie-review-rating-website.onrender.com/api/reviews/${movieId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load reviews");
        }

        const reviews = await response.json();

        reviewsDiv.innerHTML = "";

        if (reviews.length === 0) {
            reviewsDiv.innerHTML = `
                <p>No reviews yet. Be the first to review this movie!</p>
            `;
            return;
        }

        reviews.forEach(review => {

            const reviewCard = document.createElement("div");
            reviewCard.classList.add("review-card");

            const isOwner =
                currentUser &&
                review.userId &&
                review.userId._id === currentUser.id;

            const stars = "⭐".repeat(review.rating);

            const reviewDate = new Date(review.createdAt).toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

            reviewCard.innerHTML = `
                <h4>👤 ${review.userId?.name || "Anonymous"}</h4>

                <p class="review-stars">${stars}</p>

                <p class="review-text">${review.review}</p>

                <p class="review-date">🕒 ${reviewDate}</p>

                ${
                    isOwner
                        ? `
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
                                onclick="deleteReview('${review._id}',this)">
                                🗑 Delete
                            </button>

                        </div>
                        `
                        : ""
                }
            `;

            reviewsDiv.appendChild(reviewCard);

        });

    } catch (error) {

        reviewsDiv.innerHTML = `
            <p>❌ ${error.message}</p>
        `;

    }
}


// Add Review
async function addReview() {

    // const token = localStorage.getItem("token"); 

    if (!token) {
         showToast("Please login first.", "#ef4444");

        return;
    }

    const rating = Number(ratingInput.value);
    const review = document.getElementById("review").value.trim();

    if (rating < 1 || rating > 5|| !review) {
         showToast("Please select a rating and enter your review.", "#ef4444");

        return;
    }

    const submitBtn = document.getElementById("submitReviewBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting Review...";

    try {

        const response = await fetch(
            "https://movie-review-rating-website.onrender.com/api/reviews",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    movieId,
                    rating,
                    review
                })
            }
        );

        const data = await response.json().catch(() => ({
            message: "Something went wrong."
        }));

        if (!response.ok) {
             showToast(data.message, "#ef4444");
            return;
        }
        
        showToast("Review submitted successfully!");


        ratingInput.value = "";
        document.getElementById("review").value = "";

        stars.forEach(star => star.classList.remove("active"));

        ratingText.textContent = "Select your rating";

        await loadReviews();

    } catch (error) {

         showToast(error.message, "#ef4444");

    }
    finally {

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Review";

}
}

// Logout
function logout() {

    // Show success message
    showToast("Logout successful!");

    // Prevent multiple clicks
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.disabled = true;
        logoutBtn.textContent = "Logging out...";
    }

    // Clear user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect after toast is visible
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1800);

}
 
 // Star Rating
 
const stars = document.querySelectorAll(".star");
const ratingInput = document.getElementById("rating");
const ratingText = document.getElementById("rating-text");
const starRating = document.querySelector(".star-rating");

const ratingNames = {
    1: "😞 Poor",
    2: "🙂 Fair",
    3: "😊 Good",
    4: "😃 Very Good",
    5: "🤩 Excellent"
};

// Only initialize if the rating section exists
if (stars.length && ratingInput && ratingText && starRating) {

    stars.forEach(star => {

        // Preview rating on hover
        star.addEventListener("mouseover", () => {

            const value = Number(star.dataset.value);

            stars.forEach(s => {
                s.classList.toggle(
                    "active",
                    Number(s.dataset.value) <= value
                );
            });

            ratingText.textContent = ratingNames[value];

        });

        // Save selected rating
        star.addEventListener("click", () => {

            const value = Number(star.dataset.value);

            ratingInput.value = value;

            stars.forEach(s => {
                s.classList.toggle(
                    "active",
                    Number(s.dataset.value) <= value
                );
            });

            ratingText.textContent = ratingNames[value];

        });

    });

    // Restore selected rating after mouse leaves
    starRating.addEventListener("mouseleave", () => {

        const value = Number(ratingInput.value);

        stars.forEach(star => {
            star.classList.toggle(
                "active",
                Number(star.dataset.value) <= value
            );
        });

        ratingText.textContent = value
            ? ratingNames[value]
            : "Select your rating";

    });

}

 // Delete Review 

async function deleteReview(reviewId, button) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) return;

    // Disable button while deleting
    button.disabled = true;
    button.textContent = "Deleting...";

    try {

        const response = await fetch(
            `https://movie-review-rating-website.onrender.com/api/reviews/${reviewId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json().catch(() => ({
            message: "Something went wrong."
        }));

        if (!response.ok) {
            showToast(data.message, "#ef4444");
            return;
        }

        showToast("Review deleted successfully!");

        await loadReviews();

    } catch (error) {

        showToast(error.message, "#ef4444");

    }  

}

 // Edit Review
 
async function editReview(reviewId, currentRating, currentReview) {

    const newRating = Number(
        prompt("Enter new rating (1-5):", currentRating)
    );

    if (isNaN(newRating)) return;

    if (newRating < 1 || newRating > 5) {
        showToast("Rating must be between 1 and 5.", "#ef4444");
        return;
    }

    const newReview = prompt("Edit your review:", currentReview);

    if (newReview === null) return;

    const reviewText = newReview.trim();

    if (!reviewText) {
        showToast("Review cannot be empty.", "#ef4444");
        return;
    }

    try {

        const response = await fetch(
            `https://movie-review-rating-website.onrender.com/api/reviews/${reviewId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: newRating,
                    review: reviewText
                })
            }
        );

        const data = await response.json().catch(() => ({
            message: "Something went wrong."
        }));

        if (!response.ok) {
            showToast(data.message, "#ef4444");
            return;
        }

        showToast("Review updated successfully!");

        await loadReviews();

    } catch (error) {

        showToast(error.message, "#ef4444");

    }

}

if (movieId) {
    loadMovieDetails();
    loadReviews();
}