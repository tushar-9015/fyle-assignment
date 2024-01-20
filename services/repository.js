async function getRepositories(
  username = "tushar-9015",
  searchQuery = undefined,
  page = "1",
  per_page = "10"
) {
  const encodedUsername = encodeURIComponent(username);
  let url = `https://api.github.com/search/repositories?q=user:${encodedUsername}`;

  if (searchQuery) {
    const repoName = encodeURIComponent(searchQuery);
    url = url + `+${repoName}`;
  }
  url = url + `&per_page=${per_page}&page=${page}`;

  try {
    const response = await fetch(url);

    const data = response.json();
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
}
