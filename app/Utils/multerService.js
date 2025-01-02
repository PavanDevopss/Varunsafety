const multer = require("multer");
const path = require("path");

const configureMulter = (
  destinationPath,
  fileSizeLimit,
  allowedFileTypes,
  fieldName
) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: fileSizeLimit },
    fileFilter: (req, file, cb) => {
      const fileTypes = new RegExp(allowedFileTypes.join("|"), "i");
      const mimeType = fileTypes.test(file.mimetype);
      const extname = fileTypes.test(path.extname(file.originalname));

      if (mimeType && extname) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Please upload files in ${allowedFileTypes.join(", ")} format.`
          )
        );
      }
    },
  }).single(fieldName);

  return upload;
};

module.exports = { configureMulter };
