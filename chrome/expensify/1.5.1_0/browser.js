var port;


function backgroundListenToMessage( callback ){
    chrome.runtime.onConnect.addListener( function( port )
    {
        port.onMessage.addListener( function( msg ) {
            callback( msg );
        });
    });
}

function initBackgroundMessaging( callback ){
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {}, function(response) {
            callback();
        });
    });
}

function initTabMessaging( callback ){
    chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        callback();
        sendResponse();
    });
}


function openTab( url ){
    chrome.tabs.create({
        'url': url
    });
}

function getVisibleTab( callback ){
    chrome.tabs.captureVisibleTab( null, {format: 'jpeg', quality:70}, callback );
}

function getSetting( key ){
    var item = localStorage.getItem( key );
    if( item !== undefined ){
        return JSON.parse( item );
    }
    else{
        return undefined;
    }
}

function setSetting( key, value )
{
    return localStorage.setItem( key, JSON.stringify(value) );
}

function removeSetting( key ){
    localStorage.removeItem( key );
}

function runBackgroundFunction( name )
{
    chrome.extension.getBackgroundPage()[name]();
}

function getURL( file )
{
     return chrome.extension.getURL( file );
}

function setIcon( pathFile )
{
    chrome.browserAction.setIcon({path: pathFile});
}

function notify( title, msg, delay )
{
    var iconUrl = getURL( 'logo.png');

    // Empty ID (1st param) so that it gets auto generated
    chrome.notifications.create( '', {
        type: 'basic',
        iconUrl: iconUrl,
        title: title,
        message: msg
    }, function(notificationId){
        setTimeout(function(){
            chrome.notifications.clear(notificationId);
        }, delay || 6000);
    });
}

function createContextMenu()
{
    chrome.contextMenus.create({
        type: "normal",
        title: "Create Receipt From Page",
        contexts: ["all"],
        onclick: function(){
            trackButton( 'Context_Menu' );
            if( !getSetting('userID') || !getSetting('userSecret')  ){
                showAuthPage();
            }
            else{
                screenshot();
            }
        }
    });

}

function showAuthPage(){
    openTab( window.open("auth.html","signin_window","menubar=1,resizable=0,top=200,left=600,width=300,height=450"));
}
