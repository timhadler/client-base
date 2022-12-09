xlsx = require("xlsx");

// Reads data from a file in excel (table data), only reads first excel sheet
// Returns list of objects representing rows in excel table
// Options: require mandatory headers be present in table by providing mandatoryHeaders (list of strings)
exports.readData = function(fileName, filePath, mandatoryHeaders=[]) {
    // Verifying file type
    const acceptedFileTypes = ['xlsx', 'csv', 'xlsm'];
    if (!acceptedFileTypes.includes(fileName.split('.')[1])) {
        throw new Error("Incorrect file type - must be 'xlsx', 'csv', or 'xlsm'");
    }

    const workbook = xlsx.readFile(filePath);
    const SheetNames = workbook.SheetNames;
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[SheetNames[0]], {defval:""});

    // Verifying table has mandatory headers
    if (mandatoryHeaders.length > 0) {
        const containsAll = mandatoryHeaders.every(element => {
            return Object.getOwnPropertyNames(data[0]).includes(element);
        });
        if (!containsAll) {
            throw new Error("Missing mandatory headers");
        }
    }

    return data;
};

// Writes a list of objects to an excel table and saves it as a xlsx file
exports.writeTable = function(data, path) {
    if (data.length  == 0 || path.length == 0) {
        return null;
    }
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    xlsx.writeFile(wb, path);
};