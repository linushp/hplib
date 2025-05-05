var { Aes128CBC } = require("../libs/node-aes-utils");

async function test() {
  const utils = new Aes128CBC("e3f9d86f1c2e834ef5bd7f25f51da093");
  let input = Buffer.from([12, 34, 56, 32, 43, 23, 34]);

  console.log('1. input',input);
  let a = await utils.encrypt(input);
  console.log('1. encrypt',new Uint8Array(a));
  let b = await utils.decrypt(a);
  console.log('1. decrypt',new Uint8Array(b));

  input = 'hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️hello你好☹️'
  console.log('2. input',input);
  a = await utils.time_encrypt_utf8_base64(input);
  console.log('2. encrypt', a);
  b = await utils.time_decrypt_base64_utf8(a);
  console.log('3. decrypt', b);


}

test();
