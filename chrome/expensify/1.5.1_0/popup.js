// if we are not connected, we hide the option link
// and change the text
if (getSetting('isAuth') !== true){
    $('#send_receipt').text('Connect To Expensify').live('click', function(){
        showAuthPage();
    });
    $('#signout').hide();
    $('#visit_site').text('Visit the Website').live('click',function(){
        trackButton('View_Site');
        openTab('https://www.expensify.com/');
    });
}
else{
    $('#visit_site').live('click',function(){
        trackButton('View_Receipt');
        openTab('https://www.expensify.com/receipts');
    });
}

if (getSetting('isRunning') === true){
    $("#cancel").show().click( function(){
        trackButton('Cancel');
        runBackgroundFunction('cancel');
    });
}

$("#help_page").click(function(){
    openTab('https://www.expensify.com/help/extension/chrome', '_blank');
    return false;
});

$("#signout").click(function(){
    setSetting('isAuth', false);
    window.close();
    return false;
});

$('#send_receipt').live('click', function(){
    chrome.tabs.query( {currentWindow: true, active: true}, function (tabs) {
        var tabUrl = tabs[0].url;
        var gmail = tabUrl.match(/mail.google.com/);
        if (!gmail) {
            chrome.tabs.reload();
            chrome.webNavigation.onCompleted.addListener(function(){
                setTimeout(function () {
                    trackButton('PopUp_Create_Receipt');
                    if (!getSetting('userID') || !getSetting('userSecret')) {
                        showAuthPage();
                    }
                    else {
                        window.close();
                        runBackgroundFunction('screenshot');
                    }
                },
                500);
            });
        }
        else {
            notify('Oops! No screenshots allowed.', 'Forward to receipts@expensify.com or upload receipts at expensify.com.', 10000);
            window.close();
        };
    });
});
