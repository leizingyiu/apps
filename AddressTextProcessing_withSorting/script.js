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
    contentArea = document.getElementById("contentArea");

let replaceP = document.createElement('p');
replaceP.innerHTML = '请输入需要<b>替换去掉</b>的内容文本，用英文逗号分隔<br>';
let replaceInput = document.createElement('input');
replaceInput.id = 'replaceInput';
replaceInput.value = '收货人:,手机号码:,所在地区:,详细地址:';
main.insertBefore(replaceP, contentArea);
// replaceInput.style.display = 'block';
// replaceInput.style.width = '100%';
replaceP.appendChild(replaceInput);


let settingP = document.createElement("p");
settingP.innerHTML = `<b>行顺序设置</b>： 请填入 ${Object.keys(dict).join(",")}，使用英文逗号分隔。\n`;
main.insertBefore(settingP, contentArea);

let settingInput = document.createElement("input");
settingInput.id = 'settingInput';
settingP.appendChild(settingInput);
// settingInput.value = Object.keys(dict).join(",");
settingInput.value = "姓名,电话,省名市名区名街名地址";
settingInput.style.display = "block";

let splitP = document.createElement("p");
splitP.innerHTML =
    "请选择输出分隔符，comma为英文逗号，tabs为制表符，选择input请在右侧填入<br>";

main.insertBefore(splitP, contentArea);

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
main.insertBefore(emptyP, contentArea);

let emptyInput = document.createElement("input");
emptyInput.value = " ";
emptyP.appendChild(emptyInput);

let emptyCellP = document.createElement("p");
emptyCellP.innerText =
    "请填入空单元格的占位符。即上面设置的分隔符中，整段缺失才显示的字符";
main.insertBefore(emptyCellP, contentArea);

let emptyCellInput = document.createElement("input");
emptyCellInput.value = "此格无内容";
emptyCellP.appendChild(emptyCellInput);


let sortP = document.createElement('p');
sortP.innerText = '是否使用排序？'
main.insertBefore(sortP, contentArea);

let sortInput = document.createElement('input');
sortInput.type = 'checkbox';
sortP.appendChild(sortInput);

sortInput.onclick = function (e) {

    if (this.checked == true) {
        document.getElementById('inputArea').classList.add('withSortRef');
        document.getElementById('resultArea').classList.add('withSortRef');

        [sortBtn, sortElseSpan].map(d => {
            d.style.display = 'initial';
        });

    } else {
        document.getElementById('inputArea').classList.remove('withSortRef');
        document.getElementById('resultArea').classList.remove('withSortRef');

        [sortBtn, sortElseSpan].map(d => {
            d.style.display = 'none';
        });

        mainFn();
    }
}

let sortElseSpan = document.createElement('span');
sortElseSpan.style.cssText = `
padding: 0 1em;
border-left: solid 1px #ccc;
border-right: solid 1px #ccc;
margin: 1em;
`;
sortElseSpan.innerText = '是否显示排序后剩余的行？';
let sortElseInput = document.createElement('input');
sortElseInput.type = 'checkbox';
sortElseSpan.appendChild(sortElseInput);

sortP.appendChild(sortElseSpan);
sortElseSpan.style.display = 'none';


let sortBtn = document.createElement('button');
sortBtn.innerText = '刷新排序';
sortBtn.style.cssText = `display:none;    `;
sortBtn.onclick = mainFn;

sortP.appendChild(sortBtn);


let copyBtn = document.createElement('button');
copyBtn.innerText = '复制结果';
copyBtn.setAttribute('disabled', 'true');
copyBtn.style.cssText = `vertical-align: middle;margin-left:1em;`;
document.getElementById('resultTitle').appendChild(copyBtn);

copyBtn.onclick = function () {
    if (!this.hasAttribute('disabled')) {
        copyStr(document.getElementById('result').innerText);
    }
}

function placeHolderReflesh(e) {
    // [...document.querySelectorAll('div[contenteditable]')].map(d => {
    const d = e.target;
    if (d.innerText.length == 0) {
        d.classList.remove('filled');
    } else {
        d.classList.add('filled');
    }
    // });
}
function mainFn() {
    const splitor =
        splitSelector.value == "input" ? splitInput.value : splitSelector.value;

    console.log(splitor);


    let input = document.querySelector("#address"),
        result = document.getElementById('result'),
        resultText = input.innerText.split(/\n/g).map((d) => smart(d.replace(/\s+/g, ' '))),
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
            _newArr = _new.innerText.split(/\n/g), _nowArr = _now.innerText.split(/\n/g);

        result.innerHTML = ``;


        if (_nowArr.length != resultText.length) {
            result.innerHTML = `<p style='color:red;'>请在 ‘当前排序参考列’ 输入与 ‘地址内容列’ 相同行数的内容</p>`;
            return;
        }

        if (_nowArr.length != [...new Set(_nowArr)].length) {
            result.innerHTML = `<p style='color:red;'>请检查 ‘当前排序参考列’ 的值，不能存在重复</p>`;
            return;
        }

        if (_new.innerText == '') {
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


        // document.getElementById('newSortRef').innerHTML = _newArr.join('<br>');

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

[...document.querySelectorAll('.sortRef,div[contenteditable]')].map(d => {
    d.addEventListener('keyup', placeHolderReflesh);
    d.addEventListener('mouseup', placeHolderReflesh);
})

function addressEditFn(e) {
    console.log(e, this);
    this.innerHTML = this.innerText.replace(/[\s\n\r]*$/g, '');
    mainFn();
}

const address = document.querySelector("#address")
address.addEventListener('blur', addressEditFn);

// address.addEventListener('DOMCharacterDataModified', addressEditFn);
// address.addEventListener('keyup', addressEditFn);



function copyStr(str) {
    var a = document.createElement("textarea");
    a.value = str;
    document.body.appendChild(a);
    a.select();
    document.execCommand("Copy");
    a.style.display = "none";
    window.alert(str + "内容已复制到剪贴板");
};
