function spin() {

    setTimeout(function() {
        document.getElementById("myDiv").style.display = "none";
    }, 1000); // 1 seconds

}


var currentUserKey = '';
var chatKey = '';
var freind_id = '';

document.addEventListener('keydown', function(key) {
        if (key.which === 13) {
            sendMessage();
        }
    })
    //////////////////////Send Button

function changeSendIcon(control) {
    if (control.value !== '') {
        document.getElementById('send').removeAttribute('style');
        document.getElementById('audio').setAttribute('style', 'display:none')
    } else {
        document.getElementById('audio').removeAttribute('style');
        document.getElementById('send').setAttribute('style', 'display:none')
    }
}

/////////////// Voice MEssage

let chunks = [];
let recorder;
var timeout;

function record(control) {
    let device = navigator.mediaDevices.getUserMedia({ audio: true });
    device.then(stream => {

        if (recorder === undefined) {

            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = e => {
                chunks.push(e.data);

                if (recorder.state === 'inactive') {
                    let blob = new Blob(chunks, { type: 'audio/webm' });

                    var reader = new FileReader();
                    reader.addEventListener("load", function() {
                        var chatMessage = { userId: currentUserKey, msg: reader.result, msgType: 'audio', dateTime: new Date().toLocaleString() };

                        firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function(error) {
                            if (error) {
                                alert(error);
                            } else {

                                document.getElementById('txtMessage').value = '';
                                document.getElementById('txtMessage').focus();
                            }
                        })
                    }, false);
                    reader.readAsDataURL(blob)
                }
            }
            recorder.start();
            control.setAttribute('class', 'fas fa-stop fa-2x')
        }
    });
    if (recorder !== undefined) {
        if (control.getAttribute('class').indexOf('stop') !== -1) {
            recorder.stop();
            control.setAttribute('class', 'fas fa-microphone fa-2x')
        } else {
            chunks = [];
            recorder.start();
            control.setAttribute('class', 'fas fa-stop fa-2x')

        }

    }
}



//////////////////////// Emoji

loadAllEmoji();

function loadAllEmoji() {
    var emoji = '';
    for (var i = 128512; i <= 128586; i++) {
        emoji += `<a onclick="getEmoji(this)" style="font-size:1em;cursor:pointer;">&#${i};</a>`;
    }
    document.getElementById('smiliey').innerHTML = emoji;
}

function showEmojiPanel() {
    document.getElementById('emoji').removeAttribute('style');
}

function hideEmojiPanel() {
    document.getElementById('emoji').setAttribute('style', 'display:none');
}

function getEmoji(control) {
    document.getElementById('txtMessage').value += control.innerHTML;
}
//////////////

function startChat(freindKey, freindName, freindPhoto) {

    var freindlist = { freindId: freindKey, userId: currentUserKey }
    freindId = freindKey;
    var db = firebase.database().ref('freind_list');
    var flag = false;
    db.on('value', function(freinds) {
        freinds.forEach(function(data) {
            var user = data.val();
            if ((user.freindId === freindlist.freindId && user.userId === freindlist.userId) || (user.freindId === freindlist.userId && user.userId === freindlist.freindId)) {
                flag = true;
                chatKey = data.key;
            }
        });
        if (flag === false) {
            chatKey = firebase.database().ref('freind_list').push(freindlist, function(error) {
                if (error) {
                    alert(error);
                } else {
                    document.getElementById('chatPanel').removeAttribute('style');
                    document.getElementById('divStart').removeAttribute('style', 'display:none');

                    hideChat();

                }
            }).getkey();
        } else {
            document.getElementById('chatPanel').removeAttribute('style');
            document.getElementById('divStart').removeAttribute('style', 'display:none');

            hideChat();
        }
        ////////////////////
        // display freind name and photo

        document.getElementById('divChatName').innerHTML = freindName;
        document.getElementById('imgChat').src = freindPhoto;
        document.getElementById('messages').innerHTML = '';



        document.getElementById('txtMessage').value = '';
        document.getElementById('txtMessage').focus();
        //////////////////////////////

        //Display message of Chat

        loadChatMessages(chatKey, freindPhoto);

    });


}
//////////////

