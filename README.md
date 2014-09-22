codeRecord
==========

based on CodeMirror https://github.com/marijnh/CodeMirror

Do: recording user-written code process, according of the real process for playback

Demo: http://www.wenryxu.com/coderecord

==========

基于著名的 CodeMirror https://github.com/marijnh/CodeMirror 实现的功能。

解决的问题：记录用户编写代码的过程，按照真实过程的时间间隔进行回放。

能够实现大部分文本编辑器支持的操作。

支持中文，但不记录在输入法中的过程。通过了 Windows 平台（Windows 8）下的微软拼音、QQ输入法、搜狗输入法、百度输入法和 Linux 平台下 iBus 输入法引擎的测试。但并非完美支持。

回放区域设为只读，只允许改变光标位置（反正我每次都会先设置光标位置再回放）。

实际解决的需求：以增加作弊复杂程度的方式预防作弊（主要体现在在线笔试、考试等。有效避免学生 copy 完整代码后修改变量名这类作弊行为，但如果用户对照着别人的代码手动码一份就没有办法了 —— 所以这只是增加了作弊的复杂程度，而不能完全预防作弊）。

将作为 计蒜客 http://www.jisuanke.com/ 的一个功能组件使用，暂未上线。

线上Demo：http://www.wenryxu.com/coderecord
