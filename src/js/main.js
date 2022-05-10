function saveDefaultSettings() {
    const settings = 
`let _settings = {
    clock_with_seconds: ${_settings.clock_with_seconds},
    save_sites: [
        ${_settings.save_sites.map(e=>{
            return (
            `{title: '${e.title}', url: '${e.url}', ico: '${e.ico}'}`)
        }).join(',\n\t\t')}
    ],
    search_engine: ${_settings.search_engine}
}`

    const download_js = document.createElement('a');
    download_js.href = "data:text/plain;charset=utf-8,"+settings;
    download_js.download = 'settings.js';
    document.body.appendChild(download_js);
    download_js.click();
    download_js.remove();
}

window.onload = () => {
    loadTools();
}