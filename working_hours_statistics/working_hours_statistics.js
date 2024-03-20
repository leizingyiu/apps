javascript:
/**
 * 精力分配计算器 v0.9
 * 兼容一事一值，一事多值，一事多值带日期。
 * 
 * 计算所需输入格式为：
 *      统计表中每单元格用大括号包裹
 *      事与值之间使用冒号分隔（中英兼容）
 *      多值之间用逗号分隔（中英兼容）
 *      日期与值之间用冒号分隔（中英兼容）
 *      日期使用月月日日四位数字
 *      值使用数字，可带小数点，可为工时、人日，设置资金
 * 
 * 插件使用说明：
 * 日常工作中根据填写规则完成填写后，复制表格中生成输出字段，点击这个页面的按钮，或者运行书签脚本，将复制的数据粘贴到弹出的输入框中；
 * 如数据无错误，会弹出计算结果，并自动复制到剪贴板中；
 * 如数据中出现错误，请根据具体报错进行修改调整；
 * 如插件出现计算错误，请及时反馈。

 * 表格中填写值字段的填写参考：
    一事一值：
        1
        2

    一事多值：
        1，2，3
        5，6，7
    
    一事多值带日期：
        0319:1，0318:2，0315:3，0322：4，0329：5
        0208:2, 0227:5.，0301：1，0302:2，0422：4，0429：5

        
 * 表格中输出值字段的参考公式：
"{"&[事项字段]&":["&[表格中填写值字段]&"]}"

即得到结果
{事项字段内容:[表格中填写值字段内容]}

 * 插件输入值参考（复制表格中输出值字段整列）：
    一事一值：
        {F品牌-运营:[1]}
        {D-联名:[2]}

    一事多值：
        {Z品牌-日常:[1，2，3，4，5]}
        {D品牌-联名:[6，7，8，9]}

    一事多值带日期：
        {Z品牌-日常:[208:2, 0227:5.，0301：1，0302:2]}
        {Z品牌-日常:[0201：1.0209:2，0208:1]}
        {F品牌-运营:[0201：2，0209:1，0208:2]}

 * code by leizingyiu
 * Created: "2024/03/01"
 * Last version: "2024/03/20"
 * Last modified: "2024/03/20 16:48:24"
 
*/

