async function getUserData() {
  try {
    const response = await fetch("https://api.github.com/users/ankit9015");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
}
