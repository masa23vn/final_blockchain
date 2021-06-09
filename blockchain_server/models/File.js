const fs = require('fs');

const saveToFile = (blockchain, filename) => {
    try {
        fs.writeFileSync(filename, JSON.stringify(blockchain));
    } catch (err) {
        console.log(err)
    }
}

const readFromFile = (filename) => {
    try {
        const file = fs.readFileSync(filename, 'utf8')
        if (file === '') {
            return null
        }
        const data = JSON.parse(file);
        return data
    } catch (err) {
        console.log(err)
        return null
    }
}


module.exports = {
    saveToFile,
    readFromFile,
};