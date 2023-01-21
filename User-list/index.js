const BASE_URL = "https://user-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/users"

const users = []
let filteredUser = []

const dataPanel = document.querySelector('#data-panel')
const modalAddFav = document.querySelector('.modal-footer') 
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const USER_PER_PAGE = 12
const paginator = document.querySelector('#paginator')

const modeChangeSwitch = document.querySelector('#change-displayMode')
// 宣告currentPage去紀錄目前分頁，確保切換模式時分頁不會跑掉且搜尋時不會顯示錯誤
let currentPage = 1

//用axios發送get request
axios.get(INDEX_URL)
.then((response) => {
  // console.log(response.data.results)
  users.push(...response.data.results)
  // renderUserList(users)
  renderUserList(getUsersByPage(currentPage))
  renderPaginator(users.length)
})
.catch ((error) => console.log(error))

//渲染畫面
function renderUserList(data) {
  if (dataPanel.dataset.mode === "card-mode") {
    let htmlContent = ''
    data.forEach(item => {
      htmlContent += `
    <div class="col-sm-2">
        <div class="mb-2">
          <div class="card">
            <img
              src="${item.avatar}"
              class="card-img" alt="avatar"
              data-bs-toggle="modal"
              data-bs-target="#user-modal"
              data-id=${item.id} />
            <div class="card-body">
              <p class="card-title">${item.name} ${item.surname}</p>
            </div>
          </div>
        </div>
      </div>
    `
      dataPanel.innerHTML = htmlContent
    })
  } else if (dataPanel.dataset.mode === "list-mode") {
    let listHtmlContent = `<ul class="list-group col-sm-12">`
    data.forEach((item) => {
      listHtmlContent += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.name} ${item.surname}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" 
            data-bs-toggle="modal"
            data-bs-target="#user-modal"
            data-id="${item.id}">More
        </button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
      `
    })
    listHtmlContent += `</ul>`
    dataPanel.innerHTML = listHtmlContent
  }
}

//渲染分頁數
function renderPaginator(amount) {
  // 80 / 12 = 6..8
  const numberOfPages = Math.ceil( amount / USER_PER_PAGE)
  let htmlContent = ''
  //for迭代分頁
  for (let page = 1; page <= numberOfPages; page++) {
    htmlContent += `
    <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>
    `
  }
  paginator.innerHTML = htmlContent
  markCurrentPage('1') //dataset是字串，所以這裡也要放字串
}

//建立分頁，一頁12筆資料
function getUsersByPage(page) { 
  //page 1 : users 0 ~ 11 , page 2 : users 12 ~ 23
  const startIndex = (page - 1) * USER_PER_PAGE
  //如果filteredUser陣列裡有東西，就回傳filteredUser，否則就回傳users
  const dataList = filteredUser.length ? filteredUser : users
  return dataList.slice(startIndex ,startIndex + USER_PER_PAGE)
}

//建立對paginator的click事件
paginator.addEventListener('click',function onPaginatorClicked(e) {
  if (e.target.tagName !== 'A') return
  const page = Number(e.target.dataset.page)
  currentPage = page
  renderUserList(getUsersByPage(currentPage))
  markCurrentPage(page)
})

function markCurrentPage(clickPage) {
  const pages = [...paginator.children]
  // console.log(pages)
  pages.forEach((page) => {
    if (page.firstElementChild.dataset.page === String(clickPage)) {
      page.classList.add('active')
    } else {
      page.classList.remove('active')
    }
  })
}

//對照片點擊時產生對應的modal訊息
dataPanel.addEventListener('click',onPanelClicked)

function onPanelClicked (e) {
  if (e.target.matches('.card-img') || e.target.matches('.btn-show-movie')) {
    // console.log(Number(e.target.dataset.id))
    showUserInfo(Number(e.target.dataset.id))
  }
}
function showUserInfo(id) {
  const userModalImg = document.querySelector('#user-modal-image')
  const userModalInfo = document.querySelector('#user-modal-info')
  userModalImg.innerHTML = ""
  userModalImg.innerHTML = ""
  modalAddFav.innerHTML = ""
  axios.get(`${INDEX_URL}/${id}`)
  .then((response) => {
    // console.log(response.data)
    if (dataPanel.dataset.mode === 'card-mode') {
      userModalImg.innerHTML = `
    <img src= "${response.data.avatar}" alt="movie-poster" class="img-fluid">`
      userModalInfo.innerHTML = `
    <p class="modal-name">Name: ${response.data.name} ${response.data.surname}</p>
    <p class="modal-age">Age: ${response.data.age}</p>
    <p class="modal-email">Email: ${response.data.email}</p>
    <p class="modal-gender">Gender: ${response.data.gender}</p>
    <p class="modal-region">Region: ${response.data.region}</p>
    <p class="modal-birthday">Birthday: ${response.data.birthday}</p>
  `
      modalAddFav.innerHTML = `
    <button 
      class="btn btn-info btn-add-favorite"
      data-id=${response.data.id}>+</button>
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
  `
    } else if (dataPanel.dataset.mode === 'list-mode') {
      userModalImg.innerHTML = `
    <img src= "${response.data.avatar}" alt="movie-poster" class="img-fluid">`
      userModalInfo.innerHTML = `
    <p class="modal-name">Name: ${response.data.name} ${response.data.surname}</p>
    <p class="modal-age">Age: ${response.data.age}</p>
    <p class="modal-email">Email: ${response.data.email}</p>
    <p class="modal-gender">Gender: ${response.data.gender}</p>
    <p class="modal-region">Region: ${response.data.region}</p>
    <p class="modal-birthday">Birthday: ${response.data.birthday}</p>
  `
    }
  })
}


//card-mode對btn-add-favorite按鈕點擊後，將user加入favorite頁面
modalAddFav.addEventListener('click', onAddButtonClicked)
//list-mode對btn-add-favorite點擊時產生對應的modal訊息
dataPanel.addEventListener('click', onAddButtonClicked)

function onAddButtonClicked(e) {
  if (e.target.matches('.btn-add-favorite')) {
    console.log(Number(e.target.dataset.id))
    addToFavorite(Number(e.target.dataset.id))
  }
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const targetUser = users.find((user) => user.id === id)
  if (list.some((user) => user.id === id)) {
    return alert('已在清單中')
  }
  list.push(targetUser)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

//對search form監聽submit事件
searchForm.addEventListener('submit',function onSearchSubmitted(e) {
  e.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredUser = users.filter (function(user) {
    const userName = user.name + user.surname
    return userName.toLowerCase().includes(keyword)
  })
  if (filteredUser.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的搜尋結果`)
  }
  //search後的結果也要分頁，預設顯示第一頁的搜尋結果
  renderUserList(getUsersByPage(1))
  //重新渲染paginator
  renderPaginator(filteredUser.length)
})

//依 data-mode 切換不同的顯示方式
function changeDisplayMode(mode) {
  if (dataPanel.dataset.mode === mode) return
  dataPanel.dataset.mode = mode
}

//對displayMode點選時，進行mode切換
modeChangeSwitch.addEventListener('click',function onSwitchClicked(e) {
  if (e.target.matches('#card-mode-button')) {
    changeDisplayMode('card-mode')
    renderUserList(getUsersByPage(currentPage))
  } else if (e.target.matches('#list-mode-button'))
    changeDisplayMode('list-mode')
    renderUserList(getUsersByPage(currentPage))
})
