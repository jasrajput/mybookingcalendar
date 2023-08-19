import nodemailer from 'nodemailer'

const sendEmail = async (options) => {
    // create reusable transporter object using the gmail SMTP transport
    // let transporter = nodemailer.createTransport({
    //     host: "smtp.titan.email",
    //     port: 465,
    //     secure: true, // true for 465, false for other ports
    //     auth: {
    //         user: 'support@mybookingcalendar.co', 
    //         pass: '*******',
    //     },
    // });
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL, 
            pass: process.env.SMTP_PASSWORD,
        },
    });

    if (options.contactForm) {
        // send contact form details to myself
        let info = await transporter.sendMail({
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // sender address
            to: options.email, // list of receivers
            subject: options.subject, // Subject line
            text: "Hi", // plain text body
            html: options.message, // html body
            });

        // send mail to client as acknowlodgement
        let send_client = await transporter.sendMail({
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // sender address
            to: options.clientEmail, // list of receivers
            subject: "Divineml received your contact request", // Subject line
            text: "Hi", // plain text body
            html: `<small>This is a system generated mail. Please do not reply to it.</small><br>
                Thank you for contacting us. We will get back to you shortly.`, // html body
        });
    } else {
        // for sending the event booking details
        // let send_client = await transporter.sendMail({
        //     from: `mybookingcalendar <support@mybookingcalendar.co>`, // sender address
        //     to: options.email, // list of receivers
        //     subject: options.subject, // Subject line
        //     html: options.message, // plain text body
        // });
        let send_client = await transporter.sendMail({
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // sender address
            to: options.email, // list of receivers
            subject: options.subject, // Subject line
            html: options.message, // plain text body
        });
    }

}

export default sendEmail