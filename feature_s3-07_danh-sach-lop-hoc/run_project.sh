#!/bin/bash
# ==============================================================================
# Script khởi chạy toàn diện Cổng Quản Lý Đào Tạo Đại Học (TMS University Portal)
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================================================="
echo "🎓 KHỞI CHẠY HỆ THỐNG QUẢN LÝ ĐÀO TẠO ĐẠI HỌC (TMS) - FULL 100%"
echo "✨ Thời khóa biểu tự động · LMS Bài tập & Nộp bài · Học phí & Biên lai"
echo "================================================================="

# Khởi chạy Backend trên cổng 3005
echo "🚀 Đang khởi động Backend Server (Port 3005)..."
cd "$PROJECT_DIR/Backend"
npm.cmd start &
BACKEND_PID=$!

sleep 2

# Khởi chạy Frontend trên cổng 5173
echo "✨ Đang khởi động Frontend Vite Dev Server (Port 5173)..."
cd "$PROJECT_DIR/Frontend"
npm.cmd run dev &
FRONTEND_PID=$!

echo ""
echo "✅ CẢ HAI SERVER ĐÃ SẴN SÀNG!"
echo "👉 Frontend: http://localhost:5173"
echo "👉 Backend:  http://localhost:3005"
echo ""
echo "Nhấn [Ctrl + C] để dừng toàn bộ hệ thống."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT
wait