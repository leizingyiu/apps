const dict = {
    姓名: "name",
    电话: "phone",
    省名: "province",
    市名: "city",
    区名: "county",
    街名: "street",
    地址: "address",
    邮编: "zipCode",
    身份证: "idCard",
    省号: "provinceCode",
    市号: "cityCode",
    区号: "countyCode",
    街号: "streetCode"
};

const main = document.querySelector("main"),
    inputArea = document.getElementById("inputArea");

let settingP = document.createElement("p");
settingP.innerHTML = `<b>行顺序设置</b>： 请填入 ${Object.keys(dict).join(",")}，使用英文逗号分隔。\n`;
main.insertBefore(settingP, inputArea);

let settingInput = document.createElement("input");
settingInput.id = 'settingInput';
settingP.appendChild(settingInput);
// settingInput.value = Object.keys(dict).join(",");
settingInput.value = "姓名,电话,省名市名区名街名地址";
settingInput.style.display = "block";

let splitP = document.createElement("p");
splitP.innerHTML =
    "请选择输出分隔符，comma为英文逗号，tabs为制表符，选择input请在右侧填入<br>";

main.insertBefore(splitP, inputArea);

let splitSelector = document.createElement("select"),
    splitDict = {
        comma: ",",
        tabs: "\t",
        input: "input"
    };
"comma,tabs,input".split(",").map((k) => {
    let o = document.createElement("option");
    (o.value = splitDict[k]), (o.innerText = k);
    splitSelector.appendChild(o);
    if (k == 'tabs') { o.selected = true; }
});

let splitInput = document.createElement("input");
splitInput.value = "，";
splitInput.setAttribute("disabled", "true");

splitP.appendChild(splitSelector);
splitP.appendChild(splitInput);

const emptyText = "-";

let emptyP = document.createElement("p");
emptyP.innerText = "请填入空内容项的占位符";
main.insertBefore(emptyP, inputArea);

let emptyInput = document.createElement("input");
emptyInput.value = " ";
emptyP.appendChild(emptyInput);

let emptyCellP = document.createElement("p");
emptyCellP.innerText =
    "请填入空单元格的占位符。即上面设置的分隔符中，整段缺失才显示的字符";
main.insertBefore(emptyCellP, inputArea);

let emptyCellInput = document.createElement("input");
emptyCellInput.value = "此格无内容";
emptyCellP.appendChild(emptyCellInput);


let sortP = document.createElement('p');
sortP.innerText = '是否使用排序？'
main.insertBefore(sortP, inputArea);

let sortInput = document.createElement('input');
sortInput.type = 'checkbox';
sortP.appendChild(sortInput);

sortInput.onclick = function (e) {

    if (this.checked == true) {
        document.getElementById('inputArea').classList.add('withSortRef');
        document.getElementById('resultArea').classList.add('withSortRef');

        [sortBtn, sortElseSpan, document.getElementById('newSortRef')].map(d => {
            d.style.display = 'initial';
        });

    } else {
        document.getElementById('inputArea').classList.remove('withSortRef');
        document.getElementById('resultArea').classList.remove('withSortRef');

        [sortBtn, sortElseSpan, document.getElementById('newSortRef')].map(d => {
            d.style.display = 'none';
        });

        mainFn();
    }
}

let sortElseSpan = document.createElement('span');
sortElseSpan.innerText = '是否显示排序后剩余的行？';
let sortElseInput = document.createElement('input');
sortElseInput.type = 'checkbox';
sortElseSpan.appendChild(sortElseInput);

sortP.appendChild(sortElseSpan);
sortElseSpan.style.display = 'none';


let sortBtn = document.createElement('button');
sortBtn.innerText = '刷新排序';
sortBtn.style.display = 'none';
sortBtn.onclick = mainFn;

inputArea.after(sortBtn);


