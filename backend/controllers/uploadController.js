import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

// @desc    Upload single or multiple image files
// @route   POST /api/upload
// @access  Private
export const uploadImages = async (req, res) => {
  try {
    let files = [];
    if (req.files && Array.isArray(req.files)) {
      files = req.files;
    } else if (req.file) {
      files = [req.file];
    }

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one image file to upload',
      });
    }

    const uploadedUrls = [];

    for (const file of files) {
      if (isCloudinaryConfigured()) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'farm_connect_products',
          });
          uploadedUrls.push(result.secure_url);
        } catch (err) {
          // Fallback to local URL if Cloudinary upload fails
          const localUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          uploadedUrls.push(localUrl);
        }
      } else {
        const localUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        uploadedUrls.push(localUrl);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Image(s) uploaded successfully',
      urls: uploadedUrls,
      url: uploadedUrls[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error uploading file(s)',
      error: error.message,
    });
  }
};
