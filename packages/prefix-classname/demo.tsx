import React from "react";
import { getPrefixClassNames } from "./prefix-classname";

const classNames = getPrefixClassNames("abc");

const App = () => {
  return <div className={classNames("root")}>实际使用的className为：abc-root</div>;
};
