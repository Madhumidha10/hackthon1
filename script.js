 // Client ID and API key from the Developer Console
 var CLIENT_ID = '619901457853-s3285icjgn8dlnn2b4phviubtmd60i41.apps.googleusercontent.com';
 var API_KEY = 'AIzaSyAuCl78cIN-siOl7KOdOtfqBUITowC1SuU';

   // Array of API discovery doc URLs for APIs used by the quickstart
   var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

   // Authorization scopes required by the API; multiple scopes can be
   // included, separated by spaces.
   var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

   var authorizeButton = document.getElementById('authorize_button');
   var signoutButton = document.getElementById('signout_button');
   var gbox=document.getElementById("authorized");
   /**
    *  On load, called to load the auth2 library and API client library.
    */
   function handleClientLoad() {
     gapi.load('client:auth2', initClient);
   }

   /**
    *  Initializes the API client library and sets up sign-in state
    *  listeners.
    */
   function initClient() {
     gapi.client.init({
       apiKey: API_KEY,
       clientId: CLIENT_ID,
       discoveryDocs: DISCOVERY_DOCS,
       scope: SCOPES
     }).then(function () {
       // Listen for sign-in state changes.
       gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

       // Handle the initial sign-in state.
       updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
       authorizeButton.onclick = handleAuthClick;
       signoutButton.onclick = handleSignoutClick;
     }, function(error) {
       console.log(JSON.stringify(error, null, 2));
     });
   }

   /**
    *  Called when the signed in status changes, to update the UI
    *  appropriately. After a sign-in, the API is called.
    */
   function updateSigninStatus(isSignedIn) {
     if (isSignedIn) {
       SigninStatus();
       listMessages('INBOX').then((res)=>{
        displayMessages();
        });
     } else {
       signoutStatus();
     }
   }

function signoutStatus() {
  authorizeButton.style.display = 'block';
  signoutButton.style.display = 'none';
  document.getElementById("authorized").style.display = "none";
  document.getElementById("sign_out").style.display = "block";
}

function displayMessages() {
  document.getElementById("loading").style.display = "none";
  document.querySelector(".container").style.display = "block";
  document.getElementById("authorized").style.display = "block";
}

function SigninStatus() {
  authorizeButton.style.display = 'none';
  signoutButton.style.display = 'block';
  document.getElementById("sign_out").style.display = "none";
  document.getElementById("authorized").style.display = "none";
  document.getElementById("loading").style.display = "block";
  document.querySelector(".container").style.display = "none";
}

   /**
    *  Sign in the user upon button click.
    */
   function handleAuthClick(event) {
     gapi.auth2.getAuthInstance().signIn();
   }

   /**
    *  Sign out the user upon button click.
    */
   function handleSignoutClick(event) {
     gapi.auth2.getAuthInstance().signOut();
   }

   /**
    * Append a pre element to the body containing the given message
    * as its text node. Used to display the results of the API call.
    *
    * @param {string} message Text to be placed in pre element.
    */
  //  function appendPre(message) {
  //    var pre = document.getElementById('content');
  //    var textContent = document.createTextNode(message + '\n');
  //    pre.appendChild(textContent);
  //  }

   /**
    * Print all Labels in the authorized user's inbox. If no labels
    * are found an appropriate message is printed.
    */
    var tbl_inbox=document.querySelector('.table-inbox tbody');
    var tbl_draft=document.querySelector('.table-draft tbody');
    var tbl_sent=document.querySelector('.table-sent tbody');  
    var err=document.querySelector('.error')
//to list the messages based on labelId (INBOX,DRAFT,SENT)
async function listMessages(lbl)
{
  defaultLoadSetup();
  var res=await gapi.client.gmail.users.messages.list({
    'userId': 'me',
    'labelIds': lbl,
    'maxResults': 10
});
var msgs = res.result.messages;
// console.log(msgs)
// console.log('Messages:');
if (msgs && msgs.length > 0) {
  for (i = 0; i < msgs.length; i++) {
  let msg = await gapi.client.gmail.users.messages.get({
    'userId': 'me',
    'id' : msgs[i].id
});

appendMsgRow(msg.result,lbl)
  }
  err.innerHTML=""
  document.querySelector('.table-inbox').style.display = "block";
  document.querySelector('.table-draft').style.display = "block";
  document.querySelector('.table-sent').style.display = "block";
}
else{
  err.style.display="block";
  if(lbl=="DRAFT")
  {
    err.innerHTML="You don't have any saved drafts.Saving a draft allows you to keep a message you aren't ready to send yet.";
    document.querySelector('.table-draft').style.display="none"
  }
  if(lbl=="SENT")
  {
    err.innerHTML="You don't have any sent Messages.";
    document.querySelector('.table-sent').style.display="none"
  }

  
}
}

