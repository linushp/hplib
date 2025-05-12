"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const prefix_classname_1 = require("./prefix-classname");
const classNames = (0, prefix_classname_1.getPrefixClassNames)("abc");
const App = () => {
    return react_1.default.createElement("div", { className: classNames("root") }, "\u5B9E\u9645\u4F7F\u7528\u7684className\u4E3A\uFF1Aabc-root");
};
//# sourceMappingURL=demo.js.map