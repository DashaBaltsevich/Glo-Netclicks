'use strict';
const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = '03be064787403e19c7e3d6ff256dba09';
const SERVER = 'https://api.themoviedb.org/3';


const leftMenu = document.querySelector('.left-menu'),
    hamburger = document.querySelector('.hamburger'),
    tvCardimg = document.querySelectorAll('img.tv-card__img'),
    tvShows = document.querySelector('.tv-shows'),
    tvShowsList = document.querySelector('.tv-shows__list'),
    modal = document.querySelector('.modal'),
    tvCardImg = document.querySelector('.tv-card__img'),
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input'),
    preloader = document.querySelector('.preloader'),
    dropdown = document.querySelectorAll('.dropdown'),
    tvShowsHead = document.querySelector('.tv-shows__head'),
    posterWrapper = document.querySelector('.poster__wrapper'),
    modalContent = document.querySelector('.modal__content'),
    pagination = document.querySelector('.pagination'); 

const loading = document.createElement('div');
loading.className = 'loading';


    class DBService {
        async getData(url) {
            const res = await fetch(url);
            if (res.ok) {
                return res.json();
            } else {
                throw new Error(`Не удалось получить данные 
                по адресу ${url}`);
            }
        }
    
        getTestData () {
            return this.getData('test.json');
        }

        getTestCard () {
            return this.getData('card.json');
        }

        getSearchResult (query) {
            this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&page=1&language=ru-RU`;
            return this.getData(this.temp);
        }

        getNextPage (page) {
            return this.getData(this.temp + '&page=' + page);
        }

        getTVShow (id) {
            return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
        }

        getTopRated () {
            return this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`);
        }

        getPopular () {
            return this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`);
        }

        getWeek () {
            return this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`);
        }

        getToday () {
            return this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`);
        }
    }

    const dbService = new DBService();

    const renderCard = (response, target) => {
        tvShowsList.textContent = '';

        



        if(!response.total_results) {
            loading.remove();
            tvShowsHead.textContent = 'К сожалению по вашему запросу ничего не найдено.';
            tvShowsHead.style.color = 'red';
            return;
        }

        tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';
        tvShowsHead.style.color = 'black';

        response.results.forEach((item) => {
            const {
                backdrop_path: backdrop,
                name: title,
                poster_path: poster,
                vote_average: vote,
                id
                    } = item;

            const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
            const backdropIMG = backdrop ? IMG_URL + backdrop : '';
            const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

            const card = document.createElement('li');
            card.className = 'tv-shows__item';
            card.innerHTML = `
            <a href="#" id ="${id}" class="tv-card">
            ${voteElem}
            <img class="tv-card__img"
                 src="${posterIMG}"
                 data-backdrop="${backdropIMG}"
                 alt="${title}">
            <h4 class="tv-card__head">${title}</h4>
        </a>
        `;    
            loading.remove();
            tvShowsList.append(card);
        });

        pagination.textContent = '';

        //  вывод номера страниц, если много элементов

        if (!target && response.total_pages > 1) {
            for (let i = 1; i <= response.total_pages; i++) {
                pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`;
            }
        }
    };

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const value = searchFormInput.value.trim();
        if (value) {
            tvShows.append(loading);
            dbService.getSearchResult(value).then(renderCard);
        }
        searchFormInput.value = '';
    });

    
    

//меню

const closeDropdown = () => {
    dropdown.forEach((e) => {
        e.classList.remove('active');
    });
};


hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});

document.addEventListener('click', (event) => {
    const target = event.target;
    if (!target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    }
});

//дроп-меню делегирование
leftMenu.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target,
        dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }

    if (target.closest('#top-rated')) {
        tvShows.append(loading); 
        dbService.getTopRated().then((response) => renderCard(response, target));
    }
    if (target.closest('#popular')) {
        tvShows.append(loading);
        dbService.getPopular().then((response) => renderCard(response, target));
    }
    if (target.closest('#week')) {
        tvShows.append(loading);
        dbService.getWeek().then((response) => renderCard(response, target));
    }
    if (target.closest('#today')) {
        tvShows.append(loading);
        dbService.getToday().then((response) => renderCard(response, target));
    }
    if (target.closest('#search')) {
        tvShowsList.textContent = '';
        tvShowsHead.textContent = '';
    }
});

//меняется картинка при наведении, возвращается на исходную, если убрать мышку 

const changeImg = event => {
    const card = event.target.closest('.tv-shows__item');
    if(card) {
        const img = card.querySelector('.tv-card__img');
        //чтобы не менялось на пустоту, если нет второй картинки
        if(img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
        }
    }
};
document.addEventListener('mouseover', changeImg);
document.addEventListener('mouseout', changeImg);




//модальное окно


tvShowsList.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target,
        card = target.closest('.tv-card');

    if (card) {

        preloader.style.display = 'block';

        new DBService().getTVShow(card.id)
            .then(data => {
                console.log(data);
                if(data.poster_path) {
                    tvCardImg.src = IMG_URL + data.poster_path;
                    tvCardImg.alt = data.name;
                    posterWrapper.style.display = '';
                    modalContent.style.paddingLeft = '';
                } else {
                    posterWrapper.style.display = 'none';
                    modalContent.style.paddingLeft = '25px';
                }
                
                modalTitle.textContent = data.name;
                // genresList.innerHTML = response.genres.reduce((acc, item) => `${acc} <li>${item.name}</li>`, '');
                genresList.textContent = '';
                for (const item of data.genres) {
                    genresList.innerHTML += `<li>${item.name}</li>`;
                }
                rating.textContent = data.vote_average; 
                description.textContent = data.overview;
                modalLink.href = data.homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .then(() => {
                preloader.style.display = '';
            });
    }
});

//закрытие

modal.addEventListener('click', event => {
    event.preventDefault();
    if (event.target.closest('.cross') || event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

pagination.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target;
    if(target.classList.contains('pages')) {
        tvShows.append(loading);
        dbService.getNextPage(target.textContent).then(renderCard);
    }
});








