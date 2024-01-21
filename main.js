const profile = document.querySelector(".profile-top");
const repositoryContainer = document.getElementById("repositoryContainer");
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const paginationButtons = document.querySelector(".pagination");
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const resultsPerPage = document.querySelector("#repository-per-page");
const loadingDialog = document.getElementById("loadingDialog");

let searchQuery = "";
let maxCardInPage = 10;
let currentPageNumber = 1;

let userData;
let userLoading = false;
let repoLoading = false;
let repositoryList = [];

const cardTemplate = (index, title, description, topics = []) => {
  const to_ret = document.createElement("div");
  to_ret.innerHTML = `  <div class="user-repository card" id="card-${index}">
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
  profile.querySelector(".user-name").textContent = data.name;
  profile.querySelector(".user-bio").textContent = data.bio;
  profile.querySelector(".user-location").textContent = data.location;
  profile
    .querySelector(".user-img-section")
    .insertAdjacentHTML(
      "beforeend",
      `  <img id="user-img" src="${data.avatar_url}" alt="avatar" />`
    );

  if (data.twitter_username && data.twitter_username.length > 0) {
    profile
      .querySelector(".user-info")
      .insertAdjacentHTML(
        "beforeend",
        `<a target="_blank"  href="https://twitter.com/${data.twitter_username}">Twitter: ${data.twitter_username}</a>`
      );
  }
  if (data.html_url && data.html_url.length > 0) {
    profile
      .querySelector(".copy-url")
      .insertAdjacentHTML(
        "beforeend",
        `<a target="_blank"  href="${data.html_url}">Github: ${data.html_url}</a>`
      );
  }
}

function updateViewRepoList(repositoryList) {
  searchInput.value = searchQuery;
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
  // repositoryContainer.innerHTML = "";
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
  let active = paginationButtons.querySelector(".active");
  if (active) {
    active.classList.remove("active");
  }

  // update active class
  active = paginationButtons.querySelector(
    `[data-page="${currentPageNumber}"]`
  );
  if (active) {
    active.classList.add("active");
  }
}

async function getPageData() {
  if (repoLoading) return;

  repoLoading = true;
  repositoryContainer.innerHTML = "";
  toggleLoading(repositoryContainer, true);

  let query = searchQuery.trim().length > 0 ? searchQuery.trim() : undefined;
  repositoryList = await getRepositories(
    userData.login,
    query,
    currentPageNumber,
    maxCardInPage
  );

  repoLoading = false;
  toggleLoading(repositoryContainer, false);

  updateViewPaginationButtons();
  updateViewRepoList(repositoryList.items);
}

function toggleLoading(location, isLoading) {
  if (isLoading) {
    location.insertAdjacentHTML(
      "beforeend",
      `<div class="loading">Loading...</div>`
    );
  } else {
    const el = location.querySelector(".loading");
    el.remove();
  }
}

async function initial(username = "tushar-9015") {
  userLoading = true;
  loadingDialog.showModal();
  try {
    userData = await getUserData(username);
    updateViewUser(userData);
    getPageData();
  } catch (error) {
  } finally {
    userLoading = false;
    loadingDialog.close();
  }
}

function attachEventToDom() {
  resultsPerPage.addEventListener("change", (e) => {
    maxCardInPage = e.target.value;
    getPageData();
  });

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
  });

  searchBtn.addEventListener("click", (e) => {
    currentPageNumber = 1;
    let searchParams = new URLSearchParams(document.location.search);
    searchParams.set("search", searchQuery);
    let newPath = window.location.pathname + "?" + searchParams.toString();
    history.pushState(null, "", newPath);
    getPageData();
  });

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

function ready() {
  if (document.readyState !== "loading") {
    attachEventToDom();
    return;
  }
  updateViewPaginationButtons();
  document.addEventListener("DOMContentLoaded", attachEventToDom);
}

function getSearchParams() {
  let url = new URL(document.location.href);
  const userName = url.searchParams.get("user") ?? "tushar-9015";

  currentPageNumber =
    url.searchParams.get("page") &&
    !isNaN(parseInt(url.searchParams.get("page")))
      ? parseInt(url.searchParams.get("page"))
      : currentPageNumber;

  searchQuery = url.searchParams.get("search") ?? "";
  initial(userName);
}

ready();
window.addEventListener("load", (e) => {
  getSearchParams();
});
