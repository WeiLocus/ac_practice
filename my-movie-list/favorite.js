// 原始URL = https://movie-list.alphacamp.io/api/v1/movies
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) //取出存入的data，轉成js原生物件

const datapanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

//render-movie-list
function renderMovieList(data) {
  //renderMovieList (data)不使用renderMovieList (movies)這個變數是為了降低耦合性，使函式獨立
  let rawHTML = ''

  data.forEach(item => {
    // 需要title , image
    console.log(item)
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button 
                class="btn btn-primary btn-show-movie" 
                data-bs-toggle="modal" 
                data-bs-target="#movie-modal"
                data-id="${item.id}">More
                <!--data-bs-target的名稱要與modal的id相同 -->
              </button>
              <button 
                class="btn btn-danger btn-remove-favorite"
                data-id="${item.id}">X
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  datapanel.innerHTML = rawHTML
}

//監聽datapanel，點擊按鈕事件，命名函式onPanelClicked方便除錯
datapanel.addEventListener('click', function onPanelClicked(event) {
  const target = event.target
  //點擊的class name包含.btn-show-movie時，取出ID
  if (target.matches('.btn-show-movie')) {
    console.log(target.dataset)  // 有綁定data的都會變成一個陣列
    showMovieModal(Number(target.dataset.id)) //原始dataset取出的id值是字串
  } else if (target.matches('.btn-remove-favorite')) {  //點擊的class name包含.btn-add-favorite時取出ID
    removeFromFavorite(Number(target.dataset.id))
  }
})

function removeFromFavorite(id) {
  //錯誤處理:防止 movies 是空陣列的狀況
  if (!movies || !movies.length) return 
  //透過 id 找到要刪除電影的 index
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return
  //刪除該筆電影
  movies.splice (movieIndex,1)
  console.log(movies)
  //存回local storage
  localStorage.setItem('favoriteMovies' , JSON.stringify(movies))
  //更新頁面
  renderMovieList(movies)
}


// 當監聽到 onPanelClicked 事件是點擊btn-show-movie按鈕時，呼叫showMovieModal
function showMovieModal(id) {
  //需要選取並動態改變四個元素：電影名稱、海報圖、上映日期、描述
  //Show API 的 URL 是 https://movie-list.alphacamp.io/movies/:id
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release data: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `
      <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
      `
    })
}

renderMovieList(movies)