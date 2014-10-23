/**
 * Created by WenryXu on 2014/9/5 0005.
 */
/*
 recording
 */
var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true
});
var reeditor = CodeMirror.fromTextArea(document.getElementById("re"), {
    lineNumbers: true,
    readOnly: true
});

var i = 0, j = 0, indent = 0;
var time, beginTime, word, beginWord, action, select, beginLine;
var record = [];
var cu1, cu2;
var pos = editor.getCursor();
var date = new Date();
var ime_on = false;

/*
 fuck IME
 event: keydown
 */
editor.on("keydown", function (obj, e) {
    if ( e.keyCode == 229 ) {
        ime_on = true;
    }
    else {
        ime_on = false;
    }
});

/*
 initialization
 */
if (i === 0) {
    beginTime = date.getTime();
    time = 0;
    beginWord ="";
    word = editor.getValue();
    action = "insert";
    cu1 = editor.getCursor();
    beginLine = editor.lineCount();
}

/*
 event: cursorActivity
 */
editor.on("cursorActivity", function () {
    pos = editor.getCursor();
    date = new Date();
    word = editor.getValue();
    time = date.getTime() - beginTime;
    beginTime = date.getTime();
    cu2 = editor.getCursor();

    /*
     action: backspace
     */
    if (word.length < beginWord.length) {
        word = "";
        action = "backspace";
        var cu = editor.getCursor();
        if (editor.getRange(CodeMirror.Pos(cu.line, cu.ch - 1), cu) !== "") {
            word = editor.getRange(CodeMirror.Pos(cu.line, cu.ch - 1), cu);
        }
    }
    /*
     action: insert
     */
    else {
        if (word != beginWord) {
            if ( i != 0 ) {
                word = editor.getRange(cu1, cu2);
            }
            if (word === "") {
                word = editor.getRange(CodeMirror.Pos(cu1.line, cu1.ch - 1), cu2);
            }
            action = "insert";
        }
        /*
         action: move
         */
        else {
            word = "";
            action = "move";
        }
    }
    /*
     action: selected
     */
    select = editor.getSelection();
    if (select !== "") {
        action = "selected";
        word = "";
    }

    /*
     JSON
     */
    if (ime_on == false) {
        record.push({"line": pos.line, "ch": pos.ch, "content": word, "onTime": time, "action": action, "select": select, "indent": indent});
        console.log(record[i]);
        i++;
        cu1 = editor.getCursor();
    }

    beginWord = editor.getValue();
    beginLine = editor.lineCount();
});

function save() {
    var pos = editor.getCursor();
    if (cu1 != pos) {
        record.push({"line": pos.line, "ch": pos.ch, "content": word, "onTime": time, "action": action, "select": select, "indent": indent});
        console.log(record[i]);
        i++;
    }
}

function play() {
    save();
    replay();
}

/*
 playback
 */
function replay() {
    reeditor.focus();

    if (j === 0) {
        reeditor.setValue(record[j].content);
        reeditor.setCursor(CodeMirror.Pos(record[j].line, record[j].ch));
        j++;
        replay();
    }
    else if (j < i) {

        setTimeout(function () {
            /*
             action: insert
             */
            if (record[j].action == "insert") {
                reeditor.replaceSelection("");
                if (record[j - 1].action == "selected" && record[j - 1].ch >= record[j].ch) {
                    reeditor.replaceRange(record[j].content, CodeMirror.Pos(record[j - 1].line, record[j - 1].ch - 1),
                        CodeMirror.Pos(record[j - 1].line, record[j - 1].ch - 1));
                }
                else {
                    reeditor.replaceRange(record[j].content, CodeMirror.Pos(record[j - 1].line, record[j - 1].ch),
                        CodeMirror.Pos(record[j - 1].line, record[j - 1].ch));
                }
            }
            /*
             action: enter
             */
            else if (record[j].action == "enter") {
                reeditor.replaceSelection("");
                reeditor.replaceRange("\n", CodeMirror.Pos(record[j].line, record[j].ch),
                    CodeMirror.Pos(record[j].line, record[j].ch));
                if (record[j].indent !== 0) {
                    for (var c = 0; c < record[j].indent; c++) {
                        reeditor.replaceRange(" ", reeditor.getCursor(), reeditor.getCursor());
                    }
                }
                reeditor.setCursor(CodeMirror.Pos(record[j].line, record[j].ch + record[j].indent));
            }
            /*
             action: move
             */
            else if (record[j].action == "move") {
                reeditor.setValue(reeditor.getValue());
                reeditor.setCursor(CodeMirror.Pos(record[j].line, record[j].ch));
            }
            /*
             action: backspace
             */
            else if (record[j].action == "backspace") {

                if (record[j - 1].action != "selected") {
                    reeditor.replaceRange("", CodeMirror.Pos(record[j - 1].line, record[j - 1].ch),
                        CodeMirror.Pos(record[j].line, record[j].ch));
                    reeditor.setCursor(CodeMirror.Pos(record[j].line, record[j].ch));
                }

                else {
                    reeditor.replaceSelection(record[j].content);
                    reeditor.setCursor(CodeMirror.Pos(record[j].line, record[j].ch));
                }
            }
            /*
             action: selected
             */
            else if (record[j].action == "selected") {
                if (record[j].select == reeditor.getValue()) {
                    reeditor.setSelection(CodeMirror.Pos(reeditor.firstLine(), 0), CodeMirror.Pos(reeditor.lastLine()));
                }

                else {
                    if (record[j - 1].action != "selected") {
                        if (record[j - 1].line >= record[j].line && record[j - 1].ch >= record[j].ch) {
                            reeditor.setSelection(CodeMirror.Pos(record[j].line, record[j].ch),
                                CodeMirror.Pos(record[j - 1].line, record[j - 1].ch));
                        }
                        else {
                            reeditor.setSelection(CodeMirror.Pos(record[j - 1].line, record[j - 1].ch),
                                CodeMirror.Pos(record[j].line, record[j].ch));
                        }
                    }
                    else {
                        if (record[j - 1].line >= record[j].line && record[j - 1].ch >= record[j].ch) {
                            reeditor.addSelection(CodeMirror.Pos(record[j].line, record[j].ch),
                                CodeMirror.Pos(record[j - 1].line, record[j - 1].ch));
                        }
                        else {
                            reeditor.addSelection(CodeMirror.Pos(record[j - 1].line, record[j - 1].ch),
                                CodeMirror.Pos(record[j].line, record[j].ch));
                        }
                    }

                    if (record[j].select != reeditor.getSelection() && record[j + 1].action == "selected") {
                        j++;
                        if (record[j].select == reeditor.getLine(record[j].line)) {
                            reeditor.setSelection(CodeMirror.Pos(record[j].line, 0),
                                CodeMirror.Pos(record[j].line, record[j].select.length));
                        }
                        else if ( record[j].select == reeditor.getLine(record[j].line - 1) + "\n" ) {
                            reeditor.setSelection(CodeMirror.Pos(record[j].line - 1, 0),
                                CodeMirror.Pos(record[j].line, 0));
                        }
                    }

                    else if (record[j].select != reeditor.getSelection() && record[j - 1].action == "move") {
                        var ch1 = record[j - 1].ch;
                        for (; ;) {
                            if (reeditor.getSelection() == record[j].select) {
                                break;
                            }
                            reeditor.setSelection(CodeMirror.Pos(record[j - 1].line, ch1--),
                                CodeMirror.Pos(record[j].line, record[j].ch));
                        }
                    }
                }
            }
            j++;
            if (j >= i) {
                return;
            }
            else {
                replay();
            }
        }, parseInt(record[j].onTime));
    }
}