let copyBtn = document.createElement('button');
copyBtn.innerText = '复制结果';
copyBtn.setAttribute('disabled', 'true');

main.insertBefore(copyBtn, document.getElementById('resultArea'));

copyBtn.onclick = function () {
    if (!this.hasAttribute('disabled')) {
        copyStr(document.getElementById('result').innerText);
    }
}

function mainFn() {
    console.log('mainfn');

    const splitor =
        splitSelector.value == "input" ? splitInput.value : splitSelector.value;

    let input = document.querySelector("#address"),
        result = document.getElementById('result'),
        resultText = input.value.split(/\n/g).map((d) => smart(d)),
        format = settingInput.value;

    if (input.value != '') { copyBtn.removeAttribute('disabled'); } else { copyBtn.setAttribute('disabled', 'true'); }


    Object.keys(dict).map((k) => { format.replace(k, dict[k]); });

    resultText = resultText.map((line) => {
        let f = format;
        Object.keys(dict).map((k) => {
            let r = line[dict[k]];
            f = f.replace(
                k,
                typeof r == "undefined" || r == "undefined" ? emptyInput.value : r
            );
        });
        f = f
            .split(",")
            .map((_f) =>
                _f.replace(new RegExp(emptyInput.value, "g"), "") == "" ?
                    emptyCellInput.value :
                    _f
            )
            .join(splitor);
        return f;
    });

    if (sortInput.checked == true) {
        let _new = document.getElementById('newSort'), _now = document.getElementById('nowSort'),
            _newArr = _new.value.split(/\n/g), _nowArr = _now.value.split(/\n/g);

        result.innerHTML = ``;


        if (_nowArr.length != resultText.length) {
            result.innerHTML = `<p style='color:red;'>请在 ‘当前排序参考列’ 输入与 ‘地址内容列’ 相同行数的内容</p>`;
            return;
        }

        if (_nowArr.length != [...new Set(_nowArr)].length) {
            result.innerHTML = `<p style='color:red;'>请检查 ‘当前排序参考列’ 的值，不能存在重复</p>`;
            return;
        }

        if (_new.value == '') {
            result.innerHTML = `<p style='color:red;'>请填入 ‘目标排序参考列’</p>`;
            return;
        }

        let nowObj = {};
        _nowArr.map((n, idx) => {
            nowObj[n] = resultText[idx];
        });

        let newResult = _newArr.map((n) => {
            if (n in nowObj) {
                let _n = nowObj[n];
                if (sortElseInput.checked == true) {
                    nowObj[n] = false;
                }
                return _n;
            } else {
                return emptyCellInput.value;
            }
        });

        let elseResult = Object.keys(nowObj).filter(n => nowObj[n] != false).map(n => nowObj[n]);

        if (sortElseInput.checked == true) {
            resultText = [...newResult, '----------', ...elseResult];
            result.innerHTML = resultText.join("<br>");
        } else {
            resultText = [...newResult];
            result.innerHTML = resultText.join("<br>");
        }

        document.getElementById('newSortRef').innerHTML = _newArr.join('<br>');

    } else {
        result.innerHTML = resultText.join("<br>");
    }

}

emptyInput.oninput = mainFn;
emptyCellInput.oninput = mainFn;

splitSelector.oninput = function (e) {
    this.value = [...e.target.children].filter((o) => o.selected == true)[0].value;
    if (this.value == "input") {
        splitInput.removeAttribute("disabled");
    } else {
        splitInput.setAttribute("disabled", "true");
    }
    mainFn();
};


sortElseInput.oninput = mainFn;

splitInput.oninput = mainFn;
settingInput.oninput = mainFn;

document.querySelector("#address").onblur = mainFn;



function copyStr(str) {
    var a = document.createElement("textarea");
    a.value = str;
    document.body.appendChild(a);
    a.select();
    document.execCommand("Copy");
    a.style.display = "none";
    window.alert(str + "内容已复制到剪贴板");
};
