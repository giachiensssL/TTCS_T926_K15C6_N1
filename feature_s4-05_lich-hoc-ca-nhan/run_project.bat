@echo off
chcp 65001 >nul
title Cổng Đào Tạo Đại Học TMS - Khởi Chạy Hệ Thống

echo =================================================================
echo  🎓 KHỞI CHẠY HỆ THỐNG QUẢN LÝ ĐÀO TẠO ĐẠI HỌC (TMS)
echo =================================================================

echo [*] Đang khởi động Backend Server (Port 3005 - MongoDB Atlas)...
start "TMS Backend (Port 3005)" cmd /k "cd /d ""%~dp0Backend"" && npm.cmd start"

timeout /t 2 /nobreak >nul

echo [*] Đang khởi động Frontend Vite Server (Port 5173)...
start "TMS Frontend (Port 5173)" cmd /k "cd /d ""%~dp0Frontend"" && npm.cmd run dev"

echo.
echo =================================================================
echo  ✅ CẢ HAI SERVER ĐÃ SẴN SÀNG!
echo  👉 Giao diện Người dùng: http://localhost:5173
echo  👉 Máy chủ Dữ liệu:       http://localhost:3005
echo  🔑 Tài khoản Admin:       admin  /  admin123
echo =================================================================
echo.
echo Bạn có thể đóng cửa sổ này (2 cửa sổ máy chủ sẽ tiếp tục chạy nền).
pause >nul