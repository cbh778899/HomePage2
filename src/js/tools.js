function loadDefaultTools() {
    tools_list.forEach(e => {
        document.getElementById(e.loc).
        insertAdjacentHTML("beforeend", `
            <div id='${e.id}' class='${e.class}' title='${e.title}'>
                ${e.start()}
            </div>
        `);

        if(e.loadEvent)
            e.loadEvent();
        if(e.loadExternal)
            e.loadExternal();
    })
}

function loadTools() {
    const loading = [
        ...external_tools.filter(e=>e.timing === START),
        {entry: loadDefaultTools},
        ...external_tools.filter(e=>e.timing === END)
    ]

    loading.forEach(e=>{
        e.entry();
    })
}

// default tools

const clock = {
    loc: LOC_MAIN,
    id: "clock",
    class: 'clock',
    title: '',
    start: () => {

        function getTimeStr() {
            const date = new Date();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            hours = hours < 10 ? '0'+hours : hours;
            minutes = minutes < 10 ? '0'+minutes : minutes;
            let ret = `${hours} : ${minutes}`;

            if(_settings.clock_with_seconds) {
                let seconds = date.getSeconds();
                seconds = seconds < 10 ? '0'+seconds : seconds;
                ret += `<nobr class='seconds'> ${seconds}</nobr>`;
            }
            return ret;
        }
        
        function loadClock() {
            const clock_div = document.getElementById("clock");
            clock_div.innerHTML = getTimeStr();
            setTimeout(loadClock, 1000);
        }

        setTimeout(loadClock, 1000);
        return getTimeStr();
    }
}

const search_bar = {
    loc: LOC_MAIN,
    id: 'search-bar',
    class: 'search-bar',
    title: '',
    loadEvent: () => {
        const form = document.getElementById('search_bar_form');
        
        function submitSearch(event) {
            event.preventDefault();
            const search_value = event.target.search.value;
            if(!search_value.length)
                return
            event.target.search.value = '';

            let url;
            switch(_settings.search_engine) {
                case GOOGLE:
                    url = "https://www.google.com/search?q=" + search_value.replaceAll(' ', '+');
                    break;
                case BING:
                    url =  "https://www.bing.com/search?q=" + search_value.replaceAll(' ', '+');
                    break;
                default: break;
            }
            
            const search = document.createElement('a');
            search.href = url;
            search.target = '_blank';
            document.body.appendChild(search);
            search.click();
            search.remove();
        }

        form.onsubmit = submitSearch;
    },
    start: () => {
        return `
        <form id='search_bar_form' autocomplete='off'>
            <input name='search' type='text' placeholder='点击此处开始搜索'>
        </form>`;
    }
}

