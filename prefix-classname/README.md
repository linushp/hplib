## 跟classNames组件类似，但是会为每个className自动增加前缀。

主要用在开发公共组件时，需要前缀区分的时候


```typescript

import React from 'react';
import {getPrefixClassNames} from './prefix-classname';

const classNames = getPrefixClassNames('abc');


const App = ()=>{
    return (
        <div className={classNames('root')}>
            实际使用的className为：abc-root
        </div>
    );
}

```