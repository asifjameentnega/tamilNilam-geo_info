const premises_photo_image = (async(event) => {
  const { file } = event.files;
  console.log(event.files);
  // No files selected
  if (!event.files.length) return;

  // We'll store the files in this data transfer object
  const dataTransfer = new DataTransfer();

  // For every file in the files list
  for (const file of event.files) {
      // We don't have to compress files that aren't images
      if (!file.type.startsWith('image')) {
          // Ignore this file, but do add it to our result
          dataTransfer.items.add(file);
          continue;
      }

      // We compress the file by 50%
      const compressedFile = await compressImage(file, {
          quality: 0.5,
          type: 'image/jpeg',
      });

      // Save back the compressed file instead of the original file
      dataTransfer.items.add(compressedFile);
  }
  event.files = dataTransfer.files;  
  console.log(event.files);

  //console.log($(event).parent().parent().prev().find('.capture-img'))
  var geolocation = JSON.parse(window.localStorage.getItem('geolocation'));
    photo_altitude = geolocation.altitude;
    $('#house_photo_latitude').val(geolocation.latitude.toFixed(6))
    $('#house_photo_longitude').val(geolocation.longitude.toFixed(6));
    //$('#photo_altitude').val(photo_altitude);
    window.addEventListener('deviceorientation', function(event) {
        photo_orientation = event.alpha.toFixed(3) + ',' + event.beta.toFixed(3) + ',' + event.gamma.toFixed(3);
        if(photo_capture_flag==false)
        {
            $('#photo_orientation').val(photo_orientation);
            //$('#photo_orientation_view').text(photo_orientation);
            $('#photo_orientation_x').val(event.alpha.toFixed(3))
            $('#photo_orientation_y').val(event.beta.toFixed(3))
            $('#photo_orientation_z').val(event.gamma.toFixed(3))
            photo_capture_flag = true;
        }
    });
    var d = new Date();
    var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    var date = year + "-" + month + "-" + day;
    $('#attachment_dt').val(date+" "+time);

    var file1 = document.querySelector('#photos').files[0];
    //console.log(file1);
    if (file1) {
       premises_building.src = URL.createObjectURL(file1)
       $('#premises_building').removeClass('d-none');
    }
});
/*START : Image compress*/
const compressImage = async (file, { quality = 1, type = file.type }) => {
    // Get as image data
    const imageBitmap = await createImageBitmap(file);

    // Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, 0, 0);

    // Turn into Blob
    const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, type, quality)
    );

    // Turn Blob into File
    return new File([blob], file.name, {
        type: blob.type,
    });
};