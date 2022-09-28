document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', event => send_email(event));


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox === 'sent') {
    get_sent_emails();
  } else if (mailbox === 'inbox') {
    get_inbox_emails();
  }
}

function send_email(event) {
  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body 
    })
  })
    .then(response => response.json())
    .then(result => {
      const span = document.createElement('span');
      if (result.message) {
        span.innerHTML = result.message;
        span.className = 'success-message';
        document.querySelector('#messages').append(span);
        load_mailbox('sent');
      } else {
        span.innerHTML = result.error;
        span.className = 'error-message';
        document.querySelector('#messages').append(span);
      }
    })
}

function get_sent_emails() {
  const emailDiv = document.querySelector('#emails-view');

  fetch('/emails/sent')
    .then(response => response.json())
    .then(result => {
      result.forEach(email => {
        const section = document.createElement('section');
        section.className = 'email-display-section'
        const p1 = document.createElement('span');
        const p2 = document.createElement('span');
        const p3 = document.createElement('span');

        p1.className = 'email-address';
        p2.className = 'subject-line';
        p3.className = 'timestamp';
  
        p1.innerHTML = email.recipients;
        p2.innerHTML = email.subject;
        p3.innerHTML = email.timestamp;
        section.appendChild(p1);
        section.appendChild(p2);
        section.appendChild(p3);
  
        emailDiv.appendChild(section);
      })
    });
}

function get_inbox_emails() {
  const emailDiv = document.querySelector('#emails-view');

  fetch('/emails/inbox')
    .then(response => response.json())
    .then(result => {
      result.forEach(email => {
        const section = document.createElement('section');
        section.className = 'email-display-section'
        const p1 = document.createElement('span');
        const p2 = document.createElement('span');
        const p3 = document.createElement('span');

        p1.className = 'email-address';
        p2.className = 'subject-line';
        p3.className = 'timestamp';
  
        p1.innerHTML = email.sender;
        p2.innerHTML = email.subject;
        p3.innerHTML = email.timestamp;
        section.appendChild(p1);
        section.appendChild(p2);
        section.appendChild(p3);
  
        emailDiv.appendChild(section);
      })
    })
}