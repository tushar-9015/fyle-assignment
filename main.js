const profile = document.querySelector("#user-img");
const userName = document.querySelector(".user-name");
const userBio = document.querySelector(".user-bio");
const userLocation = document.querySelector(".user-location");
const repositoryContainer = document.getElementById("repositoryContainer");
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const paginationButtons = document.querySelector(".pagination");

let searchQuery = "";
let maxCardInPage = 10;
let currentPageNumber = 1;

const repositoryCardTemplate =
  document.getElementById("repositoryCard").content;

let userData;
let userLoading = false;
let repoLoading = false;
let repositoryList = [];

const cardTemplate = (index, title, description, topics = []) => {
  const to_ret = document.createElement("div");
  to_ret.innerHTML = `  <div class="user-repository" id="card-${index}">
<h2>
    ${title}
</h2>
<p>
    ${description ?? ""}
</p>
<div class="topics"></div>
</div>`;

  const topicsList = to_ret.querySelector(".topics");

  topics.forEach((topic) => {
    topicsList.insertAdjacentHTML(
      "beforeend",
      `<div class="topic">${topic}</div>`
    );
  });

  return to_ret.children[0];
};

function updateViewUser(data) {
  userName.textContent = data.name;
  userBio.textContent = data.bio;
  userLocation.textContent = data.location;
}

function updateViewRepoList(repositoryList) {
  const list = document.createElement("div");

  for (let i = 0; i < repositoryList.length; i++) {
    const repository = repositoryList[i];
    const card = cardTemplate(
      i,
      repository.name,
      repository.description,
      repository.topics
    );
    list.appendChild(card);
  }
  repositoryContainer.innerHTML = "";
  list.classList.add("repository-list");
  repositoryContainer.appendChild(list);
}

function updateViewPaginationButtons() {
  let maxPage = Math.ceil(
    parseInt(repositoryList.total_count ?? 0) / maxCardInPage
  );
  startPage = 1;
  endPage = maxPage < 9 ? maxPage : 9;

  if (maxPage > 8) {
    startPage = currentPageNumber - 4 > 0 ? currentPageNumber - 4 : 1;
    endPage = currentPageNumber + 4 < maxPage ? currentPageNumber + 4 : maxPage;

    if (endPage - startPage != 8) {
      startPage = endPage - 8 > 0 ? endPage - 8 : 1;
    }
    if (endPage - startPage != 8) {
      endPage = startPage + 8 < maxPage ? startPage + 8 : maxPage;
    }
  }

  // add page number buttons
  paginationButtons.innerHTML = "";
  for (let index = startPage; index <= endPage; index++) {
    paginationButtons.insertAdjacentHTML(
      "beforeend",
      `<a class="page-jump-btn" data-page="${index}"  href="#">${index}</a>`
    );
  }

  // add first page button
  paginationButtons.insertAdjacentHTML(
    "afterbegin",
    `<a class="page-jump-btn" data-page="first" href="#">&laquo;</a>`
  );
  // add last page button
  paginationButtons.insertAdjacentHTML(
    "beforeend",
    `<a class="page-jump-btn" data-page="last"  href="#">&raquo;</a>`
  );

  // remove active class
  const active = paginationButtons.querySelector(".active");
  if (active) {
    active.classList.remove("active");
  }

  // update active class
  const btn = paginationButtons.querySelector(
    `[data-page="${currentPageNumber}"]`
  );
  btn.classList.add("active");
}

async function searchRepositories(searchQuery) {
  repositoryList = await getRepositories(
    userData.login,
    searchQuery,
    currentPageNumber,
    maxCardInPage
  );
  updateViewRepoList();
}

async function getPageData() {
  repositoryList = await getRepositories(
    userData.login,
    searchQuery,
    currentPageNumber,
    maxCardInPage
  );
  updateViewPaginationButtons();
  updateViewRepoList(repositoryList.items);
}

async function initial() {
  userLoading = true;
  repoLoading = true;
  try {
    userData = await getUserData();
    updateViewUser(userData);
    getPageData();
  } catch (error) {
  } finally {
    userLoading = false;
    repoLoading = false;
  }
}

function attachEventToDom() {
  prevBtn.addEventListener("click", (e) => {
    currentPageNumber--;
    getPageData();
  });
  nextBtn.addEventListener("click", (e) => {
    currentPageNumber++;
    getPageData();
  });
  paginationButtons.addEventListener("click", (e) => {
    const page = e.target?.getAttribute("data-page");
    if (page) {
      if (page == "first") {
        currentPageNumber = 1;
      } else if (page == "last") {
        currentPageNumber = Math.ceil(
          repositoryList.total_count / maxCardInPage
        );
      } else {
        currentPageNumber = parseInt(page);
      }
      getPageData();
    }
  });
}

function ready(fn) {
  if (document.readyState !== "loading") {
    fn();
    return;
  }
  updateViewPaginationButtons();
  document.addEventListener("DOMContentLoaded", fn);
}

initial();
ready(attachEventToDom);
