/**
 * Created by WenryXu on 2014/9/5 0005.
 */
/*
 已知问题：不支持中文输入
 */
/*
 录制
 */
var i = 0, j = 0, indent = 0;
var time, beginTime, word, beginWord, action, select, beginLine;
var record = [];
var cu1, cu2;

/*
 将两个textarea渲染成了CodeMirror对象，均显示行号
 回放框设置只读
 */
var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true
});
var reeditor = CodeMirror.fromTextArea(document.getElementById("re"), {
    lineNumbers: true,
    readOnly: true
});

/*
 给输入文本框焦点
 */
editor.focus();

/*
 事件：光标活动
 */
editor.on("cursorActivity", function () {
    /*
     获取进行操作的光标位置 pos 和 当前发生时间的相对时间
     */
    var pos = editor.getCursor();
    var date = new Date();
    /*
     初始化第一次操作，设置开始时间为 0
     文本区首次操作是插入操作
     文本区默认为空
     */
    if ( i == 0 ) {
        beginTime = date.getTime();
        time = 0;
        word = editor.getValue();
        action = "insert";
        cu1 = editor.getCursor();
        beginLine = editor.lineCount();
    }
    else {
        word = editor.getValue();
        /*
         计算此次操作的时间与上次操作的时间的差，为时间间隔time
         为下次操作提供其上次操作时间beginTime
         */
        time = date.getTime() - beginTime;
        beginTime = date.getTime();
        cu2 = editor.getCursor();

        if ( word == "" ) {
            action = "clean";
        }

        /*
         判断退格行为（action：backspace）
         如果当前文本区内容长度小于上次操作时文本区内容长度，说明进行了退格操作
         backspace直接操作时，操作内容 word 为空
         */
        if ( word.length < beginWord.length ) {
            word = "";
            action = "backspace";
            /*
             获取当前位置光标cu
             若该位置与前一位置间存在内容，说明是选择后的文本被新输入的文本所覆盖
             操作内容 word 为新插入的内容
             */
            var cu = editor.getCursor();
            if ( editor.getRange(CodeMirror.Pos(cu.line, cu.ch - 1), cu ) != "" ) {
                word = editor.getRange(CodeMirror.Pos(cu.line, cu.ch - 1), cu);
            }
        }
        /*
         判断换行行为（action：enter）
         如果当前操作位置的行号大于上一操作位置的行号，说明进行了换行操作
         换行操作的操作内容 word 为换行符 \\n
         */
        else if ( editor.lineCount() > beginLine ) {
            word = "\\n";
            action = "enter";
            indent = editor.getCursor().ch;
        }
        else {
            /*
             判断输入行为（action：insert）
             如果当前文本区内容 word 与上一次操作结束时的内容 beginWord 不同，说明进行了输入操作
             操作内容 word 为当前位置光标 cu2 与上次操作后的光标位置 cu1 之间的内容
             可以处理粘贴操作
             */
            if ( word != beginWord ) {
                word = editor.getRange(cu1, cu2);
                /*
                 处理覆盖从前向后选择的内容时无法获取 insert 的 content
                 */
                if ( word == "" ) {
                    word = editor.getRange(CodeMirror.Pos(cu1.line, cu1.ch - 1), cu2);
                }
                action = "insert";
            }
            /*
             判断移动光标的行为（action：move）
             如果当前文本区内容 word 与上一次操作结束时的内容 beginWord 相同，判定为移动光标的行为
             */
            else {
                word = "";
                action = "move";
            }
        }
    }

    /*
     判断选择行为（action：selected）
     如果能够获取到选择内容，行为则为选择
     select 为所选内容
     操作内容为空
     */
    select = editor.getSelection();
    if ( select != "" ) {
        action = "selected";
        word = "";
    }

    /*
     JSON
     line：当前操作位置行号；ch：当前行操作位置；content：当前操作的内容；
     onTime：与上一次操作的相对时间间隔；action：进行的操作代号；select：被选中的内容
     */
    record.push({"line": pos.line, "ch": pos.ch, "content": word, "onTime": time, "action": action, "select": select, "indent": indent});
    console.log(record[i]);
    /*
     提供给下一轮循环使用的变量
     */
    cu1 = editor.getCursor();
    beginWord = editor.getValue();
    beginLine = editor.lineCount();
    i++;
});

/*
 回放，递归
 */
