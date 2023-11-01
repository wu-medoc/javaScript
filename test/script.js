var name = prompt("your name is ?");
h1 = document.querySelector("h1");
h1.textContent = name;

var a=0.1;
var b=0.2;
var c=a+b;
cVal = document.querySelector(".c");
c1Val = document.querySelector(".c1");
cVal.textContent = c;
c1Val.textContent = a+b === 0.3;

var num = [1,2,3,4,5,6,7];
var result = num.reduce(function(sum,current){
  sum += current;
  return sum;
}, 0);
console.log(result);

const apiUrl = 'https://dog.ceo/api/breeds/image/random';
var dogButton = document.querySelector("#dogButton");
var dogButton1 = document.querySelector("#dogButton1");
var dogButton2 = document.querySelector("#dogButton2");
var dogButton3 = document.querySelector("#dogButton3");

function consoleAPI() {
  console.log(JSON.parse(this.response));
}
var getAPI = function() {
  var req = new XMLHttpRequest(); //傳統call api
  req.addEventListener('load', consoleAPI);
  req.open('get', apiUrl);
  req.send();
}
//promise call api
var getAPI1 = function() {
  fetch(apiUrl)
    .then(function(response) { return response.json() })
    .then(function(data) {
      console.log(data);
    })
}
var getAPI2 = function() {
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => console.log(data))
}

var dataArr = {};
var getAPI3 = () => {
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      dataArr = {dataArr, ...data}; //Object.assign(data) 
      console.log(dataArr);
    })
}

dogButton.onclick = () => getAPI();
dogButton1.onclick = () => getAPI1();
dogButton2.onclick = () => getAPI2();
dogButton3.onclick = () => getAPI3();