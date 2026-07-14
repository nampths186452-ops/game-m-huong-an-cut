import { io } from 'socket.io-client';

// Dấu '/' giúp điện thoại tự động hiểu: Đường link là gì thì kết nối ngầm vào đúng link đó
export const socket = io('/', { autoConnect: false });