const save_sites = {
    loc: LOC_SIDE,
    id: 'save-sites',
    class: 'icon',
    title: '网址收藏',
    loadEvent: async () => {
        const current_elem = document.getElementById(save_sites.id);
        let edit_page_opened = false;

        function removeSavedSites(event) {
            const index = parseInt(event.target.id.split("-")[2]);
            _settings.save_sites.splice(index, 1);
            createSavedSitesPage({create_manage_page: true});
        }

        function editSavedSites(event) {
            const index = parseInt(event.target.id.split("-")[2]);
            const form = document.getElementById('add-new');
            form.title.value = _settings.save_sites[index].title;
            form.url.value = _settings.save_sites[index].url;
            form.ico.value = _settings.save_sites[index].ico;
            const hide = document.createElement('input')
            hide.type = 'hidden'
            hide.name = 'editing';
            hide.value = index;
            form.appendChild(hide);
        }

        async function closeEditPage() {
            const manage_page = document.getElementById('manage-saved-sites-page')
            manage_page.style.transform = 'scale(0)';
            await new Promise(s=>setTimeout(s, 1000));
            manage_page.remove();
            edit_page_opened = false;
            document.getElementById('manage-saved-sites').onclick = manageSavedSites;
        }

        function submitEditSites(event) {
            event.preventDefault();
            let url = event.target.url.value;
            if(!url)
                return
            if(url.slice(-1) != '/')
                url += '/'

            const title = event.target.title.value ? 
                event.target.title.value : url.split("/")[2]
            const ico = event.target.ico.value ? 
                event.target.ico.value : ICO_DEFAULT

            const site = {
                title: title,
                url: url,
                ico: ico
            }
            if(event.target.editing && parseInt(event.target.editing.value) >= 0)
                _settings.save_sites[parseInt(event.target.editing.value)] = site;
            else
                _settings.save_sites.push(site);
            
            createSavedSitesPage({create_manage_page: true});
        }

        function createEditForm() {
            document.getElementById('add-new').innerHTML = `
            <span>网页标题：</span>
            <input type='text' name='title' autocomplete='off'>
            <span>网址（必填）：</span>
            <input type='text' name='url' autocomplete='off'>
            <span>使用图标：</span>
            <input type='text' name='ico' autocomplete='off'>
            <input type='submit' value='提交' class='btn' id='edit-sites-submit'>
            <input type='button' class='btn close' value='关闭' id='edit-sites-close'>`

            document.getElementById('add-new').onsubmit = submitEditSites;
            document.getElementById('edit-sites-close').onclick = closeEditPage;
        }

        async function manageSavedSites(params) {
            edit_page_opened = true;
            document.getElementById('manage-saved-sites').onclick = null;
            
            document.getElementById('saved-sites').insertAdjacentHTML("afterbegin", `
                <div id='manage-saved-sites-page' class='manage'>
                    <div id='display-current' class='display-current'>
                        ${_settings.save_sites.map((e, i)=>{
                            return `
                            <div>
                                标题：${e.title}</br>
                                网址：${e.url}</br>
                                图标：${e.ico === ICO_DEFAULT ? '默认图标' : e.ico}</br>
                                <span class='edit-site' id='edit-site-${i}'>编辑</span>
                                <span class='remove-site' id='remove-site-${i}'>删除</span>
                            </div>
                            `;
                        }).join('')}
                    </div>
                    <form id='add-new' class='add-new'></form>
                </div>
            `);

            createEditForm();
            _settings.save_sites.forEach((e, i)=>{
                document.getElementById(`remove-site-${i}`).onclick = removeSavedSites;
                document.getElementById(`edit-site-${i}`).onclick = editSavedSites;
            })
            if(!params.no_wait_css)
                await new Promise(s=>{setTimeout(s, 1)});
            document.getElementById("manage-saved-sites-page").style.transform = 'none';
        }

        function createSavedSitesPage(params) {
            const saved_sites_innerHTML = `
                ${_settings.save_sites.map((e, i) => {
                    return (
                    `<a href='${e.url}' class='single-site' title='${e.title}' target='_blank' id='save-site-${i}'>
                        <img src='${
                            e.ico === ICO_DEFAULT ? 
                            e.url.split('/').slice(0, 3).join('/')+'/favicon.ico' : 
                            e.ico}' onerror='javascript:event.target.src = "src/pic/globe.svg";'>
                        <span>${e.title}</span>
                    </a>`)
                }).join('')}
                <a id='manage-saved-sites' class='single-site' title='管理收藏网址' href='javascript:void(0);'>
                    <img src='src/pic/gear.svg'>
                    <span>管理收藏网址</span>
                </a>`

            if(params.create_manage_page) {
                document.getElementById('saved-sites').innerHTML = saved_sites_innerHTML;
                manageSavedSites({no_wait_css: true});
                document.getElementById("manage-saved-sites-page").style.transform = 'none';
            } else {
                if(params.reload)
                    document.getElementById('saved-sites').innerHTML = saved_sites_innerHTML;
                else
                    document.getElementById(LOC_MAIN).insertAdjacentHTML("afterbegin", `
                        <div id='saved-sites' class='save-sites'>
                            ${saved_sites_innerHTML}
                        </div>
                    `);
            }

            let drag_elem = null;
            [...document.querySelectorAll(".single-site")].slice(0, -1).forEach(e=>{
                e.ondragstart = event => {
                    drag_elem = event.target.tagName === 'IMG' || event.target.tagName === 'SPAN' ?
                        event.target.parentNode : event.target;
                }

                e.ondragend = () => {
                    drag_elem = null;
                }

                e.ondragover = event => {
                    event.preventDefault();
                }

                e.ondrop = event => {
                    const node = event.target.tagName === 'IMG' || event.target.tagName === 'SPAN' ?
                        event.target.parentNode : event.target;
                    
                    const target_id = parseInt(node.id.split('-')[2])
                    const holding_id = parseInt(drag_elem.id.split('-')[2])
                    
                    _settings.save_sites.splice(target_id, 0, _settings.save_sites.splice(holding_id, 1)[0])
                    createSavedSitesPage(edit_page_opened ? {create_manage_page: true} : {reload: true});
                    if(!edit_page_opened)
                        document.getElementById('manage-saved-sites').onclick = manageSavedSites;
                }
            })
        }

        async function clickEvent() {
            createSavedSitesPage({});
            document.getElementById('manage-saved-sites').onclick = manageSavedSites;
            await new Promise(s=>{setTimeout(s, 1)});
            document.getElementById("saved-sites").style.transform = 'none';
            current_elem.onclick = closeEvent;
        }
        
        async function closeEvent() {
            document.getElementById('saved-sites').style.transform = 'scaleX(0)';
            await new Promise(s=>{setTimeout(s, 1000)});
            document.getElementById('saved-sites').remove();
            current_elem.onclick = clickEvent;
        }

        current_elem.onclick = clickEvent;
    },
    start: () => {
        return "<img class='ico-img' src='src/pic/globe.svg'>";
    }
}

