/**
 * Store size information about the page we are scanning
 */
var page = {
    height:0,
    width: 0,
    totalHeight: 0,
    /**
     * Current positi0n of the screen
     */
    posY:0,
    /**
     * Expected position of the screen
     */
    expectedY: 0,
    /**
     * Start Position, that we restore at the end of the "scan"
     */
    startY: 0
};

var port;

/**
 * Array of screenshot
 */
var img = [];

/**
 * Used by the icon animation stuff
 */
var imageIndex = 0;

/**
 * flag to run or not the animation the icon
 */
var animatedIcon = false;

/**
 * The ajax object
 */
var $xhr = undefined;

setTimeout(function() {
    createContextMenu();
}, 1000);

// Create the listener for communication back to us from the tab
// this is the brain of the app as it send orders and receive results from
// the tab and react to them
backgroundListenToMessage( function( msg ) {
    switch(msg.cmd){
        // init message return the dimension of the screen
        case 'dimension':
            page.height = msg.y;
            page.width  = msg.x;
            page.totalHeight = msg.totalHeight;
            page.startY = msg.posY;
            scroll();
            break;

        // the tab has done a scroll movement and return it new position
        case 'scrollDone':
            page.posY = msg.y;
            scrollIsDone();
            break;
    }
});


//------------------------------------------------------------------------------
//  FIRST RUN
//------------------------------------------------------------------------------

// ON init, we know we are not creating a receipt, and help in case of prb
setSetting('isRunning', false);

// Method called from the action bar to initiate the screenshot taking.
function screenshot(){
    trackButton('Back_Create_Receipt');
    if( getSetting('isRunning') === true ){
        notify('Not Too Fast', 'You are currently uploading a receipt. Please wait!', 4000);
        return;
    }

    if( getSetting( 'isAuth' ) !== true){
        showAuthPage();
        return;
    }

    // Mutex for uploading one receipt at the time
    setSetting('isRunning', true);

    animatedIcon = true;
    imageIndex = 1;
    animateIcon();
    notify('Expensify Web Receipts','Creating your receipt. One moment...', 5000);

    initBackgroundMessaging( function(){
        // ask dimension of the page to the content script
        backgroundSendMessage({cmd:'dimension'});
    })
}


/**
 * Function called after each scroll. Take a screen shot and ask to move
 * again if necessarry
 */
function scrollIsDone(){
    if( getSetting( 'isRunning' ) !== true){
        resetScroll();
        return;
    }

    // the position of the screen is matching what we want ==> we haven't reach
    // the bottom of the page
    if( page.posY == page.expectedY ){
        takeScreenshot( function(){
            page.expectedY += page.height;
            scroll();
        });
    }
    else{
        // now we have reach the bottom of the page, let's take the last screenshot
        // and construct the receipt
        takeScreenshot( function(){
            postProcessImages();
            resetScroll();
        });
    }
}

/**
 * simply send a message to the with the new Y position we want
 */
function scroll(){
    backgroundSendMessage( {cmd:"scroll", y: page.expectedY} );
}

/**
 * Send a message to the tab to scroll back to the original position
 */
function resetScroll(){
    backgroundSendMessage( {cmd:"reset", y:page.startY} );
}

/**
 * Take a screenshot of the page and call the callback function
 * We save the position information of the screenshot as we are going to need
 * them when we create the canvas
 */
function takeScreenshot( callback ){
    setTimeout( function(){
        getVisibleTab( function(urlData)
            {
                img.push(
                    {
                        y: page.posY,
                        expected: page.expectedY,
                        data: urlData
                    }
                );
                callback();
            }
        );
    },
    100 );
}

/**
 * Once we're done scrolling, create a canvas tag to join all the image togheter
 * and export the canvas content to a new image that we are going to send to the
 * server
 */
