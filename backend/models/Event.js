const mongoose = require("mongoose");
const EventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    price: { type: Number, default: 0 },
    category: { type: String, default: "General" },
    agenda: { type: String },
    tags: [{ type: String }],
    image: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      trim: true,
    },
    pendingUpdates: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true },
);

EventSchema.index({ name: "text", description: "text", location: "text" });
EventSchema.index({ status: 1, date: 1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ date: 1 });

module.exports = mongoose.models.Event || mongoose.model("Event", EventSchema);
