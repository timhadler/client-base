// Objects
// Customer
export function Customer(id, name, cn, ea, add, sub, ci, pc, fa, n, a) {
    this.id = id;
    this.name = name;
    this.contactNumber = cn;
    this.email = ea;
    this.address = add;
    this.suburb = sub;
    this.city = ci;
    this.postCode = pc;
    this.freshAir = fa;
    this.notes = n;
    this.action = a;
}

// Call date
export function CallDate(id, customerId, date) {
    this.id = id;
    this.customerId = customerId;
    this.date = date;
    // Methods for changing date to next year etc
    // Get striong formats, define own date object
    this.getMonthInt = function() {
        return this.date.slice(5, 7);
    }
    this.getYearInt = function() {
        return this.date.slice(8, 10);
    }
    this.getMonth = function() {
        return getMonthText(parseInt(this.date.slice(5, 7)));
    }
}

// Returns the string text of a month given as an integer
function getMonthText(i) {
    var month;
    switch (i) {
        case 1:
            month = "January";
            break;
        case 2:
            month = "February";
            break;
        case 3:
            month = "March";
            break;
        case 4:
            month = "April";
            break;
        case 5:
            month = "May";
            break;
        case 6:
            month = "June";
            break;
        case 7:
            month = "July";
            break;
        case 8:
            month = "August";
            break;
        case 9:
            month = "Septemeber";
            break;
        case 10:
            month = "October";
            break;
        case 11:
            month = "November";
            break;
        case 12:
            month = "December";
            break;
    }
    return month;
}