function postProcessImages(){
    //create canvas
    var canvas = document.createElement( 'canvas' );
    canvas.setAttribute( 'id', 'canvas' );
    canvas.setAttribute( 'width', page.width );
    canvas.setAttribute( 'height', page.totalHeight);
    document.body.appendChild( canvas );
    var ctx = canvas.getContext( '2d' );
    var counter = img.length;

    //add each screen-shot in the canvas to their Y position
    var currentPosition = 0;
    img.forEach( function( element, index ) {
        var i = new Image();
        i.onload = function(){
            ctx.drawImage( i, 0, currentPosition, page.width, page.height );
            currentPosition+=page.height;
            exportImageFromCanvas();
        };
        i.src = element.data;
    });

    function exportImageFromCanvas(){
        counter--;
        if( counter == 0 ){
            var imgDataUrl = canvas.toDataURL( "image/jpeg", 0.7 );

            // If the image size is greater than 8mb at 70 jpeg compression,
            // try 50 jpeg compression.
            if( imgDataUrl.length >= 8388608 )
                imgDataUrl = canvas.toDataURL( "image/jpeg", 0.5 );

            canvas.parentNode.removeChild( canvas );

            imgDataUrl = imgDataUrl.substr( imgDataUrl.indexOf(',')+1 );
            sendReceipt( imgDataUrl );
        }
    }
}

// Once the screen shot is stitched together, upload to API.
function sendReceipt( imgDataUrl ){
    if( getSetting( 'isAuth' ) !== true){
        showAuthPage();
        return;
    }
    if( getSetting( 'isRunning' ) !== true){
        return;
    }

    // Clean our globals
    page.expectedY = 0;
    page.height = 0;
    page.posY = 0;
    img = [];

    // If the image size so far is greater than 8 megabytes, then fail gracefully.
    if( imgDataUrl.length >= 8388608 ){
        notify( 'Expensify Web Receipts', 'Sorry, this page is too large to be exported via this method. Please try to find a smaller version of the page.' );
        return;
    }

    $xhr = $.ajax( {
        url: 'https://www.expensify.com/api/v1/',
        type: 'POST',
        dataType: 'text',
        data: {
            'partnerName'   : g_auth.partnerName,
            'partnerUserID' : getSetting( 'userID'),
            'sso'           : g_encryptionUtilities.getSSO(g_auth.partnerPassword, getSetting('userSecret'), g_auth.IV, g_auth.AES_KEY),
            'file'          : imgDataUrl,
            'action'        : 'UploadReceipt'
        },
        complete: function(){
            animatedIcon = false;
            setSetting('isRunning', false);
            $xhr = undefined;
        },
        error: function(jqXHR, textStatus, errorThrown) {
            trackButton('Ajax_Error');
            if( jqXHR.status == 401 ){
                setSetting('isAuth', false);
                notify( 'Oops...', 'We need you to log into Expensify again to continue.' );
                showAuthPage();
                return;
            }
            notify( 'Oops...', 'Something went wrong. Please try again later.' );
        },
        success: function( ret ){
            notify( 'Expensify Web Receipts', 'Receipt created!', 4000 );
        }
    });
}

function cancel(){
    notify( 'Cancel receipt creation', 'Your receipt was cancelled.' );
    animatedIcon = false;
    setSetting('isRunning', false);
    if( $xhr !== undefined ){
        $xhr.abort();
        $xhr = undefined;
    }
}

/**
 * Create a small animation on the icon of the expension to indicate that we are
 * loading
 */
function animateIcon(){
   if( animatedIcon ){
      setIcon( getURL('spinner/logo-icons_48_spinnerStep'+imageIndex+'.png') );
      imageIndex = (imageIndex + 1) %  8;
      if(imageIndex == 0 )
          imageIndex = 1;
      window.setTimeout(animateIcon, 300);
   }
   else{
      setIcon( getURL('logo48.png') );
   }
}

function backgroundSendMessage(m){
    port.postMessage( m );
}

chrome.runtime.onConnect.addListener(function(inboundPort) {
    port = inboundPort;
});
