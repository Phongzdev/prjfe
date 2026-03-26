import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (userId) => {
    if (socket) {
        socket.disconnect();
    }

    socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('authenticate', userId);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};