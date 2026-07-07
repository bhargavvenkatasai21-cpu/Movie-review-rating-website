const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const currentUser = JSON.parse(localStorage.getItem("user"));

const profileCard = document.getElementById("profileCard");
const myReviewsDiv = document.getElementById("myReviews");

 // Profile
 
profileCard.innerHTML = `
    <h2>${currentUser.name}</h2>
    <p>${currentUser.email}</p>
`;

 // Load My Reviews
 
async function loadMyReviews() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/reviews/myreviews",
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

            myReviewsDiv.innerHTML = `
                <p>You haven't reviewed any movies yet.</p>
            `;

            return;
        }

        for (const review of reviews) {

            // Get Movie Details
            const movieResponse = await fetch(
                `http://localhost:5000/api/movies/${review.movieId}`
            );

            const movie = await movieResponse.json();

            const card = document.createElement("div");
            card.classList.add("review-card");

            const stars = "⭐".repeat(review.rating);

            const reviewDate = new Date(review.createdAt).toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

            const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/200x300?text=No+Image";

            card.innerHTML = `
                <div class="profile-review">

                    <img
                        src="${poster}"
                        alt="${movie.title}"
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

 // Logout
 
function logout() {

    showToast("Logout successful!");

    setTimeout(() => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "login.html";

    }, 1500);

}

 // Toast
 
let toastTimer;

function showToast(message, color = "#22c55e") {

    const toast = document.getElementById("toast");

    if (!toast) return;

    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.style.backgroundColor = color;

    toast.classList.add("show");

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 1800);

}

 // Delete Review
 
async function deleteReview(reviewId) {

    if (!confirm("Delete this review?")) return;

    try {

        const response = await fetch(
            `http://localhost:5000/api/reviews/${reviewId}`,
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
            `http://localhost:5000/api/reviews/${reviewId}`,
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