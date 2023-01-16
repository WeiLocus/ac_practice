const BASE_URL = "https://user-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/users"

const users = []

const dataPanel = document.querySelector('#data-panel')
const modalAddFav = document.querySelector('.modal-footer') 

//用axios發送get request
axios.get(INDEX_URL)
.then((response) => {
  // console.log(response.data.results)
  users.push(...response.data.results)
  renderUserList(users)
})
.catch ((error) => console.log(error))


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

dataPanel.addEventListener('click',onImgClicked)

function onImgClicked (e) {
  if (e.target.matches('.card-img')) {
    console.log(Number(e.target.dataset.id))
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
  })
}
