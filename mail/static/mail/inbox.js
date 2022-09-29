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

function compose_email(replyInfo) {
  
  removeSuccessMessage();
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  if (replyInfo.from !== undefined) {
    document.querySelector('#compose-recipients').value = replyInfo.from;
    if (replyInfo.subject.slice(0, 2) === 'Re:') {
      document.querySelector('#compose-subject').value = replyInfo.subject;
    } else {
      document.querySelector('#compose-subject').value = `Re: ${replyInfo.subject}`
    }
    document.querySelector('#compose-body').value = `On ${replyInfo.timestamp}, ${replyInfo.from} wrote: ${replyInfo.body}`;
  }


}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
    

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  removeErrorMessage();

  if (mailbox === 'sent') {
    get_sent_emails();
  } else if (mailbox === 'inbox') {
    get_inbox_emails();
    removeSuccessMessage();
  } else if (mailbox === 'archive') {
    get_archive_emails();
    removeSuccessMessage();
  }
}

function removeErrorMessage() {
  let error = document.getElementById('error-message');
  if (error) {
    error.remove();
  } 
}

function removeSuccessMessage() {
  let success = document.getElementById('success-message');
  if (success) {
    success.remove();
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
        span.id = 'success-message';
        document.querySelector('#messages').append(span);
        load_mailbox('sent');
      } else {
        span.innerHTML = result.error;
        span.id = 'error-message';
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

        section.addEventListener('click', () => load_email(email.id, 'sent'))
  
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

        if (email.read) {
          section.className = 'email-display-section read';
        } else {
          section.className = 'email-display-section';
        }
        
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

        section.addEventListener('click', () => load_email(email.id, 'inbox'))
  
        emailDiv.appendChild(section);
      })
    })
}

function get_archive_emails() {
  const emailDiv = document.querySelector('#emails-view');
 
  fetch('/emails/archive')
    .then(response => response.json())
    .then(result => {
      result.forEach(email => {
        const section = document.createElement('section');

        if (email.read) {
          section.className = 'email-display-section read';
        } else {
          section.className = 'email-display-section';
        }
        
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

        section.addEventListener('click', () => load_email(email.id, 'archive'))
  
        emailDiv.appendChild(section);
      })
    })
}

function markAsRead(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function archiveEmail(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  }).then(() => load_mailbox('inbox'))
}

function unarchiveEmail(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  }).then(() => load_mailbox('archive'))
}

function load_email(id, fromMailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'block';
  removeSuccessMessage();

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(result => {

      
      const emailDiv = document.querySelector('#single-email-view');
      emailDiv.replaceChildren();
      const emailInfoDiv = document.createElement('div');
      emailInfoDiv.className = 'single-email-div';

      const fromSection = document.createElement('section');
      fromSection.className = 'single-email-info';

      const from = document.createElement('span');
      from.innerHTML = result.sender;
      const fromLabel = document.createElement('strong');
      fromLabel.innerHTML = 'From: ';

      fromSection.appendChild(fromLabel);
      fromSection.appendChild(from);

      const toSection = document.createElement('section');
      toSection.className = 'single-email-info';

      const to = document.createElement('span');
      to.innerHTML = result.recipients;
      const toLabel = document.createElement('strong');
      toLabel.innerHTML = 'To: ';

      toSection.appendChild(toLabel);
      toSection.appendChild(to);

      const subjectSection = document.createElement('section');
      subjectSection.className = 'single-email-info';

      const subject = document.createElement('span');
      subject.innerHTML = result.subject;
      const subjectLabel = document.createElement('strong');
      subjectLabel.innerHTML = 'Subject: '

      subjectSection.appendChild(subjectLabel);
      subjectSection.appendChild(subject);

      const timestampSection = document.createElement('section');
      timestampSection.className = 'single-email-info';

      const timestamp = document.createElement('span');
      timestamp.innerHTML = result.timestamp;
      const timestampLabel = document.createElement('strong');
      timestampLabel.innerHTML = 'Timestamp: '

      timestampSection.appendChild(timestampLabel);
      timestampSection.appendChild(timestamp);

      emailInfoDiv.appendChild(fromSection);
      emailInfoDiv.appendChild(toSection);
      emailInfoDiv.appendChild(subjectSection);
      emailInfoDiv.appendChild(timestampSection);

      emailDiv.appendChild(emailInfoDiv);

      const replyInfo = {
        from: result.sender,
        to: result.recipients,
        subject: result.subject,
        body: result.body,
        timestamp: result.timestamp
      }

      const replyButton = document.createElement('button');
      replyButton.innerHTML = 'Reply';
      replyButton.className = 'btn btn-sm btn-outline-primary'
      replyButton.addEventListener('click', () => compose_email(replyInfo))
      emailDiv.appendChild(replyButton);

      

      if (fromMailbox === 'inbox' || 'archive') {
      
        const archiveButton = document.createElement('button');

        if (result.archived) {
          archiveButton.innerHTML = 'Unarchive';
          archiveButton.addEventListener('click', () => {
            unarchiveEmail(id);
        });

        } else {
          archiveButton.innerHTML = 'Archive';
          archiveButton.addEventListener('click', () => {
            archiveEmail(id);
          });
        }
        
        archiveButton.className = 'btn btn-sm btn-outline-primary archive';
        emailDiv.appendChild(archiveButton);
      }
     
      const hr = document.createElement('hr');
      emailDiv.appendChild(hr);

      const bodyP = document.createElement('p');
      bodyP.innerHTML = result.body;

      emailDiv.appendChild(bodyP);

    })
    markAsRead(id);
}