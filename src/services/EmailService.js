const nodemailer = require('nodemailer')
const dotenv = require('dotenv');
dotenv.config()
var inlineBase64 = require('nodemailer-plugin-inline-base64');

const sendEmailCreateOrder = async (email,orderItems) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_ACCOUNT, // generated ethereal user
      pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
  });
  transporter.use('compile', inlineBase64({cidPrefix: 'somePrefix_'}));

  let listItem = '';
  const attachImage = []
  orderItems.forEach((order) => {
    listItem += `<div>
    
    <div>
      Bạn đã đặt sản phẩm <b>${order.name}</b> với số lượng: <b>${order.amount}</b> và giá là: <b>${order.price} VND</b></div>
      <div>Cảm ơn bạn đã tin tưởng lựa chọn của hàng chúng tôi để mua sắm !</div>
      <div>Xin chân thành cảm ơn.</div>
      <div>Bên dưới là hình ảnh của sản phẩm:</div>
    </div>`
    attachImage.push({path: order.image})
  })

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT, // sender address
    to: email, // list of receivers
    subject: "Bạn đã đặt hàng tại shop DH PhoneStore", // Subject line
    text: "Hello world?", // plain text body
    html: `<div><b>Bạn đã đặt hàng thành công tại shop DH PhoneStore</b></div> ${listItem}`,
    attachments: attachImage,
  });
}

const sendResetPasswordEmail = async (email, token) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_ACCOUNT,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  let resetLink = `https://tlcn-frontend-six.vercel.app/reset-password/${token}`;

  let info = await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "Password Reset Request",
    text: "You requested a password reset",
    html: `<div>
             <p>You requested a password reset</p>
             <p>Click this <a href="${resetLink}">link</a> to reset your password</p>
           </div>`,
  });
};

module.exports = {
  sendEmailCreateOrder,
  sendResetPasswordEmail
}