const token = localStorage.getItem("token");

if (!token) {
    // alert("Please login first.");
    window.location.href = "login.html";
}

const params = new URLSearchParams(window.location.search);

const movieId = params.get("id");

const movieDetails = document.getElementById("movieDetails");
const reviewsDiv = document.getElementById("reviews");

async function loadMovieDetails() {
  try {
    const response = await fetch(
      `http://localhost:5000/api/movies/${movieId}`
    );

    const movie = await response.json();

    if (!response.ok) {
      movieDetails.innerHTML = `
        <h2>Error</h2>
        <p>${movie.message}</p>
      `;
      return;
    }

    movieDetails.innerHTML = `
      <h1>${movie.title}</h1>

      <img
        src="https://image.tmdb.org/t/p/w300${movie.poster_path}"
        alt="${movie.title}"
      >

      <p>${movie.overview}</p>

      <p>
        <strong>Rating:</strong>
        ⭐ ${(movie.vote_average / 2).toFixed(1)} / 5
      </p>

      <p>
        <strong>Release Date:</strong>
        ${movie.release_date}
      </p>
    `;
  } catch (error) {
    movieDetails.innerHTML = `
      <h2>Failed to load movie details</h2>
      <p>${error.message}</p>
    `;
  }
}

async function loadReviews() {
  try {
    const response = await fetch(
      `http://localhost:5000/api/reviews/${movieId}`
    );

    const reviews = await response.json();

    reviewsDiv.innerHTML = "";

    if (!reviews.length) {
      reviewsDiv.innerHTML = "<p>No reviews yet.</p>";
      return;
    }

    reviews.forEach(review => {
      const reviewCard = document.createElement("div");

      reviewCard.innerHTML = `
        <h4>${review.userId?.name || "Anonymous"}</h4>
        <p>⭐ ${review.rating}</p>
        <p>${review.review}</p>
        <hr>
      `;

      reviewsDiv.appendChild(reviewCard);
    });
  } catch (error) {
    reviewsDiv.innerHTML = `
      <p>Failed to load reviews.</p>
    `;
  }
}

async function addReview() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  const rating = document.getElementById("rating").value;
  const review = document.getElementById("review").value;

  if (!rating || !review) {
    alert("Please enter rating and review");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/reviews",
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

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("Review Added Successfully");

    document.getElementById("rating").value = "";
    document.getElementById("review").value = "";

    loadReviews();

  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  alert("Logged out successfully.");

  window.location.href = "login.html";
}

loadMovieDetails();
loadReviews();