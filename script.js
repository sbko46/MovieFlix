const API_KEY = "";
const BASE_URL = "";
const IMG_URL = "";

const movieSection = document.getElementById("movie-section");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalRuntime = document.getElementById("modal-runtime");
const trailerContainer = document.getElementById("trailer-container");
const closeModal = document.getElementById("closeModal");
const searchInput = document.getElementById("searchInput");

// Load popular movies initially
fetchPopularMovies();

//  Banner Slider Logic
const bannerSlider = document.getElementById("bannerSlides");
const slides = bannerSlider.querySelectorAll(".slide");
let index = 0;

// Clone first slide to make loop smooth
const firstClone = slides[0].cloneNode(true);
bannerSlider.appendChild(firstClone);
const totalSlides = slides.length + 1;

function nextSlide() {
  index++;
  bannerSlider.style.transition = "transform 1s ease-in-out";
  bannerSlider.style.transform = `translateX(-${index * 100}%)`;

  if (index === totalSlides - 1) {
    setTimeout(() => {
      bannerSlider.style.transition = "none";
      bannerSlider.style.transform = `translateX(0%)`;
      index = 0;
    }, 1000);
  }
}
setInterval(nextSlide, 3000); // Change every 3 seconds

//  Fetch Popular Movies
async function fetchPopularMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
  const data = await res.json();
  displayMovies(data.results);
}

//  Fetch Popular TV Shows
async function fetchTVShows() {
  const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=1`);
  const data = await res.json();
  displayTV(data.results);
}

//  Fetch by Genre
async function fetchByGenre(genreId) {
  const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`);
  const data = await res.json();
  displayMovies(data.results);
}

//  Search Movies
searchInput.addEventListener("keyup", async (e) => {
  const query = e.target.value.trim();
  if (query.length > 2) {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
    const data = await res.json();
    displayMovies(data.results);
  } else {
    fetchPopularMovies();
  }
});

//  Display Movies
function displayMovies(movies) {
  movieSection.innerHTML = "";
  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}" />
      <h3>${movie.title}</h3>
    `;

    card.addEventListener("click", () => {
      openTrailerModal(movie.id, movie.title, "movie");
    });

    movieSection.appendChild(card);
  });
}

//  Display TV Shows
function displayTV(shows) {
  movieSection.innerHTML = "";
  shows.forEach((tv) => {
    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <img src="${IMG_URL + tv.poster_path}" alt="${tv.name}" />
      <h3>${tv.name}</h3>
    `;

    card.addEventListener("click", () => {
      openTrailerModal(tv.id, tv.name, "tv");
    });

    movieSection.appendChild(card);
  });
}

//  Trailer Modal Logic
async function openTrailerModal(id, title, type) {
  try {
    const detailsRes = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US`);
    const detailsData = await detailsRes.json();

    const videoRes = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`);
    const videoData = await videoRes.json();
    const trailer = videoData.results.find(v => v.type === "Trailer" && v.site === "YouTube");

    if (trailer) {
      const youtubeLink = `https://www.youtube.com/embed/${trailer.key}`;
      trailerContainer.innerHTML = `<iframe src="${youtubeLink}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      trailerContainer.innerHTML = `<p>No trailer available.</p>`;
    }

    modalTitle.textContent = title;
    modalRuntime.textContent =
      type === "movie"
        ? `Duration: ${detailsData.runtime} mins`
        : `Seasons: ${detailsData.number_of_seasons}`;
    modal.style.display = "flex";

  } catch (err) {
    console.error("Error loading trailer:", err);
    trailerContainer.innerHTML = `<p>Error loading trailer.</p>`;
  }
}

//  Close Modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  trailerContainer.innerHTML = "";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    trailerContainer.innerHTML = "";
  }
});
