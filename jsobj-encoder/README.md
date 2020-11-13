# jsobj-encoder

## description

> 将js对象转换成无特殊字符的字符串，内部使用base64实现，但去除了末尾的等于号
> 支持nodejs端和浏览器端调用


## install

```
   npm install @hplib/jsobj-encoder
   or
   yarn add @hplib/jsobj-encoder
```

## usage

``` javascript

        var str1 = jsobjEncoder.encodeObject({name:'你好zhang',age:30});
        console.log(str1);
        // JTdCJTIybmFtZSUyMiUzQSUyMiVFNCVCRCVBMCVFNSVBNSVCRHpoYW5nJTIyJTJDJTIyYWdlJTIyJTNBMzAlN0Q
        var obj1 = jsobjEncoder.decodeObject(str1);
        console.log(obj1);
        // { name: '你好zhang', age: 30 }

```