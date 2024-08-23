export const setAuth = (username: string, password: string) => {
  sessionStorage.setItem("auth", `${username}:${password}`);
};
