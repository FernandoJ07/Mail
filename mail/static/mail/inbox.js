document.addEventListener('DOMContentLoaded', function() {


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', sendEmail);


  // By default, load the inbox
  load_mailbox('inbox');
});

function sendEmail(event) {
  
  event.preventDefault();

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    load_mailbox('sent');
  })
}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Getting emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach((email) => {

      //Creating letters for the mailbox
      const container = document.createElement('div');
      const container1 = document.createElement('div');
      const container2 = document.createElement('div');
      const contentDate = document.createElement('div')
      const recipients = document.createElement('h4');
      const sender = document.createElement('h4');
      const subject = document.createElement('h5');
      const date = document.createElement('p');

      //Assigning attributes
      container.setAttribute('class', 'divParent');
      container1.setAttribute('class', 'child1');
      container2.setAttribute('class', 'child2');
      contentDate.setAttribute('class', 'child3');
      recipients.setAttribute('id', 'recipients');
      sender.setAttribute('id', 'sender');
      subject.setAttribute('id', 'subject');
      date.setAttribute('id','date');

      //Filling information
      recipients. textContent = email.recipients;
      sender.textContent = email.sender;
      subject.textContent = email.subject;
      date.textContent = email.timestamp;

      //Nesting parent and child nodes
      if (mailbox === 'sent'){
        container1.appendChild(recipients);
      }else{
        container1.appendChild(sender);
      }

      container2.appendChild(subject);
      contentDate.appendChild(date);
      container.appendChild(container1);
      container.appendChild(container2);
      container.appendChild(contentDate);

        //if it is read it has a different color

      if (email.read){
        container.style.background = '#F5F5F5';
      }else{
        container.style.background = 'white';
      }

      document.querySelector('#emails-view').appendChild(container);
      container.addEventListener('click', ()=> showEmail(email.id, mailbox));
      
    })
  })
}

function showEmail(email_id, mailbox){

  // Show individual mail 
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  document.querySelector("#email-view").innerHTML = ''

  // Getthing data 
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    
    createEmailBody(email, mailbox);
    readEmail(email);
  })

}

// fuction for showEmail function
function createEmailBody(email, mailbox){

    //Creating letters for the mailbox
    const container = document.createElement('div');
    const sender = document.createElement('h4');
    const recipients = document.createElement('h5');
    const body = document.createElement('div');
    const subject = document.createElement('h5');
    const date = document.createElement('p');
    const btnReply = document.createElement('button');
    const btnArchived = document.createElement('button');

      //Filling information
    sender.innerHTML = `<b>From</b>: ${email.sender}`;
    recipients.innerHTML = `<b>To</b>: ${ email.recipients}`;
    subject.innerHTML = `<b>Subject</b>: ${email.subject}`;
    date.innerHTML = `<b>Timestamp</b>: ${email.timestamp}`;
    btnReply.innerHTML += `Reply`

    if (email.archived){
      btnArchived.innerHTML += 'Unarchive'
    }else{
      btnArchived.innerHTML += 'Archive'
    }

    const text = email.body;
    body.innerHTML = `<hr>${text.replace(/\r?\n/g, '<br />')}`;

    body.setAttribute('style', 'font-size:20px');
    btnReply.setAttribute('class', 'btn btn-outline-primary');
    btnArchived.setAttribute('class', 'btn btn-outline-secondary ml-2');

      //Nesting parent and child nodes
    container.appendChild(sender)
    container.appendChild(recipients);
    container.appendChild(subject);
    container.appendChild(date);
    container.appendChild(btnReply);
    if (mailbox !== 'sent'){
      container.appendChild(btnArchived);
    }
    container.appendChild(body);

    
    

    document.querySelector('#email-view').appendChild(container);    
    btnArchived.addEventListener('click', () => archived(email))
    btnReply.addEventListener('click', () => reply(email))  
}

function readEmail(email){
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true

    })
  })
}

function archived(email){

  if (email.archived){
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    location.reload();
    load_mailbox('inbox')
  }else{
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    location.reload();
    load_mailbox('inbox')
  }
  
}

function reply(email){
  compose_email()

  document.querySelector('#compose-recipients').value = email.sender;

  if(email.subject.substr(0,4) === 'Re: '){
    document.querySelector('#compose-subject').value = email.subject
  }else{
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`    
  }

  document.querySelector('#compose-body').value = `\n-----------------------\n ${email.timestamp} ${email.sender} wrote:\n - ${email.body}`;


}




