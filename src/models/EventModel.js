const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  discountType: {
    type: String,
    enum: ['amount', 'percentage'], // Giảm theo số tiền hoặc phần trăm
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  applyType: {
    type: String,
    enum: ['brand', 'inventory', 'all'], // Loại áp dụng
    required: true,
  },
  appliedCriteria: {
    type: String, // Giá trị được chọn cho applyType, ví dụ: tên hãng hoặc danh mục
    required: false,
  },
  appliedProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  status: {
    type: Boolean, // true = active, false = inactive
    default: false,
  },
  countdown: {
    type: String, // Chuỗi thời gian còn lại (dạng `days:hours:minutes:seconds`)
    default: '',
  },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
