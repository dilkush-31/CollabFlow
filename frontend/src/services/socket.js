import { io } from "socket.io-client";

let socket = null;

// Opens one shared connection after login, using the saved JWT
export const getSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!socket) {
    socket = io("http://localhost:5000", {
      auth: { token },
      autoConnect: true,
    });
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};