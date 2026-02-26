class UploadController {
  /**
   * API Endpoint for Cloud Image Upload
   * POST /api/upload
   * Expected form-data: "image"
   */
  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Dữ liệu file không hợp lệ hoặc rỗng' });
      }

      // Cloudinary returns the secure_url string which we need
      const imageUrl = req.file.path; // depending on multer-storage-cloudinary version, path holds the URL

      res.status(200).json({
        success: true,
        message: 'Tải ảnh lên thành công',
        url: imageUrl
      });
    } catch (error) {
      console.error('Upload Error:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi upload ảnh' });
    }
  }
}

module.exports = UploadController;
