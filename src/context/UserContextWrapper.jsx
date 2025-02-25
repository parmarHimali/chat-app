import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

const UserContextWrapper = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("chat-user")) || {}
  );
  useEffect(() => {
    localStorage.setItem("chat-user", JSON.stringify(user));
  }, [user]);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextWrapper;