function replay() {
    reeditor.focus();
    /*
     初始化回放文本区
     */
    if ( j == 0 ) {
        reeditor.setValue(record[j].content);
        reeditor.setCursor(CodeMirror.Pos(record[j].line, record[j].ch));
        j++;
        replay();
    }
    else if ( j < i ) {
        /*
         延时回放
         以当前操作的间隔时间 onTime 作为延时时间
         */
        setTimeout(function () {
            /*
             处理 insert 活动
             */
            if ( record[j].action == "insert" ) {
                reeditor.replaceSelection("");
                if ( record[j - 1].action == "selected" && record[j - 1].ch >= record[j].ch ) {
                    reeditor.replaceRange(record[j].content, CodeMirror.Pos(record[j - 1].line, record[j - 1].ch - 1),
                        CodeMirror.Pos(record[j - 1].line, record[j - 1].ch - 1));
                }
                else {
                    reeditor.replaceRange(record[j].content, CodeMirror.Pos(record[j - 1].line, record[j - 1].ch),
                        CodeMirror.Pos(record[j - 1].line, record[j - 1].ch));
                }
            }
            /*
             处理 enter 活动
             */
            else if ( record[j].action == "enter" ) {
                reeditor.replaceSelection("");
                reeditor.replaceRange("\n", CodeMirror.Pos(record[j].line, record[j].ch),
                    CodeMirror.Pos(record[j].line, record[j].ch));
                if ( record[j].indent != 0 ) {
                    for ( var c = 0; c < record[j].indent; c++ ) {
                        reeditor.replaceRange(" ", reeditor.getCursor(), reeditor.getCursor());
                    }
                }
                reeditor.setCursor(CodeMirror.Pos(record[j].line, record[j].ch + record[j].indent));
            }
            /*
             处理 move 活动
             */
            else if ( record[j].action == "move" ) {
                /*
                 使用 backspace 删除文本区内容时，若最终清空了文本区，会判定为 move 活动
                 */
                reeditor.setValue(reeditor.getValue());
                reeditor.setCursor(CodeMirror.Pos(record[j].line, record[j].ch));
            }
            /*
             处理 backspace 活动
             */
            else if ( record[j].action == "backspace" ) {
                /*
                 如果没有选中任何内容，则删除前面的一个字符
                 */
                if ( record[j - 1].action != "selected" ) {
                    reeditor.replaceRange("", CodeMirror.Pos(record[j - 1].line, record[j - 1].ch),
                        CodeMirror.Pos(record[j].line, record[j].ch));
                    reeditor.setCursor(CodeMirror.Pos(record[j].line, record[j].ch));
                }
                /*
                 若当前存在选中的内容，则删除选中的内容
                 */
                else {
                    reeditor.replaceSelection(record[j].content);
                    reeditor.setCursor(CodeMirror.Pos(record[j].line, record[j].ch));
                }
            }
            /*
             处理 selected 活动
             */
            else if ( record[j].action == "selected" ) {
                /*
                 如果选中的内容与文本区所有内容相同，则选中文本区的全部内容
                 */
                if ( record[j].select == reeditor.getValue() ) {
                    reeditor.setSelection(CodeMirror.Pos(reeditor.firstLine(), 0), CodeMirror.Pos(reeditor.lastLine()));
                }
                /*
                 如果只是选中了一部分内容
                 */
                else {
                    if ( record[j - 1].action != "selected" ) {
                        if ( record[j - 1].line >= record[j].line && record[j - 1].ch >= record[j].ch ) {
                            reeditor.setSelection(CodeMirror.Pos(record[j].line, record[j].ch),
                                CodeMirror.Pos(record[j - 1].line, record[j - 1].ch));
                        }
                        else {
                            reeditor.setSelection(CodeMirror.Pos(record[j - 1].line, record[j - 1].ch),
                                CodeMirror.Pos(record[j].line, record[j].ch));
                        }
                    }
                    else {
                        if ( record[j - 1].line >= record[j].line && record[j - 1].ch >= record[j].ch ) {
                            reeditor.addSelection(CodeMirror.Pos(record[j].line, record[j].ch),
                                CodeMirror.Pos(record[j - 1].line, record[j - 1].ch));
                        }
                        else {
                            reeditor.addSelection(CodeMirror.Pos(record[j - 1].line, record[j - 1].ch),
                                CodeMirror.Pos(record[j].line, record[j].ch));
                        }
                    }
                    /*
                    处理三击选中行
                     */
                    if ( record[j].select != reeditor.getSelection() && record[j + 1].action == "selected" ) {
                        j++;
                        if ( record[j].select == reeditor.getLine(record[j].line - 1) + "\n" ) {
                            reeditor.setSelection(CodeMirror.Pos(record[j].line - 1, 0),
                                CodeMirror.Pos(record[j].line, 0));
                        }
                    }
                    /*
                    处理双击选中单词
                     */
                    else if ( record[j].select != reeditor.getSelection() && record[j - 1].action == "move" ) {
                        var ch1 = record[j - 1].ch;
                        for ( ; ; ) {
                            var gs = reeditor.getSelection();
                            if ( gs[0] == " " ) {
                                break;
                            }
                            if ( ch1 == 0 ) {
                                break;
                            }
                            reeditor.addSelection(CodeMirror.Pos(record[j - 1].line, ch1--),
                                CodeMirror.Pos(record[j - 1].line, ch1 + 1));
                        }
                        reeditor.setSelection(CodeMirror.Pos(record[j].line, ch1 + 2),
                            CodeMirror.Pos(record[j].line, record[j].ch));
                    }
                }
            }
            j++;
            if ( j >= i ) {
                return ;
            }
            else {
                replay();
            }
        }, parseInt(record[j].onTime));
    }
}