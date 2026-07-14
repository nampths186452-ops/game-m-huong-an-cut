import { io } from 'socket.io-client';

// Dấu '/' giúp điện thoại tự động hiểu: Đường link là gì thì kết nối ngầm vào đúng link đó
export const socket = io('https://game-m-huong-an-cut.onrender.com');
socket.on('connect', () => console.log('🟢 THÀNH CÔNG: Đã kết nối với máy chủ Render!'));
socket.on('connect_error', (err) => console.log('🔴 LỖI RỒI:', err.message));