function defaultLoadSetup() {
  document.querySelector('.table-inbox').style.display = "none";
  document.querySelector('.table-draft').style.display = "none";
  document.querySelector('.table-sent').style.display = "none";
  err.style.display="block";
  err.innerHTML=`<img src="images/gmail.gif"  alt="gmail loading" />`
  tbl_inbox.innerHTML = "";
  tbl_draft.innerHTML = "";
  tbl_sent.innerHTML = "";
}

//function to create a row and append to table body
function appendMsgRow(message,lbl)
{
  const headers=message.payload.headers;
  const from=getHeader(headers, 'From');
  const sub=getHeader(headers, 'Subject');
  const dt=getHeader(headers, 'Date');
  const to=getHeader(headers, 'To');
  
  var tr=CreateTag('tr');
  var td1,td2,atag;
  if(lbl==='INBOX'){
    td1=CreateTag('td',[],[],from);
    var td2=CreateTag('td');
    atag=CreateTag('a',['href','data-toggle','id'],[`#message-modal-${message.id}`,'modal',`message-link-${message.id}`],sub);
    td2.append(atag);
  var td3=CreateTag('td',[],[],dt);
  tr.append(td1,td2,td3);
  tbl_inbox.append(tr);

  appendInboxMsg(message, headers);
  messageLink(message);
  }
  else if(lbl==='DRAFT'){
    var td1=CreateTag('td',[],[],to);
    var td2=CreateTag('td');
    atag=CreateTag('a',['href','data-toggle','id'],[`#draft-modal-${message.id}`,'modal',`draft-link-${message.id}`],sub);    
    td2.append(atag);
    var td3=CreateTag('td',[],[],dt);
    tr.append(td1,td2,td3);
    tbl_draft.append(tr);
    console.log(message)
    appendDraftMsgRow(message, headers);
   draftLink(message);
  }
  else if(lbl==='SENT')
  {
    var td1=CreateTag('td',[],[],to);
    var td2=CreateTag('td');
    atag=CreateTag('a',['href','data-toggle','id'],[`#sent-modal-${message.id}`,'modal',`sent-link-${message.id}`],sub);    
    td2.append(atag);
    var td3=CreateTag('td',[],[],dt);
    tr.append(td1,td2,td3);
    tbl_sent.append(tr);
    appendSentMsg(message, headers);
    sentLink(message);
  }

 



}
//function to append sent Messages
function appendSentMsg(message, headers){
  var reply_to = (getHeader(headers, 'Reply-to') !== '' ?
  getHeader(headers, 'Reply-to') :
  getHeader(headers, 'From')).replace(/\"/g, '"');




  var reply_subject = 'Re: '+getHeader(headers, 'Subject').replace(/\"/g, '"');
  $('body').append(
    '<div class="modal fade" id="sent-modal-' + message.id +
    '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\
      <div class="modal-dialog modal-lg">\
        <div class="modal-content">\
          <div class="modal-header">\
            <button type="button"\
                    class="close"\
                    data-dismiss="modal"\
                    aria-label="Close">\
              <span aria-hidden="true">×</span></button>\
            <h4 class="modal-title" id="myModalLabel">' +
    getHeader(headers, 'Subject') +
    '</h4>\
          </div>\
          <div class="modal-body">\
            <iframe id="sent-iframe-' + message.id + '" srcdoc="<p>Loading...</p>" style="width:100%;height:500px" >\
            </iframe>\
          </div>\
          <div class="modal-footer">\
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
          </div>\
        </div>\
      </div>\
    </div>'
  );
}
//function to append Inbox Messages
function appendInboxMsg(message, headers) {

  var reply_to = (getHeader(headers, 'Reply-to') !== '' ?
  getHeader(headers, 'Reply-to') :
  getHeader(headers, 'From')).replace(/\"/g, '"');




  var reply_subject = 'Re: '+getHeader(headers, 'Subject').replace(/\"/g, '"');
  $('body').append(
    '<div class="modal fade" id="message-modal-' + message.id +
    '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\
      <div class="modal-dialog modal-lg">\
        <div class="modal-content">\
          <div class="modal-header">\
            <button type="button"\
                    class="close"\
                    data-dismiss="modal"\
                    aria-label="Close">\
              <span aria-hidden="true">×</span></button>\
            <h4 class="modal-title" id="myModalLabel">' +
    getHeader(headers, 'Subject') +
    '</h4>\
          </div>\
          <div class="modal-body">\
            <iframe id="message-iframe-' + message.id + '" srcdoc="<p>Loading...</p>" style="width:100%;height:500px" >\
            </iframe>\
          </div>\
          <div class="modal-footer">\
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
            <button type="button" class="btn btn-primary reply-button" data-dismiss="modal" data-toggle="modal" data-target="#reply-modal"\
            onclick="fillInReply(\
              \'' + reply_to + '\', \
              \'' + reply_subject + '\', \
              \'' + getHeader(headers, 'Message-ID') + '\'\
              );"\
            >Reply</button>\
          </div>\
        </div>\
      </div>\
    </div>'
  );
}
//function to display current message from Inbox
function messageLink(message) {
  document.getElementById('message-link-' + message.id).addEventListener('click', function () {
    var ifrm = document.getElementById('message-iframe-' + message.id).contentWindow.document;
    $('body', ifrm).html(getBody(message.payload));
  });
}
//function to display current message from Draft
function draftLink(message) {
  document.getElementById(`draft-link-${message.id}`).addEventListener('click', function () {
    var ifrm = document.getElementById(`draft-iframe-${message.id}`).contentWindow.document;
    $('body', ifrm).html(getBody(message.payload));
    $('#draft-message').val($('body', ifrm)[0].innerText);
  });
}
//function to display current message from Sent
function sentLink(message) {
  document.getElementById('sent-link-' + message.id).addEventListener('click', function () {
    var ifrm = document.getElementById('sent-iframe-' + message.id).contentWindow.document;
    $('body', ifrm).html(getBody(message.payload));
  });
}
//function to append Draft Message Row
function appendDraftMsgRow(message, headers) {
  
  $('body').append(
    '<div class="modal fade" id="draft-modal-' + message.id +
    '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\
      <div class="modal-dialog modal-lg">\
        <div class="modal-content">\
          <div class="modal-header">\
            <button type="button"\
                    class="close"\
                    data-dismiss="modal"\
                    aria-label="Close">\
              <span aria-hidden="true">×</span></button>\
            <h4 class="modal-title" id="myModalLabel">Draft</h4>\
          </div>\
           <form onsubmit="return sendEmailDraft()" >\
          <input type="hidden" id="draft-message-id" value=' + message.id + '/>\
          <div class="modal-body">\
            <div class="form-group">\
              <input type="text" class="form-control" id="draft-to" value="' +getHeader(headers, 'To') +'" disabled />\
            </div>\
            <div class="form-group">\
              <input type="text" class="form-control disabled" id="draft-subject" value="' +getHeader(headers, 'Subject') +'" disabled />\
            </div>\
            <div class="form-group">\
            <textarea class="form-control" id="draft-message" placeholder="Message" rows="10"  required></textarea>\
            <iframe id="draft-iframe-' + message.id + '" srcdoc="<p>Loading...</p>" style="width:100%;height:500px;display:none;" disabled >\
            </iframe>\
            </div>\
          </div>\
          <div class="modal-footer">\
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
            <button type="submit" id="senddraft-button" class="btn btn-primary" >Send</button>\
          </div>\
        </form>\
         </div>\
      </div>\
    </div>'
  );

  
 

}

//This function is used to fetch the proper header value from the message response.
function getHeader(headers, key) {
  var header = '';
  for(let i=0;i<headers.length;i++){
    if(headers[i].name == key){
      header = headers[i].value;
    }
  };
  return header;
}
function getBody(message) {
  var encodedBody = '';
  if(typeof message.parts === 'undefined')
  {
    encodedBody = message.body.data;
  }
  else
  {
    encodedBody = getHTMLPart(message.parts);
  }
  encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
  return decodeURIComponent(escape(window.atob(encodedBody)));
}

function getHTMLPart(arr) {
  for(var x = 0; x <= arr.length; x++)
  {
    if(typeof arr[x].parts === 'undefined')
    {
      if(arr[x].mimeType === 'text/html')
      {
        return arr[x].body.data;
      }
    }
    else
    {
      return getHTMLPart(arr[x].parts);
    }
  }
  return '';
}



//function to create tag with attributes and values
function CreateTag(tagname,att_name=[],att_value=[],value='')
{
 var el=document.createElement(tagname);
 if(att_name.length>0)
 {
    for(let i=0;i<att_name.length;i++)
   {
     el.setAttribute(att_name[i],att_value[i]);
   }
 }

 if(value!=='')
  el.innerHTML=value;
return el;
}



//function to send email
function sendEmail()
{
  $('#send-button').addClass('disabled');

  sendMessage(
    {
      'To': $('#compose-to').val(),
      'Subject': $('#compose-subject').val()
    },
    $('#compose-message').val(),
    composeTidy
  );
  err.style.display="block";
  err.innerHTML="Message send successfully.Refresh the Page and check it out in the SENT List."
  return false;
}

function composeTidy()
{
  $('#compose-modal').modal('hide');

  $('#compose-to').val('');
  $('#compose-subject').val('');
  $('#compose-message').val('');

  $('#send-button').removeClass('disabled');
  
}



//function to send Draft email
 function sendEmailDraft()
 {
  $('#send-button').addClass('disabled');

  sendDraft(
    {
      'To': $('#draft-to').val(),
      'Subject': $('#draft-subject').val()
      
    },
    $('#draft-message').val(),
    draftTidy,
    $('#draft-message-id').val()
  );
  err.style.display="block";
  err.innerHTML="Message send successfully.Refresh the Page and check it out in the SENT List."
  return false;
 }
function draftTidy()
{
    //$('#draft-modal-'+id).modal('hide');

  $('#draft-to').val('');
  $('#draft-subject').val('');
 $('#draft-message').val('');

  $('#senddraft-button').removeClass('disabled');
}
function sendReply()
{
  $('#reply-button').addClass('disabled');

  sendMessage(
    {
      'To': $('#reply-to').val(),
      'Subject': $('#reply-subject').val(),
      'In-Reply-To': $('#reply-message-id').val()
    },
    $('#reply-message').val(),
    replyTidy
  );
  err.style.display="block";
  err.innerHTML="Message send successfully.Refresh the Page and check it out in the SENT List."
  return false;
}
//function to fill reply content
function replyTidy()
{
  $('#reply-modal').modal('hide');

  $('#reply-message').val('');

  $('#reply-button').removeClass('disabled');
}
//function to fill reply content
function fillInReply(to, subject, message_id)
{
  $('#reply-to').val(to);
  $('#reply-subject').val(subject);
  $('#reply-message-id').val(message_id);
}
//functionality to send a text email.
function sendMessage(headers_obj, message, callback)
{
  var email = '';

  for(var header in headers_obj)
    email += header += ": "+headers_obj[header]+"\r\n";

  email += "\r\n" + message;

  var sendRequest = gapi.client.gmail.users.messages.send({
    'userId': 'me',
    'resource': {
      'raw': window.btoa(email).replace(/\+/g, '-').replace(/\//g, '_')
    }
  });
 
  // return sendRequest.then(callback);
  return sendRequest.then(callback,console.log("send...."));
}





//functionality to send a text email.
function sendDraft(headers_obj, message, callback)
{
  var email = '';

  for(var header in headers_obj)
    email += header += ": "+headers_obj[header]+"\r\n";

  email += "\r\n" + message;
// console.log(id)
var sendRequest = gapi.client.gmail.users.messages.send({
  'userId': 'me',
  'resource': {
    'raw': window.btoa(email).replace(/\+/g, '-').replace(/\//g, '_')
  }
});

  // var sendRequest = gapi.client.gmail.users.drafts.send({
  //   'userId': 'me',
  //   'resource': {
  //     'raw': window.btoa(email).replace(/\+/g, '-').replace(/\//g, '_')
  //   }
  // });
 
  // return sendRequest.then(callback);
  // gapi.client.gmail.users.drafts.delete({
  //   'userId': 'me',
  //   'id': `${id}`
  // }).then(console.log('draft deleted'))
  return sendRequest.then(callback,console.log("senddraft...."));
}