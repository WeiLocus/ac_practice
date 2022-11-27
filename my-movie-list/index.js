// 原始URL = https://movie-list.alphacamp.io/api/v1/movies
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12 //預設每頁呈現電影卡片數



const movies = [] //放置電影清單的電影
let filteredMovies = [] //建立一個空陣列來存放篩選後的電影
let currentPage = 1 

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const displayMode = document.querySelector("#change-displaymode");

//render-movie-list
function renderMovieList(data) {
  //renderMovieList (data)不使用renderMovieList (movies)這個變數是為了降低耦合性，使函式獨立
  //依照dataPanel的data-mode來決定渲染模式
  if (dataPanel.dataset.mode === "card-mode") {
    let rawHTML = "";
    data.forEach((item) => {
      // 需要title , image
      // console.log(item);
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
                class="btn btn-info btn-add-favorite"
                data-id=${item.id}>+
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    });
    dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.mode === "list-mode") {
    let rawHTML = `<ul class="list-group col-sm-12 mb-5">`;
    data.forEach((item) => {
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button 
            class="btn btn-primary btn-show-movie" 
            data-bs-toggle="modal" 
            data-bs-target="#movie-modal"
            data-id="${item.id}">More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>`;
    });
    rawHTML += `</ul>`;
    dataPanel.innerHTML = rawHTML;
  }
}

//監聽displaymode做卡片模式與清單模式切換
displayMode.addEventListener("click", function onDisplayIconClicked(event) {
  console.log(event.target);
  if (event.target.matches("#card-mode-button")) {
    changeDisplay("card-mode");
    renderMovieList(getMoviesByPage(currentPage));
  } else if (event.target.matches("#list-mode-button")) changeDisplay("list-mode");
  renderMovieList(getMoviesByPage(currentPage)); //重新渲染
});

//防呆：依 data-mode 切換不同的顯示方式
function changeDisplay(display) {
  console.log(dataPanel.dataset.mode);
  if (dataPanel.dataset.mode === display) return;

  dataPanel.dataset.mode = display;
}

axios
  .get(INDEX_URL)
  .then((response) => {
    //在data.response.results裡有array(80)
    //取出80個陣列
    //方法一 for..of
    // for (const movie of response.data.results) {
    //   movies.push(movie)
    // }
    //方法二.在response.data.results前加上...
    movies.push(...response.data.results)
    // console.log(movies)
    // renderMovieList(movies)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage)) //固定顯示為第一頁（分頁功能）
  })
  .catch((error) => console.log(error))


//監聽datapanel，點擊按鈕事件，命名函式onPanelClicked方便除錯
dataPanel.addEventListener('click', function onPanelClicked(event) {
  const target = event.target
  //點擊的class name包含.btn-show-movie時，取出ID
  if (target.matches('.btn-show-movie')) {
    console.log(target.dataset)  // 有綁定data的都會變成一個陣列
    showMovieModal(Number(target.dataset.id)) //原始dataset取出的id值是字串
  } else if (target.matches('.btn-add-favorite')) {  //點擊的class name包含.btn-add-favorite時取出ID
    addToFavorite(Number(target.dataset.id))
  }
})

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

// 當監聽到 onPanelClicked 事件是點擊btn-add-favorite按鈕時，呼叫addToFavorite
function addToFavorite(id) {
  // console.log(id)
  //把local storage裡面的東西拿出來 (key-value pair)，用JSON.parse把JSON字串轉為js原生物件
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []  //如果list還沒有東西就先給空陣列
  // 點擊後得到對應的id後，要用迴圈將movies所有電影取出來比對id，相同的話就抓出來，然後把迴圈break掉
  // const movie = movies.find.(movie => movie.id === id) // 簡潔寫法，箭頭+匿名函式
  const movie = movies.find((movie) => movie.id === id);
  //防止一樣的ID被重複加入，some可以比對是否有一樣的，回傳ture或false
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單中')
  }
  // console.log(movie)
  list.push(movie)
  console.log(list)
  // const jsonString = JSON.stringify(list)
  // console.log('json String' , jsonString)
  // console.log('json objext', JSON.parse(jsonString))
  localStorage.setItem('favoriteMovies', JSON.stringify(list)) //setItem存入data

}

//將搜尋表單綁定提交事件，觸發搜尋功能
searchForm.addEventListener('submit', function onSerchFormSubmitted(event) {
  event.preventDefault() //會請瀏覽器終止元件的預設行為，把控制權交給 JavaScript
  console.log(event)
  //宣告keyward輸入框變數，將searchInput的值前後空白去除，轉成小寫取出
  const keyword = searchInput.value.trim().toLowerCase()
  console.log ('input: ' + keyword )

  //防呆：如果輸入空字串，長度=0為false，加上！變成ture，alert提醒
  // if (!keyward.length) {
  //   return alert('Please enter a valid string')
  // }
  //取出包含關鍵字電影的方法一:for..of
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  //取出包含關鍵字電影的方法二：filter (陣列用的方法)
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyward:' + keyword)
  }
  //建立分頁器後，submit搜尋電影名字後，重新渲染分頁器為filteredMovies.length
  renderPaginator(filteredMovies.length) //重製分頁器
  renderMovieList(getMoviesByPage(1))  //預設顯示第 1 頁的搜尋結果
})

//原始
// searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
//   event.preventDefault()
//   const keyword = searchInput.value.trim().toLowerCase()

//   filteredMovies = movies.filter((movie) =>
//     movie.title.toLowerCase().includes(keyword)
//   )
//   if (filteredMovies.length === 0) {
//     return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
//   }
//   renderMovieList(filteredMovies)
// })

////監聽：點擊不同頁數時，會呈現不同的電影
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  currentPage = page;
  //點選分頁後讓currentPage的值 ＝dataset.page的數字，同步給所有參數是currentPage的函式，讓切換模式時維持同頁
  renderMovieList(getMoviesByPage(currentPage));
  const markpage = event.target.dataset.page;
  MarkCurrentPage(markpage); //針對點擊頁面加入顏色mark
});

//渲染分頁數 renderPaginator
//需要知道有多少部電影，需要幾個分頁 （總數/分頁數)
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let paginatorHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    paginatorHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>
    `;
  }
  paginator.innerHTML = paginatorHTML;
  MarkCurrentPage("1");
}
//建立函式getMoviesByPage 來負責從總清單裡切割資料，然後回傳切割好的新陣列
function getMoviesByPage(page) {
  //page1 -> movie 0 - 11
  //page2 -> movie 12 - 23
  //page3 -> movie 24 - 35
  //getMovie 可以是movies全部的電影，也可以是filteredMovies篩選後的電影
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE; //點選第一頁時，會是（1-1）*12 =0
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE); // startIndex + MOVIES_PER_PAGE=0+12，slice(0,12)
}

//顯著目前點選頁數顏色
function MarkCurrentPage(clickpage) {
  const totalpages = [...paginator.children];
  // console.log(totalpages);
  totalpages.forEach((pages) => {
    if (pages.firstElementChild.dataset.page === clickpage) {
      pages.classList.add("active");
    } else {
      pages.classList.remove("active");
    }
  });
}