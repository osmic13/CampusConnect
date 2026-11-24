
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let reactionSocket = null;
let socketToken = null;

export function getReactionSocket() {
  const token = localStorage.getItem("cc_token");

  if (!token || !SOCKET_URL) {
    return null;
  }

  // Reuse one connection for all PostCard components.
  if (reactionSocket && socketToken !== token) {
    reactionSocket.disconnect();
    reactionSocket = null;
  }

  if (!reactionSocket) {
    socketToken = token;

    reactionSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });
  }

  return reactionSocket;
}
