const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

const upload = multer({storage: storage});

app.post('/upload', upload.single('fileFilter'), (req, res) => {
  const path = req.file.path;
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Ошибка чтения файла');
    } else {
      const result = data.split('\r\n').map((a) => parseInt(a)).sort((a, b) => a - b).join('\r\n');
      fs.writeFile(path, result, (err) => {
        if (err) throw err;
        res.json({downloadPath:path.replace('\\', '/')});
        console.log('File has been saved!');
      });
    }
  });
});

app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.status(404).send('Файл не найден');
      } else {
        res.status(500).send('Внутренняя ошибка сервера');
      }
    } else {
      res.download(filePath);
    }
  });
});

app.get('/', function (req, res) {
  res.sendFile('./dist/index.html', {root: __dirname});
});

app.listen(3000, function () {
  console.log('Сервер запущен на порту 3000');
});