const nodemailer = require('nodemailer')
const dotenv = require('dotenv');
dotenv.config()
var inlineBase64 = require('nodemailer-plugin-inline-base64');

const sendEmailCreateOrder = async (email, order) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice, isPaid, rewardPointsEarned, rewardPointsUsed, createdAt } = order;

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
  
  transporter.use('compile', inlineBase64({cidPrefix: 'somePrefix_'}));

  let listItem = '';
  const attachImage = [];

  orderItems.forEach((orderItem) => {
    listItem += `
      <div style="border-bottom: 1px solid #ddd; margin-bottom: 10px; padding-bottom: 10px;">
        <img src="${orderItem.image}" alt="${orderItem.name}" style="width: 100px; height: 100px; object-fit: cover;" />
        <p><strong>Sản phẩm:</strong> ${orderItem.name}</p>
        <p><strong>Số lượng:</strong> ${orderItem.amount}</p>
        <p><strong>Giá:</strong> ${orderItem.price.toLocaleString()} VND</p>
        <p><strong>Giảm giá:</strong> ${orderItem.discount ? orderItem.discount + '%' : 'Không có'}</p>
      </div>
    `;
    attachImage.push({ path: orderItem.image });
  });

  const shippingInfo = `
    <div>
      <h3>THÔNG TIN GIAO HÀNG</h3>
      <p><strong>Họ tên:</strong> ${shippingAddress.fullName}</p>
      <p><strong>Địa chỉ:</strong> ${shippingAddress.address}, ${shippingAddress.ward}, ${shippingAddress.district} ${shippingAddress.city}</p>
      <p><strong>Số điện thoại:</strong> ${shippingAddress.phone}</p>
    </div>
  `;

  const orderSummary = `
    <div>
      <h3>TÓM TẮT ĐƠN HÀNG</h3>
      <p><strong>Phương thức thanh toán:</strong> ${paymentMethod === 'later_money' ? 'Thanh toán khi nhận hàng' : 'Đã thanh toán'}</p>
      <p><strong>Phí vận chuyển:</strong> ${shippingPrice.toLocaleString()} VND</p>
      <p><strong>Tổng tiền:</strong> ${totalPrice.toLocaleString()} VND</p>
      <p><strong>Điểm thưởng sử dụng:</strong> ${rewardPointsUsed} điểm</p>
      <p><strong>Ngày đặt hàng:</strong> ${new Date(createdAt).toLocaleDateString()}</p>
    </div>
  `;

  const emailContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Cảm ơn bạn đã đặt hàng tại DH PhoneStore</h2>
      <p>Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý.</p>
      ${shippingInfo}
      ${orderSummary}
      <h3>CHI TIẾT SẢN PHẨM</h3>
      ${listItem}
      <p>Xin chân thành cảm ơn đã lựa chọn cửa hàng của chúng tôi.</p>
    </div>
  `;

  // Send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "Xác nhận đơn hàng từ DH PhoneStore",
    text: "Cảm ơn bạn đã đặt hàng tại DH PhoneStore.",
    html: emailContent,
    attachments: attachImage,
  });
};

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

  let resetLink = `http://localhost:3000/reset-password/${token}`;

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