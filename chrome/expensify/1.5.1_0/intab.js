var port = chrome.runtime.connect({name: 'expensifychromeext'});
// tell the background that we are alive
initTabMessaging( function(){

        // listen to message from the background asking to scroll the page
        tabListenToMessage( function(msg) {
            switch( msg.cmd ){
                // send a message to the background with the dimension of the window in the tab
                case 'dimension':
                    // https://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript
                    var body = document.body;
                    var html = document.documentElement;
                    var height = Math.max( body.scrollHeight, body.offsetHeight,
                                           html.clientHeight, html.scrollHeight, html.offsetHeight );
                    var width = Math.max( body.scrollWidth, body.offsetWidth,
                                           html.clientWidth, html.scrollWidth, html.offsetWidth );
                    tabPostMessage({
                        cmd: 'dimension',
                        x: width,
                        totalHeight: height,
                        y: html.clientHeight,
                        posY: window.pageYOffset
                    });
                    break;

                // Scroll vertically and and send position to background
                case 'scroll':
                    window.scroll(0,msg.y);
                    tabPostMessage({cmd:'scrollDone', y: window.pageYOffset } );
                    break;

                // Scroll vertically
                case 'reset':
                    window.scroll(0, msg.y);
                    break;
            }
        });
});

function tabPostMessage( msg )
{
    port.postMessage( msg );
}

function tabListenToMessage( callback ){
    port.onMessage.addListener(function(msg) {
        callback( msg );
    });
}
