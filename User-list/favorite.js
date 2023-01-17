const BASE_URL = "https://user-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/users"

const favUsers = JSON.parse(localStorage.getItem('favoriteUsers'))

let filteredUser = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

renderUserList(favUsers)

function renderUserList(data) {
  let htmlContent = ''
  data.forEach((item) => {
    console.log(item.avatar)
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
  renderUserList(favUsers)
}

searchForm.addEventListener('submit', function onSearchSubmitted(e) {
  e.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredUser = favUsers.filter(function (user) {
    if (user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)) {
      return user
    }
  })
  if (filteredUser.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的搜尋結果`)
  }
  renderUserList(filteredUser)
})



