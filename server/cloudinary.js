const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
    cloud_name: 'dktbekip1', 
    api_key: '748448173573562', 
    api_secret: 'ug60769b6Cn7FvlpTmkzjNJ-zrQ' 
  });

  module.exports=cloudinary;