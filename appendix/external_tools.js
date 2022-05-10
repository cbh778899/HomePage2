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
    function addOptionBaidu() {
        const search_engine_select = document.getElementById('change-search-engine')
        search_engine_select.insertAdjacentHTML("beforeend",
        `<option value='BAIDU' ${_settings.search_engine === 'BAIDU' ? 'selected' : ''}>Baidu</option>`)

        const previous_search_engine_submit = document.getElementById('search_bar_form').onsubmit;

        search_engine_select.onchange = event => {
            _settings.search_engine = event.target.value;
            if(event.target.value === 'BAIDU') {
                document.getElementById('search_bar_form').onsubmit = event => {
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
            } else {
                document.getElementById('search_bar_form').onsubmit = previous_search_engine_submit;
            }
        }
    }
    
    document.getElementById(settings.id).addEventListener('click', addOptionBaidu)
}

// external tools ends here

const external_tools = [
    {timing: START, entry: saveSettingsToLocalStorage},
    {timing: START, entry: loadSettingsFromLocalStorage},
    {timing: END, entry: rightClickToSavedSites},
    {timing: END, entry: useBaiduSearchEngine}
]