function loadChatMessages(chatKey, freindPhoto) {
    var db = firebase.database().ref('chatMessages').child(chatKey);
    db.on('value', function(chats) {
        var messageDisplay = '';
        chats.forEach(function(data) {
            var chat = data.val();
            var dateTime = chat.dateTime.split(",");
            var msg = '';
            if (chat.msgType === 'image') {
                msg = `<img src='${chat.msg}' class='img-fluid'  />`
            } else if (chat.msgType === 'audio') {
                msg = `<audio controls>
                        <source src="${chat.msg}" type="video/webm" />
                    </audio>`;
            } else {
                msg = chat.msg;
            }
            if (chat.userId !== currentUserKey) {
                messageDisplay += ` <div class="row ">
                <div class="col-2 col-sm-1 col-md-1 ">
                    <img class="cpic mt-3 rounded-circle" src="${freindPhoto}" alt=" ">
                </div>
                <div class="col-7 col-sm-7 col-md-7 ">
                    <p class="receive">
                    ${msg}
                    <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span></p>
                    </div>
            </div>`;


            } else {
                messageDisplay += ` <div class="row justify-content-end">
                <div class="col-7 col-sm-7 col-md-7">
                 <p class="sent float-right">
                 ${msg}
                  <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span></p>
          </div>
          <div class="col-2 col-sm-1 col-md-1">
             <img class="cpic mt-3 rounded-circle" src="${firebase.auth().currentUser.photoURL}" alt="">
            </div>
         </div>`;

            }


        })
        document.getElementById('messages').innerHTML = messageDisplay;
        document.getElementById('messages').scrollTo(0, document.getElementById('messages').clientHeight)
    })
}



function showChat() {
    document.getElementById('side1').classList.remove('d-none', 'd-md-block');
    document.getElementById('side2').classList.add('d-none');
}

function hideChat() {
    document.getElementById('side1').classList.add('d-none', 'd-md-block');
    document.getElementById('side2').classList.remove('d-none');
}

function dleteall() {
    firebase.database().ref('chatMessages').child(chatKey).remove();
}



function sendMessage() {
    var chatMessage = { userId: currentUserKey, msg: document.getElementById('txtMessage').value, msgType: 'normal', dateTime: new Date().toLocaleString() };

    firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function(error) {
        if (error) {
            alert(error);
        } else {
            firebase.database().ref('fcmToken').child(freindId).once('value').then(function(data) {
                $.ajax({
                    url: 'https://fcm.googleapis.com/fcm/send',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'key=AAAATCGCcho:APA91bHonKx5oRfOh56Ej319R_aGdmKWlMdcfJ0DUDozaPawO9iO8L4aiAAE2VwCnqmXoHkHjzo24G1FRJEdTvSLBmgPT7Ie4bA_Ok_WQh95V_iJi5QT_j-Rq9rtP2G_758ZIaj5RaHu'
                    },
                    data: JSON.stringify({
                        'to': data.val().token_id,
                        'data': { 'message': chatMessage.msg.substring(0, 30) + '...', 'icon': firebase.auth().currentUser.photoURL }
                    }),
                    success: function(response) {
                        console.log(response)
                    },
                    error: function(xhr, status, error) {
                        console.log(xhr.error)
                    }
                });

            });
            document.getElementById('txtMessage').value = '';
            document.getElementById('txtMessage').focus();

        }
    })
}

////////////////Image
function chooseImage() {
    document.getElementById('imageFile').click();
}

function sendImage(event) {
    var file = event.files[0];

    if (!file.type.match('image.*')) {
        alert("Please select Image File only....")
    } else {
        var reader = new FileReader();
        reader.addEventListener("load", function() {
            var chatMessage = { userId: currentUserKey, msg: reader.result, msgType: 'image', dateTime: new Date().toLocaleString() };

            firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function(error) {
                if (error) {
                    alert(error);
                } else {

                    document.getElementById('txtMessage').value = '';
                    document.getElementById('txtMessage').focus();
                }
            })
        }, false);
        if (file)
            reader.readAsDataURL(file)
    }
}
//////////////////////////////

function loadChatList() {
    var db = firebase.database().ref('freind_list');
    db.on('value', function(lists) {
        document.getElementById('lstChat').innerHTML = `<li class="list-group-item bg-light " style="background-color: #f8f8f8; ">
        <input type="text " name=" " id=" " placeholder="Search or new chat " class="form-control form-rounded ">
    </li>`;
        lists.forEach(function(data) {
            var lst = data.val();
            var freindKey = '';
            if (lst.freindId === currentUserKey) {
                freindKey = lst.userId;
            } else if (lst.userId === currentUserKey) {
                freindKey = lst.freindId;
            }
            if (freindKey !== "") {

                firebase.database().ref('users').child(freindKey).on('value', function(data) {
                    var user = data.val();
                    document.getElementById('lstChat').innerHTML += ` <li class="list-group-item list-group-item-action " style="cursor: pointer; " onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                <div class="row ">
                    <div class="col-2 col-sm-2 col-md-2 ">
                        <img class="mainpic rounded-circle" src="${user.photoURL}" alt=" ">
                    </div>
                    <div class="col-10 col-sm-10 col-md-10 ">
                        <div class="name ">${user.name}</div>
                        <div class="under-name ">This is some message text...</div>
                    </div>
                </div>
            </li>`;
                })
            }
        });
    });
}

