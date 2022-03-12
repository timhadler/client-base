var d1 = 0;
var d2 = 32;

exports.d1 = getDate(d1);
exports.d2 = getDate(d2);



// Gets the date n days from the current date (yyyy-mm-dd)
function getDate(n) {
    let date = new Date();
    date.setDate(date.getDate() + n);
    date = date.toISOString().slice(0, 10).replace('T', ' ');

    return date;
}
