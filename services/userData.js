async function getUserData(username) {
  const encodedUsername = encodeURI(username);
  try {
    const response = await fetch(`https://api.github.com/users/${encodedUsername}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
}
