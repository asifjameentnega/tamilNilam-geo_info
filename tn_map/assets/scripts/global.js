var config = {
    tamil_nilam_url: 'https://tngis.tnega.org/tamilnilam_api',
    aregcheck: 'https://tngis.tnega.org/generic_api',

    app_key: 'tn@mapapp',
    app_name: 'tn@mapapp',

    otp_app_key: 'oTp$%^&!@',
    otp_app_name: 'oTp$%^&!@'
}



// // config indexdb;

// let db = null;
// let request = indexedDB.open('location', 1);

// request.onerror = function (event) {
//     console.log('Error opening database:', event.target.error.name);
// };


// request.onsuccess = function (event) {
//     db = event.target.result;
//     console.log('Database opened successfully');

//     // Insert dummy data into 'district'
//     let tx = db.transaction('district', 'readwrite');
//     let districtStore = tx.objectStore('district');

//     districtStore.add({
//         district_code: 101,
//         district_name: 'Thiruvananthapuram',
//         district_lgd_code: 'TVPM001'
//     });

//     districtStore.add({
//         district_code: 102,
//         district_name: 'Chennai',
//         district_lgd_code: 'CHEN002'
//     });

//     districtStore.add({
//         district_code: 103,
//         district_name: 'Bengaluru',
//         district_lgd_code: 'BLRU003'
//     });

//     tx.oncomplete = () => console.log('Dummy districts added');
//     tx.onerror = (e) => console.error('Error adding districts:', e);
// };

// request.onupgradeneeded = function (event) {
//     var db = event.target.result;

//     var storeDistrict = db.createObjectStore('district', {
//         keyPath: 'id',
//         autoIncrement: true
//     });

//     // Assuming each district record has a `districtName` property
//     storeDistrict.createIndex('districtName', 'districtName', { unique: false });
// };










