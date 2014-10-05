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
    if ( e.keyCode == 229) {
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
    action = "i";
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
        action = "b";
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
            action = "i";
        }
        /*
         action: move
         */
        else {
            word = "";
            action = "m";
        }
    }
    /*
     action: selected
     */
    select = editor.getSelection();
    if (select !== "") {
        action = "s";
        word = "";
    }

    /*
     JSON
     */
    if (ime_on == false) {
        record.push({"l": pos.line, "n": pos.ch, "c": word, "t": time, "a": action, "s": select, "i": indent});
        console.log(record[i]);
        i++;
        cu1 = editor.getCursor();
    }

    beginWord = editor.getValue();
    beginLine = editor.lineCount();
});

function save() {
    var pos = editor.getCursor();
    if (i === 0) {
        cu1 = 0;
    }
    if (cu1 != pos) {
        if ( i == 0 ) {
            time = 0;
        }
        record.push({"l": pos.line, "n": pos.ch, "c": word, "t": time, "a": action, "s": select, "i": indent});
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
        reeditor.setValue(record[j].c);
        reeditor.setCursor(CodeMirror.Pos(record[j].l, record[j].n));
        j++;
        replay();
    }
    else if (j < i) {

        setTimeout(function () {
            /*
             action: insert
             */
            if (record[j].a == "i") {
                reeditor.replaceSelection("");
                if (record[j - 1].a == "s" && record[j - 1].n >= record[j].n) {
                    reeditor.replaceRange(record[j].c, CodeMirror.Pos(record[j - 1].l, record[j - 1].n - 1),
                        CodeMirror.Pos(record[j - 1].l, record[j - 1].n - 1));
                }
                else {
                    reeditor.replaceRange(record[j].c, CodeMirror.Pos(record[j - 1].l, record[j - 1].n),
                        CodeMirror.Pos(record[j - 1].l, record[j - 1].n));
                }
            }
            /*
             action: newline
             */
            else if (record[j].a == "n") {
                reeditor.replaceSelection("");
                reeditor.replaceRange("\n", CodeMirror.Pos(record[j].l, record[j].n),
                    CodeMirror.Pos(record[j].l, record[j].n));
                if (record[j].i !== 0) {
                    for (var c = 0; c < record[j].i; c++) {
                        reeditor.replaceRange(" ", reeditor.getCursor(), reeditor.getCursor());
                    }
                }
                reeditor.setCursor(CodeMirror.Pos(record[j].l, record[j].n + record[j].i));
            }
            /*
             action: move
             */
            else if (record[j].a == "m") {
                reeditor.setValue(reeditor.getValue());
                reeditor.setCursor(CodeMirror.Pos(record[j].l, record[j].n));
            }
            /*
             action: backspace
             */
            else if (record[j].a == "b") {

                if (record[j - 1].a != "s") {
                    reeditor.replaceRange("", CodeMirror.Pos(record[j - 1].l, record[j - 1].n),
                        CodeMirror.Pos(record[j].l, record[j].n));
                    reeditor.setCursor(CodeMirror.Pos(record[j].l, record[j].n));
                }

                else {
                    reeditor.replaceSelection(record[j].c);
                    reeditor.setCursor(CodeMirror.Pos(record[j].l, record[j].n));
                }
            }
            /*
             action: selected
             */
            else if (record[j].a == "s") {
                if (record[j].s == reeditor.getValue()) {
                    reeditor.setSelection(CodeMirror.Pos(reeditor.firstLine(), 0), CodeMirror.Pos(reeditor.lastLine()));
                }

                else {
                    if (record[j - 1].a != "s") {
                        if (record[j - 1].l >= record[j].l && record[j - 1].n >= record[j].n) {
                            reeditor.setSelection(CodeMirror.Pos(record[j].l, record[j].n),
                                CodeMirror.Pos(record[j - 1].l, record[j - 1].n));
                        }
                        else {
                            reeditor.setSelection(CodeMirror.Pos(record[j - 1].l, record[j - 1].n),
                                CodeMirror.Pos(record[j].l, record[j].n));
                        }
                    }
                    else {
                        if (record[j - 1].l >= record[j].l && record[j - 1].n >= record[j].n) {
                            reeditor.addSelection(CodeMirror.Pos(record[j].l, record[j].n),
                                CodeMirror.Pos(record[j - 1].l, record[j - 1].n));
                        }
                        else {
                            reeditor.addSelection(CodeMirror.Pos(record[j - 1].l, record[j - 1].n),
                                CodeMirror.Pos(record[j].l, record[j].n));
                        }
                    }

                    if (record[j].s != reeditor.getSelection() && record[j + 1].a == "s") {
                        j++;
                        if (record[j].s == reeditor.getLine(record[j].l)) {
                            reeditor.setSelection(CodeMirror.Pos(record[j].l, 0),
                                CodeMirror.Pos(record[j].l, record[j].s.length));
                        }
                        else if ( record[j].s == reeditor.getLine(record[j].l - 1) + "\n" ) {
                            reeditor.setSelection(CodeMirror.Pos(record[j].l - 1, 0),
                                CodeMirror.Pos(record[j].l, 0));
                        }
                    }

                    else if (record[j].s != reeditor.getSelection() && record[j - 1].a == "m") {
                        var ch1 = record[j - 1].n;
                        for (; ;) {
                            if (reeditor.getSelection() == record[j].s) {
                                break;
                            }
                            reeditor.setSelection(CodeMirror.Pos(record[j - 1].l, ch1--),
                                CodeMirror.Pos(record[j].l, record[j].n));
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
        }, parseInt(record[j].t));
    }
}