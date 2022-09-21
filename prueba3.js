const fs = require('fs');

let newObject = [{
    nombre: "juan",
    edad: 5,
    aficion: "tenis",
}];

let data = JSON.stringify(newObject);
fs.writeFileSync("bd.json",data);


let data2 = fs.readFileSync("bd.json");
data2 = JSON.parse(data2);

newObject = {
    nombre: "pedro",
    edad: 20,
    aficion: "futbol",
};

data2.push(newObject);
data2 = JSON.stringify(data2);
fs.writeFileSync("bd.json",data2);


let data3 = fs.readFileSync("bd.json");
data3 = JSON.parse(data3);
console.log(data3);

