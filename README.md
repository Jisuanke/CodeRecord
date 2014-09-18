codeRecord
==========

基于著名的 CodeMirror https://github.com/marijnh/CodeMirror 实现的功能。

解决的问题：记录用户编写代码的过程，按照真实过程的时间间隔进行回放。

能够实现大部分文本编辑器支持的操作，包括但不限于：插入，删除，选中等。

支持中文，但不记录在输入法中的过程，勉强算作完美支持。

回放区域设为只读，只允许改变光标位置（反正我每次都会先设置光标位置再回放）。

实际解决的需求：以增加作弊复杂程度的方式预防作弊（主要体现在在线笔试、考试等。有效避免学生 copy 完整代码后修改变量名这类作弊行为，但如果用户对照着别人的代码手动码一份就没有办法了 —— 所以这只是增加了作弊的复杂程度，而不能完全预防作弊）

将作为 计蒜客 http://www.jisuanke.com/ 的一个功能组件使用，暂未上线。
