# FRUSTRATED

> **"Can You Keep Your Team Together?"**  
> *"Một người khó. Sáu người... càng khó hơn."*

FRUSTRATED là một trò chơi nền tảng 2D (Platformer) trực tuyến nhiều người chơi (Multiplayer Co-op 1-6 người). Trò chơi tập trung vào sự phối hợp ăn ý, vượt qua các chướng ngại vật hiểm hóc, giải các câu đố kích hoạt công tắc và cùng nhau đưa toàn bộ đồng đội về đích an toàn.

---

## 🎮 Tính Năng Nổi Bật

- 👥 **Multiplayer Co-op (1 - 6 người chơi)**: Tạo phòng riêng, mã phòng 6 ký tự, vào nhanh qua Quick Play hoặc chia sẻ liên kết.
- 💬 **Lobby & Realtime Chat**: Chọn màu sắc nhân vật, chat thời gian thực, gửi nhanh biểu cảm (Emotes).
- 🤝 **Cơ Chế Phối Hợp Độc Đáo**:
  - **Player Stacking**: Nhảy lên đầu đồng đội để leo tường hoặc vượt chướng ngại vật cao.
  - **Pressure Plates & Gates**: Đứng giữ nút để mở cổng cho đồng đội vượt qua.
  - **Multi-Switches**: Kích hoạt đồng thời nhiều nút ở các vị trí khác nhau để mở lối đi.
  - **Checkpoint & Respawn**: Hồi sinh nhanh bằng phím `R` tại checkpoint gần nhất.
- 🗺️ **5 Cấp Độ Thử Thách**:
  1. *Level 1 — TEAMWORK*: Làm quen cơ chế nhảy và phối hợp cơ bản.
  2. *Level 2 — BUTTONS & GATES*: Giữ nút áp lực và mở cổng liên hoàn.
  3. *Level 3 — TRAPS & TIMING*: Tránh bẫy chông nhọn và nền tảng di chuyển.
  4. *Level 4 — CHAOS CO-OP*: Phối hợp đa người chơi kích hoạt nút phức tạp.
  5. *Level 5 — FRUSTRATED 🔥*: Màn chơi thử thách cực hạn với tổng hợp mọi loại bẫy!
- 📱 **Hỗ Trợ Mọi Thiết Bị**: Chơi mượt mà trên cả máy tính (Bàn phím) và điện thoại/máy tính bảng (Phím cảm ứng ảo On-screen Controls).
- 🎨 **Giao Diện Hiện Đại**: Thiết kế phong cách Neon / Glassmorphism tối ưu thị giác với hiệu ứng hạt động.

---

## 🕹️ Hướng Dẫn Điều Khiển

| Thao tác | Bàn phím máy tính | Màn hình cảm ứng (Mobile) |
| :--- | :--- | :--- |
| **Di chuyển trái / phải** | `A` / `D` hoặc `←` / `→` | Nút `◄` / `►` bên trái |
| **Nhảy** | `SPACE` hoặc `W` / `↑` | Nút `▲` bên phải |
| **Hồi sinh (khi chết)** | `R` | Nút `🔄 HỒI SINH` |

---

## 🚀 Cài Đặt & Chạy Trực Tiếp

### Yêu cầu:
- [Node.js](https://nodejs.org/) (phiên bản 16 trở lên)

### Các bước cài đặt:
1. **Clone repository:**
   ```bash
   git clone https://github.com/danganhkhoak37-alt/FRUSTRATED.git
   cd FRUSTRATED
   ```

2. **Cài đặt thư viện phụ thuộc:**
   ```bash
   npm install
   ```

3. **Khởi động máy chủ:**
   ```bash
   npm start
   # hoặc
   node server/server.js
   ```

4. **Trải nghiệm game:**
   Mở trình duyệt và truy cập: `http://localhost:3000`

---

## 🛠️ Công Nghệ Sử Dụng

- **Backend**: Node.js, Express, Socket.IO (Xử lý đồng bộ vị trí, trạng thái phòng và tương tác vật lý thời gian thực)
- **Frontend**: HTML5 Canvas, Vanilla JavaScript (Tối ưu hiệu năng rendering 60FPS), CSS3 (Modern Glassmorphism & Animations)
- **Physics**: Custom 2D AABB Collision & Platformer Engine hỗ trợ tương tác đa người chơi.