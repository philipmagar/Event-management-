export const getUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const user = getUser();
  return !!(token && user);
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === "admin";
};

export const saveUser = (user, token) => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
};

export const clearUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};
