const BASE_URL = "https://user-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/users"

const favUsers = JSON.parse(localStorage.getItem('favoriteUsers'))

let filteredUser = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const USER_PER_PAGE = 12
const paginator = document.querySelector('#paginator')

renderUserList(getUsersByPage(1))
renderPaginator(favUsers.length)

function renderUserList(data) {
  let htmlContent = ''
  data.forEach((item) => {
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
              <button
                class="btn btn-danger btn-remove-favorite"
                data-id=${item.id}>X
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    dataPanel.innerHTML = htmlContent
  })
}

//渲染分頁數
function renderPaginator(amount) {
  // 80 / 12 = 6..8
  const numberOfPages = Math.ceil(amount / USER_PER_PAGE)
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
  const dataList = filteredUser.length ? filteredUser : favUsers
  return dataList.slice(startIndex, startIndex + USER_PER_PAGE)
}

//建立對paginator的click事件
paginator.addEventListener('click', function onPaginatorClicked(e) {
  if (e.target.tagName !== 'A') return
  const page = Number(e.target.dataset.page)
  renderUserList(getUsersByPage(page))
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

dataPanel.addEventListener('click', onCardClicked)

function onCardClicked(e) {
  if (e.target.matches('.card-img')) {
    // console.log(Number(e.target.dataset.id))
    showUserInfo(Number(e.target.dataset.id))
  } else if (e.target.matches('.btn-remove-favorite')) {
    removeFavUser(Number(e.target.dataset.id))
  }
}

function showUserInfo(id) {
  const userModalImg = document.querySelector('#user-modal-image')
  const userModalInfo = document.querySelector('#user-modal-info')
  axios.get(`${INDEX_URL}/${id}`)
    .then((response) => {
      console.log(response.data)
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
    })
}

function removeFavUser(id) {
  const removeUser = favUsers.findIndex((user) => user.id === id)
  if (removeUser === -1) return
  favUsers.splice(removeUser, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(favUsers))
  renderUserList(getUsersByPage(1))
  markCurrentPage(1)
}

searchForm.addEventListener('submit', function onSearchSubmitted(e) {
  e.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredUser = favUsers.filter(function (user) {
    const userName = user.name + user.surname
    return userName.toLowerCase().includes(keyword)
  })
  if (filteredUser.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的搜尋結果`)
  }
  renderUserList(getUsersByPage(1))
  renderPaginator(filteredUser.length)
})