function populateUserList() {
    document.getElementById('fstUser').innerHTML = `<div class="text-center">
    <span class="spinner-border text-primary mt-5" style="width:7rem; height:7rem"></span>
</div>`;


    var db = firebase.database().ref('users');
    var dbNoti = firebase.database().ref('notification');
    var lst = '';
    db.on('value', function(users) {
        if (users.hasChildren()) {

            lst = `<li class="list-group-item bg-light " style="background-color: #f8f8f8; ">
<input type="text " name=" " id="" placeholder="Search or new chat " class="form-control form-rounded ">
</li>`;
            document.getElementById('fstUser').innerHTML = lst;
        }
        users.forEach(function(data) {
            var user = data.val();
            if (user.email !== firebase.auth().currentUser.email) {
                dbNoti.orderByChild('sendTo').equalTo(data.key).on('value', function(noti) {
                    if (noti.numChildren() > 0 && Object.values(noti.val())[0].sendfrom === currentUserKey) {
                        lst = `<li class="list-group-item list-group-item-action"  style="cursor: pointer; ">
          <div class="row ">
          <div class="col-md-2 ">
          <img class="mainpic rounded-circle" src="${user.photoURL}" alt=" ">
          
          </div>
          <div class="col-md-10 ">
          <div class="name" >${user.name} <button class="btn btn-sm btn-default" style="float:right"><i class="fas fa-user-plus"> </i> Sent</button></div>
          </div>
          </div>
          </li>`
                        document.getElementById('fstUser').innerHTML += lst;
                    } else {

                        dbNoti.orderByChild('sendfrom').equalTo(data.key).on('value', function(noti) {
                            if (noti.numChildren() > 0 && Object.values(noti.val())[0].sendTo === currentUserKey) {
                                lst = `<li class="list-group-item list-group-item-action"  style="cursor: pointer; ">
                <div class="row ">
                <div class="col-md-2 ">
                <img class="mainpic rounded-circle" src="${user.photoURL}" alt=" ">
                
                </div>
                <div class="col-md-10 ">
                <div class="name" >${user.name} <button class="btn btn-sm btn-default" style="float:right"><i class="fas fa-user-plus"> </i> Pending</button></div>
                </div>
                </div>
                </li>`
                                document.getElementById('fstUser').innerHTML += lst;
                            } else {

                                lst = `<li class="list-group-item list-group-item-action" data-dismiss="modal" style="cursor: pointer; ">
                <div class="row ">
                <div class="col-md-2 ">
                <img class="mainpic rounded-circle" src="${user.photoURL}" alt=" ">
                
                </div>
                <div class="col-md-10 ">
                <div class="name" >${user.name} <button onclick="sendRequest('${data.key}')" class="btn btn-sm btn-primary" style="float:right"><i class="fas fa-user-plus"> </i> Send Request</button></div>
                </div>
                </div>
                </li>`
                                document.getElementById('fstUser').innerHTML += lst;

                            }
                        });
                    }
                })
            }
        });

    });

}

function notificationCounter() {
    let db = firebase.database().ref('notification');
    db.orderByChild('sendTo').equalTo(currentUserKey).on('value', function(noti) {
        let notiArray = Object.values(noti.val()).filter(n => n.status === 'Pending');
        document.getElementById('notification').innerHTML = notiArray.length;
    })
}

function sendRequest(key) {
    let notification = {
        sendTo: key,
        sendfrom: currentUserKey,
        name: firebase.auth().currentUser.displayName,
        photo: firebase.auth().currentUser.photoURL,
        dateTime: new Date().toLocaleString(),
        status: 'Pending'
    };

    firebase.database().ref('notification').push(notification, function(error) {
        if (error) { alert(error) } else {
            populateUserList();
        }
    })
}


