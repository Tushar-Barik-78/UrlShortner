// ! This is the example that shows the limitation in bcrypt

import bcrypt from "bcryptjs";
import argon2 from "argon2";


async function hashPassword(password) {
    // return await bcrypt.hash(password,10);
    return await argon2.hash(password);
}

async function verifyPassword(password,hashedPassword){
    // return await bcrypt.compare(password,hashedPassword);
    return await argon2.verify(hashedPassword,password);
}


const password1 = Array.from({length:96}).fill("x").join("");
const password2 = Array.from({length:90}).fill("x").join("")+Math.random();

console.log({password1,password2});


const hashedPassword1 = await hashPassword(password1);
const hashedPassword2 = await hashPassword(password2);


console.log("1 - 1", await verifyPassword(password1,hashedPassword1));
console.log("1 - 2", await verifyPassword(password1,hashedPassword2));
console.log("2 - 2", await verifyPassword(password2,hashedPassword2));
console.log("2 - 1", await verifyPassword(password2,hashedPassword1));




// ! using bcryptjs
// {
//   password1: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
//   password2: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0.5915383657707981'
// }
// 1 - 1 true
// 1 - 2 true
// 2 - 2 true
// 2 - 1 true


// ! using argon2
// {
//   password1: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
//   password2: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0.5915383657707981'
// }
// 1 - 1 true
// 1 - 2 false
// 2 - 2 true
// 2 - 1 false