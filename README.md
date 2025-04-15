# 🍜 Món Ăn Mọi Miền

Chào mừng bạn đến với dự án "Món Ăn Mọi Miền" - nơi kết nối ẩm thực và văn hóa Việt Nam thông qua công nghệ!

## 📋 Giới thiệu

Ứng dụng di động giúp khám phá và chia sẻ các món ăn đặc trưng của từng vùng miền Việt Nam, được xây dựng bằng React Native, TypeScript và Expo SDK 52. Dự án này nhằm mục đích bảo tồn và quảng bá ẩm thực Việt Nam, đồng thời tạo ra một cộng đồng yêu thích ẩm thực.

## 📱 Tính năng chính

- 🗺️ **Bản đồ ẩm thực**: Khám phá món ăn theo vùng miền với bản đồ tương tác
- 📖 **Công thức chi tiết**: Hướng dẫn nấu ăn chuyên nghiệp với nguyên liệu và các bước thực hiện
- ⭐ **Đánh giá & Bình luận**: Chia sẻ trải nghiệm và tương tác với cộng đồng
- 💾 **Lưu trữ yêu thích**: Tạo bộ sưu tập công thức cá nhân
- 🌙 **Dark mode**: Hỗ trợ giao diện tối cho trải nghiệm tốt hơn
- 🔍 **Tìm kiếm thông minh**: Lọc theo vùng miền, nguyên liệu, độ khó

## 🖼️ Demo & Screenshots

<div align="center">
  <p><strong>Màn hình đăng nhập với giao diện thân thiện</strong></p>
  <img src="./assets/demo-1.jpg" alt="Màn hình đăng nhập" width="300"/>
  
  <p><strong>Chi tiết công thức món Phở Hà Nội với danh sách nguyên liệu</strong></p>
  <img src="./assets/demo-2.jpg" alt="Chi tiết công thức món Phở Hà Nội" width="300"/>
  
  <p><strong>Trang danh sách món ăn với chức năng lưu yêu thích</strong></p>
  <img src="./assets/demo-3.jpg" alt="Trang danh sách món ăn" width="300"/>
</div>

## 🚀 Cài đặt và Phát triển

### Yêu cầu hệ thống

- Node.js 18.0 trở lên
- npm 9.0 trở lên hoặc pnpm
- Expo CLI
- Android Studio (cho Android) hoặc Xcode (cho iOS)

### Các bước cài đặt

1. Clone repository:

```bash
git clone https://github.com/HuyBui2112/mon-an-moi-mien-v5.git
```

2. Di chuyển vào thư mục dự án:

```bash
cd mon-an-moi-mien
```

3. Cài đặt dependencies:

```bash
pnpm install
```

4. Khởi động ứng dụng:

```bash
npx expo start
```

## 🛠️ Công nghệ sử dụng

- **Frontend**

  - React Native với Expo SDK 52
  - TypeScript cho type safety
  - React Navigation 6 cho điều hướng
  - React Native Paper cho UI components
  - React Native Maps cho tính năng bản đồ

- **Backend & Database**

  - Firebase Authentication
  - Cloud Firestore
  - Firebase Storage
  - Cloud Functions

- **State Management & Storage**
  - React Context API
  - AsyncStorage cho caching
  - Redux Toolkit (cho các tính năng phức tạp)

## 📁 Cấu trúc thư mục

```text
src/
├── components/     # Components tái sử dụng
├── screens/        # Màn hình chính của ứng dụng
├── services/       # Logic tương tác với Firebase
├── context/        # React Context cho state management
├── hooks/          # Custom hooks
├── theme/          # Cấu hình theme và styles
├── types/          # TypeScript types và interfaces
├── utils/          # Các hàm tiện ích
└── constants/      # Các hằng số
```

## 🤝 Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp để cải thiện dự án!

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/TinhNangMoi`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng XYZ'`)
4. Push lên branch (`git push origin feature/TinhNangMoi`)
5. Tạo Pull Request

## 🐛 Báo lỗi

Nếu bạn gặp lỗi hoặc có đề xuất, vui lòng tạo issue mới trong repository.

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Tác giả

- **Trần Phương Lâm** - _Developer_

## 📞 Liên hệ

Nếu bạn có câu hỏi hoặc đề xuất, vui lòng liên hệ qua email: 21521059@gm.uit.edu.vn

---

<p align="center">Phát triển với ❤️ tại Việt Nam</p>
