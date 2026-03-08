import multer from "multer";

const storage = multer.diskStorage({
  destination: process.cwd() + "/public/imgs",
  filename: (req, file, callback) => {
    let newName = new Date().getTime() + "_" + file.originalname;
    callback(null, newName);
  },
});

let upload = multer({ storage });

export default upload;