function populateNotification() {
    document.getElementById('fstNotification').innerHTML = `<div class="text-center">
                                                          <span class="spinner-border text-primary mt-5" style="width:7rem; height:7rem"></span>
                                                     </div>`;


    var db = firebase.database().ref('notification');
    var lst = '';
    db.orderByChild('sendTo').equalTo(currentUserKey).on('value', function(notis) {
        if (notis.hasChildren()) {
            lst = `<li class="list-group-item bg-light " style="background-color: #f8f8f8; ">
                <input type="text " name=" " id="" placeholder="Search or new chat " class="form-control form-rounded ">
            </li>`;

        }
        notis.forEach(function(data) {
            var noti = data.val();
            if (noti.status === 'Pending') {

                lst += `<li class="list-group-item list-group-item-action"  data-dismiss="modal" style="cursor: pointer; ">
                         <div class="row ">
                         <div class="col-md-2 ">
                         <img class="mainpic rounded-circle" src="${noti.photo}" alt=" ">
                         
                      </div>
                      <div class="col-md-10 ">
                      <div class="name ">${noti.name}
                      <button onclick="reject('${data.key}')" class="btn btn-sm btn-danger" style="float:right;margin-left:1%;"><i class="fas fa-user-times"> </i> Reject</button>
                      <button onclick="accept('${data.key}')" class="btn btn-sm btn-success" style="float:right"><i class="fas fa-user-check"> </i> Accept</button></div>
                      </div>
                      </div>
                      </li>`

            }
        });
        document.getElementById('fstNotification').innerHTML = lst;

    });
}

function reject(key) {

    // obj.status = "reject";
    let db = firebase.database().ref('notification').child(key).once('value', function(noti) {

        let obj = noti.val();
        obj.status = 'reject';
        firebase.database().ref('notification').child(key).update(obj, function(error) {
            if (error) {
                alert(error)
            } else {
                populateNotification();
            }
        })
    });
}

function accept(key) {
    let db = firebase.database().ref('notification').child(key).once('value', function(noti) {

        var obj = noti.val();
        obj.status = 'accept';
        firebase.database().ref('notification').child(key).update(obj, function(error) {
            if (error) {
                alert(error)
            } else {
                populateNotification();
                var freindlist = { freindId: obj.sendfrom, userId: obj.sendTo }
                firebase.database().ref('freind_list').push(freindlist, function(error) {
                    if (error) { alert(error) } else {
                        //do
                    }
                })
            }
        })
    });
}


function populateFreindList() {

}

function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
}

function signOut() {
    firebase.auth().signOut();
}

function onFirebaseStateChanged() {
    firebase.auth().onAuthStateChanged(onStateChanged);
}

function onStateChanged(user) {
    if (user) {
        // alert(firebase.auth().currentUser.email + '\n' + firebase.auth().currentUser.displayName);
        var userProfile = { email: '', name: '', photoURL: '' }
        userProfile.email = firebase.auth().currentUser.email
        userProfile.name = firebase.auth().currentUser.displayName
        userProfile.photoURL = firebase.auth().currentUser.photoURL

        var db = firebase.database().ref('users');
        var flag = false;
        db.on('value', function(users) {
            users.forEach(function(data) {
                var user = data.val();
                if (user.email === userProfile.email) {
                    currentUserKey = data.key;
                    flag = true;
                }
            });


            if (flag === false) {
                firebase.database().ref('users').push(userProfile, callback);

            } else {
                document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
                document.getElementById('xxx').innerHTML = firebase.auth().currentUser.displayName;

                document.getElementById('linksignin').style = 'display:none';
                document.getElementById('linksignout').style = '';

            }

            const messaging = firebase.messaging();

            navigator.serviceWorker.register('./firebase-messaging-sw.js')
                .then((registration) => {
                    messaging.useServiceWorker(registration);


                    messaging.requestPermission().then(function() {
                        return messaging.getToken();
                    }).then(function(token) {
                        firebase.database().ref('fcmToken').child(currentUserKey).set({ token_id: token })
                    })
                })
            document.getElementById('linkNewChat').classList.remove('disabled');
            loadChatList();
            notificationCounter();

        });

    } else {

        document.getElementById('imgProfile').src = 'https://cdn3.iconfinder.com/data/icons/social-messaging-productivity-6/128/profile-male-circle2-512.png';
        document.getElementById('imgProfile').title = '';

        document.getElementById('linksignin').style = '';
        document.getElementById('linksignout').style = 'display:none';

        document.getElementById('linkNewChat').classList.add('disabled')
    }

}

function callback(error) {
    if (error) {
        alert(error)
    } else {
        document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
        document.getElementById('xxx').innerHTML = firebase.auth().currentUser.displayName;

        document.getElementById('linksignin').style = 'display:none';
        document.getElementById('linksignout').style = '';

    }
}

///////////////call auth state change

onFirebaseStateChanged();