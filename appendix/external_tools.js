// external tools starts from here

/**
 * @description add save settings to localsotrage button
 */
 function saveSettingsToLocalStorage() {
    function save() {
        const save_sites_str = JSON.stringify(_settings.save_sites);
        const settings_str = JSON.stringify({..._settings, save_sites: save_sites_str})
        localStorage.setItem('settings', settings_str);
        localStorage.setItem('local_storage_working', '1');
        document.getElementById(settings.id).click();
    }

    function saveBtn() {
        if(!document.getElementById('save-to-localstorage')) {
            const save_localstorage_btn = document.createElement('div');
            save_localstorage_btn.className = 'save-settings'
            save_localstorage_btn.textContent = '保存设置到本地存储'
            save_localstorage_btn.id = 'save-to-localstorage'
            save_localstorage_btn.onclick = save;

            const remove_localstorage = document.createElement('div');
            remove_localstorage.className = 'save-settings'
            remove_localstorage.onclick = () => {
                localStorage.removeItem('settings');
                localStorage.removeItem('local_storage_working');
            }
            remove_localstorage.textContent = "清除在本地存储中的设置"

            const edit_setting_page = document.getElementById('edit-settings')
            edit_setting_page.insertAdjacentElement("afterbegin", remove_localstorage);
            edit_setting_page.insertAdjacentElement("afterbegin", save_localstorage_btn);
        }
    }

    settings.loadExternal = () => {
        document.getElementById(settings.id).addEventListener('click', saveBtn);
    }
}

/**
 * @description Load settings from localstorage instead of using settings.js
 */
function loadSettingsFromLocalStorage() {
    if(localStorage.getItem('local_storage_working')) {
        _settings = JSON.parse(localStorage.getItem('settings'))
        _settings.save_sites = JSON.parse(_settings.save_sites);
    }
}

/**
 * @description add right click listener to open saved sites
 */
function rightClickToSavedSites() {
    document.getElementById(LOC_MAIN).oncontextmenu = event => {
        event.preventDefault();
        document.getElementById(save_sites.id).click();
    }
}

/**
 * @description Add baidu as a search engine
 */
function useBaiduSearchEngine() {
    const default_search_engine_submit = document.getElementById('search_bar_form').onsubmit;

    function baiduSearch(event) {
        event.preventDefault();
        const search_value = event.target.search.value;
        event.target.search.value = ''
        const query = "https://www.baidu.com/s?wd="+search_value.replaceAll(' ', '%20');
    
        const search = document.createElement('a');
        search.href = query;
        search.target = '_blank';
        document.body.appendChild(search);
        search.click();
        search.remove();
    }

    function addOptionBaidu() {
        const search_engine_select = document.getElementById('change-search-engine')
        search_engine_select.insertAdjacentHTML("beforeend",
        `<option value='BAIDU' ${_settings.search_engine === 'BAIDU' ? 'selected' : ''}>Baidu</option>`)

        search_engine_select.onchange = event => {
            _settings.search_engine = event.target.value;
            if(event.target.value === 'BAIDU') {
                document.getElementById('search_bar_form').onsubmit = baiduSearch;
            } else {
                document.getElementById('search_bar_form').onsubmit = default_search_engine_submit;
            }
        }
    }
    
    document.getElementById(settings.id).addEventListener('click', addOptionBaidu)
    if(_settings.search_engine === 'BAIDU')
        document.getElementById('search_bar_form').onsubmit = baiduSearch;
}

/**
 * @description A nice and little calculator
 */
async function calculatorComponent() {

    async function closeCalculator() {
        const calculator_main = document.getElementById('calculator-comp');
        calculator_main.style.transform = 'scaleY(0)';
        await new Promise(s=>setTimeout(s, 1000));
        calculator_main.remove()
        document.getElementById('calculator').onclick = calculator;
        document.body.removeEventListener('keydown', calculatorInput)
    }

    function calculatorInput(event) {
        let value;
        const calculator_input = document.getElementById('calculator-input');
        if(event.key) {
            value = event.key;
        } else {
            value = event.target.textContent;
        }
        let content = calculator_input.value;
        switch(value) {
            case 'Backspace':
            case 'Delete':
                content = content.substring(0, content.length - 1);
                break;
            case 'Escape':
            case 'AC':
                content = '';
                break;
            case '=':
            case 'Enter':
                calculate();
                return;
            case '0': case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9': case '+': case '-':
            case '*': case '/': case '.':
                content += value;
                break;
            default: break;
        }
        calculator_input.value = content;
    }

    function calculate() {
        const calculator_input = document.getElementById('calculator-input');
        const value = calculator_input.value;
        let result;
        value.split('+').forEach((e, i)=>{
            let minus_value;
            e.split('-').forEach((e1, i1)=>{
                let multiply_value;
                e1.split('*').forEach((e2, i2)=>{
                    let divide_value;
                    e2.split('/').forEach((e3, i3)=>{
                        let number = parseFloat(e3);
                        divide_value = i3 === 0 ? number : divide_value / number;
                    })
                    multiply_value = i2 === 0 ? divide_value : multiply_value * divide_value;
                })
                minus_value = i1 === 0 ? multiply_value : minus_value - multiply_value;
            })
            result = i === 0 ? minus_value : result + minus_value;
        })
        calculator_input.value = result;
    }

    async function calculator() {
        document.getElementById('calculator').onclick = closeCalculator;
        document.getElementById(LOC_MAIN).insertAdjacentHTML('afterbegin', `
            <div class='calculator' id='calculator-comp'>
                <input type='text' id='calculator-input' class='calculator-input' disabled>
                <span class='calculator-key low'>AC</span>
                <span class='calculator-key low'>/</span>
                <span class='calculator-key low'>*</span>
                <span class='calculator-key low edge'>-</span>
                <div class='part'>
                    <span class='calculator-key'>7</span>
                    <span class='calculator-key'>8</span>
                    <span class='calculator-key edge'>9</span>
                    <span class='calculator-key'>4</span>
                    <span class='calculator-key'>5</span>
                    <span class='calculator-key edge'>6</span>
                </div>
                <span class='calculator-key high'>+</span>
                <div class='part'>
                    <span class='calculator-key'>1</span>
                    <span class='calculator-key'>2</span>
                    <span class='calculator-key edge'>3</span>
                    <span class='calculator-key wide'>0</span>
                    <span class='calculator-key edge'>.</span>
                </div>
                <span class='calculator-key high'>=</span>
            </div>
        `)

        const calculator_main = document.getElementById('calculator-comp');
        await new Promise(s=>setTimeout(s, 1));
        calculator_main.style.transform = 'none';

        document.querySelectorAll('.calculator-key').forEach(e=>e.onclick = calculatorInput);
        document.body.addEventListener('keydown', calculatorInput)
    }

    document.getElementById(save_sites.id).insertAdjacentHTML('afterend', `
    <div id='calculator' class='icon' title='计算器'>
        <img src='src/pic/calculator.svg' class='ico-img'>
    </div>
    `);

    document.getElementById('calculator').onclick = calculator;
}

// external tools ends here

const external_tools = [
    {timing: START, entry: saveSettingsToLocalStorage},
    {timing: START, entry: loadSettingsFromLocalStorage},
    {timing: END, entry: rightClickToSavedSites},
    {timing: END, entry: useBaiduSearchEngine},
    {timing: END, entry: calculatorComponent}
]