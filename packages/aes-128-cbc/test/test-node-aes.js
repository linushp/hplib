var { Aes128CBC } = require("../libs/node-aes-utils");

async function test() {
  const utils = new Aes128CBC("e3f9d86f1c2e834ef5bd7f25f51da093");
  const input = Buffer.from([12, 34, 56, 32, 43, 23, 34]);
  console.log(input);
  const a = await utils.encrypt(input);
  console.log(a);
  const b = await utils.decrypt(a);
  console.log(b);
}

test();
