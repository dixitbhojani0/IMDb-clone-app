"use strict";
(function () {
    const mainSection = document.getElementById("main-section");
    const movieCardMainSection = document.getElementById("movie-card-main-section");
    const searchKeyword = document.getElementById("search");
    const searchBar = document.getElementById("search-bar");
    const suggestionsContainer = document.getElementById("card-container");
    const favMoviesContainer = document.getElementById("fav-movies-container");
    const emptyText = document.getElementById("empty-search-text");
    const showFavourites = document.getElementById("favorites-section");
    const emptyFavText = document.getElementById("empty-fav-text");
    const movieCardTitleBar = document.getElementById("movie-card-title-bar");
    const movieCardTitle = document.getElementById("movie-card-title");
    const year = document.getElementById("year");
    const runtime = document.getElementById("runtime");
    const rating = document.getElementById("rating");
    const poster = document.getElementById("poster");
    const plot = document.getElementById("plot");
    const directorsName = document.getElementById("director-names");
    const castName = document.getElementById("cast-names");
    const genre = document.getElementById("genre");
    const movieDetailBackBtn = document.getElementById("movie-detail-back");
    const favMoviesLocal = localStorage.getItem("favMoviesList");

    addToFavDOM();
    let suggestionList = [];
    let favMovieArray = [];

    searchKeyword.addEventListener("keydown", (event) => {
        if (event.key == "Enter") {
            event.preventDefault();
        }
    });

    function showEmptyText() {
        if (favMoviesContainer.innerHTML == "") {
            emptyFavText.style.display = "block";
        } else {
            emptyFavText.style.display = "none";
        }
    }

    // Event listner on search
    searchKeyword.addEventListener("keyup", function () {
        let search = searchKeyword.value;
        if (search === "") {
            emptyText.style.display = "block";
            suggestionsContainer.innerHTML = "";
            // clears the previous movies from array
            suggestionList = [];
        } else {
            emptyText.style.display = "none";
            (async () => {
                let data = await fetchMovies(search);
                addToSuggestionContainerDOM(data);
            })();

            suggestionsContainer.style.display = "grid";
        }
    });

    // Fetches data from api and calls function to add it in
    async function fetchMovies(search) {
        const url = `https://www.omdbapi.com/?t=${search}&apikey=e7923858`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (err) {
            console.log(err);
        }
    }

    // Fetch selected movie data
    async function fetchSelectedMovie(search) {
        const url = `https://www.omdbapi.com/?t=${search}&type=movie&apikey=e7923858`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            year.innerHTML = data.Year;
            runtime.innerHTML = data.Runtime;
            rating.innerHTML = `${data.imdbRating}/10`;
            poster.setAttribute("src", `${data.Poster}`);
            plot.innerHTML = data.Plot;
            directorsName.innerHTML = data.Director;
            castName.innerHTML = data.Actors;
            genre.innerHTML = data.Genre;
        } catch (err) {
            console.log(err);
        }
    }

    // Shows in suggestion container DOM
    function addToSuggestionContainerDOM(data) {
        document.getElementById("empty-fav-text").style.display = "none";
        let isPresent = false;

        // to check if the movie is already present in the suggestionList array
        suggestionList.forEach((movie) => {
            if (movie.Title == data.Title) {
                isPresent = true;
            }
        });

        if (!isPresent && data.Title != undefined) {
            if (data.Poster == "N/A") {
                data.Poster = "./images/not-found.png";
            }
            suggestionList.push(data);
            addMovieCard(data);
        }
    }

    // Check movie exist in wishlist
    function isMovieExistInWishlist(data) {
        let favMoviesLocal = localStorage.getItem("favMoviesList");
        if (favMoviesLocal) {
            favMovieArray = Array.from(JSON.parse(favMoviesLocal));
            return favMovieArray.some((movie) => data.Title == movie.Title);
        }
        return false;
    }

    // Add to favoutite list
    function addMovieToWishlist(data) {
        const favMoviesLocal = localStorage.getItem("favMoviesList");
        if (favMoviesLocal) {
            favMovieArray = Array.from(JSON.parse(favMoviesLocal));
        } else {
            localStorage.setItem("favMoviesList", JSON.stringify(data));
        }
        favMovieArray.push(data);
        localStorage.setItem("favMoviesList", JSON.stringify(favMovieArray));
    }

    // Delete from favourite list
    function deleteMovieFromWishlist(name) {
        let favList = JSON.parse(localStorage.getItem("favMoviesList"));
        let updatedList = Array.from(favList).filter((movie) => {
            return movie.Title != name;
        });

        localStorage.setItem("favMoviesList", JSON.stringify(updatedList));
    }

    // Load Movie detail card
    function loadMovieDetail(data) {
        searchBar.style.display = "none";
        movieCardTitleBar.style.display = "block";
        movieCardTitle.textContent = data.Title;
        mainSection.style.display = "none";
        movieCardMainSection.style.display = "block";
        movieDetailBackBtn.style.display = "block";
        fetchSelectedMovie(data.Title);
    }

    // Load movie list
    function loadMovieList() {
        searchBar.style.display = "block";
        movieCardTitleBar.style.display = "none";
        movieCardTitle.textContent = "";
        mainSection.style.display = "block";
        movieCardMainSection.style.display = "none";
        movieDetailBackBtn.style.display = "none";
    }

    // Add movie card in list
    function addMovieCard(data) {
        const movieCard = document.createElement("div");
        movieCard.setAttribute("class", "text-decoration");

        movieCard.innerHTML = `
            <div class="card my-2" data-id = "card-${data.Title}">
                <img src="${data.Poster} " class="card-img-top" alt="${data.Title}" data-id = "${data.Title} "/>
                <div class="card-body text-start">
                    <h5 class="card-title" >
                        ${data.Title}
                    </h5>

                    <p class="card-text">
                        <i class="fa-solid fa-star">
                            <span id="rating">&nbsp;${data.imdbRating}</span>
                        </i>

                        <button class="fav-btn">
                            <i class="fa-solid fa-heart add-fav ${isMovieExistInWishlist(data) ? 'filled' : ''}" id="fav-${data.Title}" data-id="${data.Title}"></i>
                        </button>
                    </p>
                </div>
            </div>
        `;
        movieCard.addEventListener('click', function(e) {
            e.preventDefault();
            loadMovieDetail(data);
        });
        suggestionsContainer.prepend(movieCard);

        const addToWishlistIcon = document.getElementById("fav-"+data.Title);
        addToWishlistIcon.addEventListener('click', function(e) {
            e.preventDefault();
            handleFavBtn(e);
            e.stopPropagation();
        });
    }

    // Add to favourite of localStorage
    async function handleFavBtn(e) {
        const target = e.target;
        let data = await fetchMovies(target.dataset.id);
        const movieCardFavIcon = document.getElementById("fav-" + data.Title);

        if (!isMovieExistInWishlist(data)) { // to check if movie is already present in the fav list or not
            addMovieToWishlist(data);
        } else {
            deleteMovieFromWishlist(target.dataset.id);
        }
        movieCardFavIcon?.classList?.toggle('filled');
        addToFavDOM();
    }

    // Add to favourite list DOM
    function addToFavDOM() {
        favMoviesContainer.innerHTML = "";

        let favList = JSON.parse(localStorage.getItem("favMoviesList"));
        if (favList) {
            favList.forEach((movie) => {
                const div = document.createElement("div");
                div.classList.add("fav-movie-card", "d-flex", "justify-content-between", "align-content-center", "my-3");
                div.innerHTML = `
                    <img src="${movie.Poster}" alt="fav-movie-poster-${movie.Title}" class="fav-movie-poster" />
                    <div class="movie-card-details">
                        <p class="movie-name mt-3 mb-0">
                            ${movie.Title}
                        </p>
                        <small class="text-muted">${movie.Year}</small>
                    </div>

                    <div class="delete-btn my-4">
                        <i class="fa-solid fa-trash-can" id="delete-${movie.Title}" data-id="${movie.Title}"></i>
                    </div>
                `;

                div.addEventListener('click', function(e) {
                    e.preventDefault();
                    loadMovieDetail(movie);
                });

                favMoviesContainer.prepend(div);

                const deleteFromWishlistIcon = document.getElementById("delete-"+movie.Title);
                deleteFromWishlistIcon.addEventListener('click', function(e) {
                    e.preventDefault();
                    handleFavBtn(e);
                    e.stopPropagation();
                });
            });
        }
        showEmptyText();
    }

    // Handles click events
    async function handleClickListner(e) {
        const target = e.target;
        if (target.classList.contains("fa-bars")) {
            if (showFavourites.style.display == "flex") {
                document.getElementById("show-favourites").style.color = "#8b9595";
                showFavourites.style.display = "none";
            } else {
                showFavourites.classList.add("animate__backInRight");
                document.getElementById("show-favourites").style.color = "var(--logo-color)";
                showFavourites.style.display = "flex";
            }
        } else if(target.classList.contains("IMDb-logo")) {
            loadMovieList();
        }
    }

    // Event listner on whole document
    document.addEventListener("click", handleClickListner);
    movieDetailBackBtn.addEventListener("click", loadMovieList);
})();
