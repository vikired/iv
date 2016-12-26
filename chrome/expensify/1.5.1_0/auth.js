
            function createUserID(){
                return '' + (new Date().getTime() + Math.floor( Math.random() * 1000 ) ) + '@chromeexpensify.com';
            }

            function createUserSecret(){
                return (Math.floor(Math.random() * 1000)) + 's'+ new Date().getTime() + (Math.floor( Math.random() * 1000 ) );
            }
            $("#btn_tryagain").click(function(){
                setSetting('isAuth', false);
                window.location.href = '/auth.html';
                return false;
            });

            // Reset settings if one of the credential is missing
            if (!getSetting('userID') || !getSetting('userSecret')){
                removeSetting('userID');
                removeSetting('userSecret');
                setSetting('isAuth', false);
                setSetting('isRunning', false);
            }

            if (getSetting('isAuth') === true){
                // YOUPILIPLAL
                $(".logged_in").show();
            }else if (window.location.search){
                var param = window.location.search.substr( 1 );
                var param = param.split('&');
                var paramMap = {};
                param.forEach (function (elem){
                    var dual = elem.split('=');
                    paramMap[dual[0]] = dual[1];
                });

                if (paramMap.callback === 'success'){
                    setSetting('isAuth', true);
                    $('#dialog_done').show();
                    window.top.location.href = getURL('auth.html');
                }else{
                    $('#dialog_fail').show();
                }
            }else{
                var userID     = createUserID();
                var userSecret = createUserSecret();
                var sso        = g_encryptionUtilities.getSSO(g_auth.partnerPassword, userSecret, g_auth.IV, g_auth.AES_KEY);
                var tabURL     = window.location.href;

                setSetting('userID', userID);
                setSetting('userSecret', userSecret);
                setSetting('isAuth', false);

                // Build the iframe source URL
                var url = 'https://www.expensify.com/api/v1/?action=Auth&sso='+ encodeURIComponent(sso) +'&partnerName='+ encodeURIComponent(g_auth.partnerName) + '&partnerUserID='+ encodeURIComponent(userID)+'&exitTo='+ encodeURIComponent(tabURL);

                // Create iframe
                var iframe = document.createElement('iframe');
                iframe.scrolling = 'no';
                iframe.src = url;

                // Create div containing the iframe
                var div = document.createElement('div');
                div.className = 'iframe';
                div.appendChild(iframe);

                // Insert the iframe on the page
                document.body.appendChild(div);
            }
            if (getSetting('isAuth') === true){
                window.close();
            }
