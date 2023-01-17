const BASE_URL = "https://user-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/users"

const users = []
let filteredUser = []

const dataPanel = document.querySelector('#data-panel')
const modalAddFav = document.querySelector('.modal-footer') 
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')


//用axios發送get request
axios.get(INDEX_URL)
.then((response) => {
  // console.log(response.data.results)
  users.push(...response.data.results)
  renderUserList(users)
})
.catch ((error) => console.log(error))

//渲染畫面
function renderUserList(data) {
  let htmlContent =''
  data.forEach ( item => {
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
}

//對照片點擊時產生對應的modal訊息
dataPanel.addEventListener('click',onImgClicked)

function onImgClicked (e) {
  if (e.target.matches('.card-img')) {
    // console.log(Number(e.target.dataset.id))
    showUserInfo(Number(e.target.dataset.id))
  } 
}
function showUserInfo(id) {
  const userModalImg = document.querySelector('#user-modal-image')
  const userModalInfo = document.querySelector('#user-modal-info')
  axios.get(`${INDEX_URL}/${id}`)
  .then((response) => {
    // console.log(response.data)
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
  })
}

//對btn-add-favorite按鈕點擊後，將user加入favorite頁面
modalAddFav.addEventListener('click', onAddButtonClicked)

function onAddButtonClicked(e) {
  if (e.target.matches('.btn-add-favorite')) {
    // console.log(Number(e.target.dataset.id))
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
    if (user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)) {
      return user
    }
  })
  if (filteredUser.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的搜尋結果`)
  }
  renderUserList(filteredUser)
})


