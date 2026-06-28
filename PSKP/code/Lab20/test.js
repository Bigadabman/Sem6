//1
let a = 5; //number
let name = "Name"; //string
let i = 0; // number
let double = 0.23; // number
let result = 1 / 0; // number
let answer = true; // boolean
let no = null; //object

console.log("typeof a:", typeof a);
console.log("typeof name:", typeof name);
console.log("typeof i:", typeof i);
console.log("typeof double:", typeof double);
console.log("typeof result:", typeof result);
console.log("typeof answer:", typeof answer);
console.log("typeof no:", typeof no);


//2
let totalSquare = 45 * 21;
let squareArea = 5 * 5;
let squareAmount = Math.floor(totalSquare / squareArea);

console.log("Всего поместиться квадратов: ", squareAmount);


//3

i = 2;
a = ++i; // 3
let b = i++; // 3

console.log("a=b?: ", a == b)


//4

console.log("Котик >= котик?: ", "Котик" >= "котик" ? "да" : "нет");
console.log("Котик >= китик?: ", "Котик" >= "китик" ? "да" : "нет");
console.log("Кот >= Котик?: ", "Кот" >= "Котик" ? "да" : "нет");
console.log("Привет >= Пока?: ", "Привет" >= "Пока" ? "да" : "нет");
console.log("73 >= '53'?: ", 73 >= '53' ? "да" : "нет");
console.log("false >= 0?: ", false >= 0 ? "да" : "нет");
console.log("54 >= true?: ", 54 >= true ? "да" : "нет");
console.log("123 >= false?: ", 123 >= false ? "да" : "нет");
console.log("true >= '3'?: ", true >= "3" ? "да" : "нет");
console.log("3 >= '5мм'?: ", 3 >= '5мм');
console.log("8 >= '-2'?: ", 8 >= '-2');
console.log("34 >= '34': ", 34 >= '34' ? "да" : "нет");
console.log("null == undefined?: ", null == undefined ? "да" : "нет");

let string = prompt("Задание 5", "Введите имя");
string = string.toLowerCase();

if (string == "марина" || string == "марина федоровна" || string == "кудлацкая марина федоровна") alert("Данные введены верно");
else alert("Данные введены неверно");


//6

let mathExam = true;
let rusExam = true;
let engExam = true;

if (mathExam && rusExam && engExam) console.log("Студент переведен");
else if (mathExam || rusExam || engExam) console.log("Студента ждет пересдача");
else console.log("студента отчислят");

// 7

console.log("true + true = ", true + true);
console.log("0 + '5' = ", 0 + '5');
console.log("5 + 'мм' = ", 5 + 'мм');
console.log("8 / infinity = ", 8 / Infinity);
console.log("9 * '\\n9' = ", 9 * '\n9');
console.log("null - 1 = ", null - 1);
console.log("'5' - 2 = ", '5' - 2);
console.log("'5px' - 3 = ", '5px' - 3);
console.log("true - 3 = ", true - 3);
console.log("7 || 0 = ", 7 || 0);


//8

for (let i = 1; i < 11; i++) {
    console.log(i % 2 == 0 ? i + 2 : i + 'мм');
}


// 9 

let daysOfWeek = { 1: "пн", 2: "вт", 3: "ср", 4: "чт", 5: "пт", 6: "сб", 7: "вс" }
let arrDays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"]
let dayNumber = prompt("Задание 9", "Введите номер дня недели")

if (dayNumber >= 1 && dayNumber <= 7) {

    console.log(`Это ${daysOfWeek[dayNumber]}`);
    console.log(`Это `, arrDays[dayNumber - 1]);
}
else {
    alert("День введен неверно");
}


// 10 

function concatNums(a, b, c) {

    if (a == undefined) {
        a = "По умолчанию";
    }

    return a + b + c;
}

console.log("Результат concatNums: ", concatNums(undefined, 2, prompt("Задание 10", "Введите строку")));


// 11 

function params(a, b) {
    if (a == b) {
        return 4 * a;
    }

    return a * b;
}


let params1 = function (a, b) {
    if (a == b) {
        return 4 * a;
    }

    return a * b;
}

let params2 = (a, b) => {
    if (a == b) {
        return 4 * a;
    }

    return a * b;
}