import { Component, OnInit } from '@angular/core';
import { EmailService } from '../shared/email.service';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {
  // subject: string;
  // content: string;

  constructor(private emailService: EmailService) { }

  ngOnInit() {
    // Set the email subject and content based on your requirements
    // this.subject = 'Payment Confirmation';
    // this.content = 'Your payment was successful. Thank you!';

    // Call the email service to send the email
    this.sendEmail();
  }

  sendEmail() {
    const emailTemplate = `
      <html>
      <head>
          <!-- Include any necessary styles or scripts -->
      </head>
      <body>
          <div class="container">
             <h1></h1>
              <p></p>
          </div>
      </body>
      </html>
    `;

    // // Call your email service to send the email
    // this.emailService.sendEmail(emailTemplate)
    //   .subscribe(
    //     () => {
    //       console.log('Email sent successfully');
    //     },
    //     error => {
    //       console.log('Failed to send email:', error);
    //     }
    //   );
  }
}
