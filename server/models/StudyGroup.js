 const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxMembers: { type: Number, default: 10 },
    meetingSchedule: { type: String, default: '' },
    meetingMode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyGroup', studyGroupSchema);
