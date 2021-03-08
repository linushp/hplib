 # AES 128 CBC 库
 
## 特点

1. 极小，无任何第三方依赖
2. 统一的API ，支持node和wed端
3. 利用web和node提供的原生API实现

## 使用


```javascript

import {Aes128CBC} from 'aes-128-cbc';

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


```