const settings = {
    loc: LOC_SIDE,
    id: 'settings',
    class: 'icon',
    title: '设置',
    loadEvent: async () => {
        const save_btn = document.getElementById(settings.id);

        async function createSettingPage() {
            document.getElementById(LOC_MAIN).insertAdjacentHTML("afterbegin", `
                <div class='settings' id='edit-settings'>
                    <div id='save-settings' class='save-settings'>
                        保存设置
                    </div>
                    <div>
                        <input type='checkbox' id='display-seconds' class='display-seconds' ${
                            _settings.clock_with_seconds ? 'checked' : ''
                        }>显示时间秒数:
                        <img id='display-seconds-status' src='src/pic/${_settings.clock_with_seconds ? 'check-circle' : 'circle'}.svg'>
                    </div>
                    <div>
                        使用搜索引擎:
                        <select id='change-search-engine'>
                            <option value='GOOGLE' ${_settings.search_engine === GOOGLE ? 'selected' : ''}>Google</option>
                            <option value='BING' ${_settings.search_engine === BING ? 'selected' : ''}>Bing</option>
                        </select>
                    </div>
                </div>
            `);
            document.getElementById('save-settings').onclick = saveDefaultSettings;
            document.getElementById('display-seconds').onchange = event => {
                _settings.clock_with_seconds = event.target.checked
                document.getElementById('display-seconds-status').src = 
                    `src/pic/${_settings.clock_with_seconds ? 'check-circle' : 'circle'}.svg`;
            }
            document.getElementById('change-search-engine').onchange = event => {
                _settings.search_engine = event.target.value
            }

            await new Promise(s=>{setTimeout(s, 1)});
            document.getElementById('edit-settings').style.transform = 'none';
            save_btn.onclick = closeSettingPage;
        }

        async function closeSettingPage() {
            const setting_page = document.getElementById('edit-settings');
            setting_page.style.transform = 'scaleX(0)';
            await new Promise(s=>{setTimeout(s, 1000)});
            setting_page.remove()
            save_btn.onclick = createSettingPage;
        }

        save_btn.onclick = createSettingPage;
    },
    start: () => {
        return "<img class='ico-img' src='src/pic/gear.svg'>";
    }
}

const user_manual = {
    loc: LOC_SIDE,
    id: 'user_manual',
    class: 'icon',
    title: '用户手册',
    start: () => {
        return `
        <a href='src/ex/manual.html' target='_blank'>
            <img class='ico-img' src='src/pic/book.svg'>
        </a>`;
    }
}

const tools_list = [
    clock, search_bar, save_sites, settings, user_manual
]