(function workingHoursStatistics() {

    const isBookmark = typeof window.isWeb != 'undefined' ? false : true;


    copyOptions = "全部复制,只复制上月";

    copyOption = typeof window.copyOption == undefined ?
        "全部复制" : window.copyOption;
    /* copyOption = "只复制上月"; */

    alertErr = true;
    /* 是否弹出报错 */


    exportWholeObject = typeof window.exportWholeObject == 'undefined' ?
        false : window.exportWholeObject;
    /*true：最终输出整个数据对象； false：最终只输出百分比结果*/

    console.log(copyOption, exportWholeObject);

    const mergeNullKeyToPastMoon = true;
    /* 未注明日期数据，合并到“上月”中，并且如出现上月具体日期，则未注明数据与上月数据合并。 */

    const lastMonth = (new Date()).getMonth();
    const defaultKey = `上月 - ${lastMonth}月`;
    /* 未注明日期数据，合并到“上月”中 */

    // console.clear();
    console.log(this);
    console.log('isBookmark: ', isBookmark);

    ( /*恢复console*/ $ => {
        let id = "yiu_consoleFrame";
        let f, c = "console",
            d = document,
            g = _ => d.getElementById(_),
            h = _ => d.createElement(_),
            i = _ => d.body.appendChild(_);
        if ((g(id) === null)) {
            f = h('iframe');
            f.id = id;
            f.width = 1; f.height = 1;
            f.style.opacity = 0;
            i(f)
        } else {
            f = g(id)
        }
        window[c] = f.contentWindow[c]
    })();

    function copyStr(str) {
        var a = document.createElement("textarea");
        a.value = str;
        document.body.appendChild(a);
        a.select();
        document.execCommand("Copy");
        a.style.display = "none";
        a.parentElement.removeChild(a);
        window.confirm("⬇️ 内容已复制到剪贴板\n______\n" + str);
    }

    function display(str, isErr = false) {
        if (isErr == true) {

        }
        if (isBookmark == true || document.querySelector('#result') == null) {
            return;
        }
        if (typeof str == 'undefined') {
            document.querySelector('#result').classList.remove('show');
        } else {
            document.querySelector('#result').value = str;
            document.querySelector('#result').classList.add('show');
        }
    }
    const _alert = window.alert;
    display();

    window.alert = function () {
        display([...arguments].join('/n'), true);
        if (alertErr == true) {
            _alert(...arguments);
        }
    }

    const input = window.prompt(
        "请复制《每日工作内容记录》/《工作安排》中的 ‘上月所占精力’ s s列 ",
        "",
    );
    let e = [],
        O = {};

    console.log(input);
    if (input == "" || input === null) {
        /* TODO: 测试：全文是否为空  */
        alert("请输入内容");
    } else {
        S = input.split(/[\n\r]/g)
            .filter((_) => _.match(/\{/g))
            .map((_, _idx) => {

                _ = _.replace(/[:：]/, "|");
                /* 替换第一个冒号，拆分key value */

                var [__, brand, ___, value] = _.match(/[^{}|]*/g);
                /* 识别 key value */

                /*  console.log([__, brand, ___, value]); */
                if (brand.length == 0) {
                    /* TODO: 测试：brand是否为空 */
                    e.push({
                        err: `在第 ${_idx + 1} 行数据 ${_} 中，未含有分类，如品牌，或内部输出等`
                    });
                    return false;
                }

                if (isFinite(Number(value))) {
                    /* TODO: 测试：值为数字、数组、字典 */
                    value = Number(value);
                    if (typeof O[defaultKey] == 'undefined') {
                        O[defaultKey] = {};
                    }
                    if (typeof O[defaultKey][brand] == 'undefined') {
                        O[defaultKey][brand] = {};
                        O[defaultKey][brand].arr = [];
                    }

                    O[defaultKey][brand].arr.push(value);
                    O[defaultKey][brand].sum = O[defaultKey][brand].arr.reduce((a, b) => a + b);
                    /* O[defaultKey].sum = Object.keys(O[defaultKey])
                        .filter((_k) => _k != "sum")
                        .map((_brand) => O[defaultKey][_brand].sum)
                        .reduce((a, b) => a + b); */

                } else {
                    console.log(value.match(/[^\d\s\{\}\[\]:,：，]*/));

                    let vAr = value.replace(/[\[\]]/g, "").split(/[,，]/g).filter(_v => _v.length > 0); /* TODO: 测试：使用逗号、非逗号分隔 */
                    console.log(vAr);

                    if (vAr.length == 0) {
                        e.push({
                            errr: `在第 ${_idx + 1} 行 ${_} 中: ` + `不含任何数据`
                        });
                    }
                    /* console.log(vAr); */

                    let eAr = [];


                    vAr.map(_v => {
                        let ___ = _v.split(/[:：]/g); /* TODO: 测试：使用冒号，非冒号 分隔 */

                        let month, day, __v;
                        let ms = [];

                        if (___.length > 0 && ___.length == 1) {
                            /* TODO: 测试：值为数组 */
                            month = defaultKey;
                            __v = ___[0];
                            ms.push(month);
                        } else {
                            /* TODO: 测试：值为字典 */
                            [day, __v] = ___;
                            if (isFinite(Number(day)) &&
                                Number(day) > 100 &&
                                Number(day) % 100 < 31) {
                                /* TODO: 测试：日输入非数字、非正常数字 */
                                month = Math.floor(day / 100);
                                ms.push(month);
                            } else if (Number(day) % 100 > 31) {
                                eAr.push({
                                    type: "dateNumberLarge",
                                    data: day
                                });
                                return false;
                            } else {
                                eAr.push({
                                    type: "dateNumber",
                                    data: day
                                });
                                return false;
                            }
                        }

                        if (!isFinite(Number(__v))) {
                            /* TODO: 测试：值存在非数字 */
                            eAr.push({
                                type: 'valueNumber',
                                data: __v,
                            });
                            return;
                        }


                        __v = Number(__v);

                        ms.map(m => {
                            if (typeof O[m] == 'undefined') {
                                O[m] = {};
                            }

                            if (typeof O[m][brand] == 'undefined') {
                                O[m][brand] = {};
                                O[m][brand].arr = [];
                            }

                            O[m][brand].arr.push(__v);
                            O[m][brand].sum = O[m][brand].arr.reduce((a, b) => a + b);
                            /*  O[m].sum = Object.keys(O[m])
                                 .filter((_k) => _k != "sum")
                                 .map((brand) => O[m][brand].sum)
                                 .reduce((a, b) => a + b); */
                        });
                    });

                    if (eAr.length != 0) {
                        e.push({
                            err: `在第 ${_idx + 1} 行 ${_} 中: ` +
                                (eAr.filter(eo => eo.type == "dateNumber").length > 0 ?
                                    `日期中 ${eAr.filter(eo => eo.type == "dateNumber").map(eo => eo.data).join(', ')} 不是数字格式，请输入月月日日的4位数字` : "") +
                                (eAr.filter(eo => eo.type == "dateNumberLarge").length > 0 ?
                                    `日期中 ${eAr.filter(eo => eo.type == "dateNumberLarge").map(eo => eo.data).join(', ')} 的日大于31，请检查` : '') +
                                (eAr.filter(eo => eo.type == "valueNumber").length > 0 ?
                                    `数据中 ${eAr.filter(eo => eo.type == "valueNumber").map(eo => eo.data).join(', ')} 不是数字格式，请输入纯数字` : '') +
                                ""
                        });
                    }
                }
            });

        if (e.length != 0) {
            let errText = e.map(_e => Object.values(_e).join(':')).join('\n');
            console.error(errText);
            if (alertErr == true) {
                alert(errText);
            }
            return false;
        }

        if (mergeNullKeyToPastMoon == true &&
            typeof O[defaultKey] != "undefined" &&
            typeof O[lastMonth] != "undefined") {
            /* TODO: 测试：设置中不同配追 */

            let o = {};

            let ks = Object.keys(O[defaultKey]).concat(Object.keys(O[lastMonth]));
            ks = [...new Set(ks)];
            /* console.log(ks); */

            ks.map(k => {
                if (k == 'sum' || k == "percentage") {
                    return;
                }
                o[k] = {};
                let ar = typeof O[defaultKey][k] == 'undefined' ? [] : O[defaultKey][k].arr;
                let _ar = typeof O[lastMonth][k] == 'undefined' ? [] : O[lastMonth][k].arr;
                let sum = typeof O[defaultKey][k] == 'undefined' ? 0 : O[defaultKey][k].sum;
                let _sum = typeof O[lastMonth][k] == 'undefined' ? 0 : O[lastMonth][k].sum;
                o[k].arr = ar.concat(_ar);
                o[k].sum = sum + _sum;
            });
            o.sum = Object.keys(o)
                .filter((_k) => _k != "sum")
                .map((_brand) => o[_brand].sum)
                .reduce((a, b) => a + b);
            /* console.log(o); */
            O[defaultKey + `_与 ${lastMonth} 合并`] = o;
        }

        if (typeof O[defaultKey] == "undefined") {
            O[defaultKey] = O[lastMonth];
        }

        console.log(O);
        if (Object.keys(O).length == 0 ||
            (Object.keys(O).length == 1 && O[Object.keys(O)[0]] == null)) {
            alert('输入的内容无法识别成计算所需的数据，麻烦检查一下');
            return false;
        }

        Object.keys(O).map(month => {
            O[month].sum = Object.keys(O[month])
                .filter((_k) => _k != "sum")
                .map((_brand) => O[month][_brand].sum)
                .reduce((a, b) => a + b);
        });

        Object.keys(O).map(month => {
            let o = O[month];

            Object.keys(o)
                .filter((_k) => _k != "sum")
                .map((k) => {
                    o[k].percentage = o[k].sum / o.sum;
                });
        });

        objStr = JSON.stringify(O, ' ', 2).replace(/[\n\r] {6,}/g, '').replace(/[\n\r] +(\},*)/g, ' $1');
        console.log(objStr);

        result = exportWholeObject == false ? Object.keys(O).filter(k => copyOptions.split(/[,，]/g)
            .map((k, idx) => k == copyOption ? String(idx) : false).filter(Boolean)[0] == 0 || k.indexOf(defaultKey) != -1).map(k =>
                k + ':\n' + Object.keys(O[k])
                    .filter((s) => s != "sum")
                    .map((_k) => _k + ":" + (100 * O[k][_k].percentage).toFixed(0) + "%")
                    .join(",\n")
            ).join("\n___\n\n") :
            objStr;

        console.log(result);
        display(result);
        setTimeout(() => {
            copyStr(result);
        }, 500);
    }

})()