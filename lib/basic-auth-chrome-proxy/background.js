// based on post at: https://stackoverflow.com/questions/28543989/how-to-close-authentication-pop-up-in-selenium-ie-webdriver/28544422#28544422
// Add to run with following flag: --chromePluginPath=\basic-auth-chrome-proxy\aep-internal-proxy\aep-internal-proxy.zip

const creds = {
    user: null,
    password: null
};

chrome.runtime.onMessage.addListener(function(request) {
    if(request.type === 'SET_CREDENTIALS') {
        creds.user = request.user;
        creds.password = request.password;
    }
});

chrome.webRequest.onAuthRequired.addListener(
    function handler(details) {
        if (creds.user == null)
            return {cancel: true};

        const authCredentials = {username:creds.user, password: creds.password};
        return {authCredentials: authCredentials};
    },
    {urls: ["<all_urls>"]},
    ['blocking']
);