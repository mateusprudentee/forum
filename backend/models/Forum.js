import mongoose from 'mongoose';

const forumCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  threads: {
    type: Number,
    default: 0
  },
  posts: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    enum: ['main', 'team'],
    default: 'main'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  replies: {
    type: Number,
    default: 0
  },
  pinned: {
    type: Boolean,
    default: false
  },
  locked: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  lastReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const replySchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const forumStatsSchema = new mongoose.Schema({
  posts: {
    type: Number,
    default: 0
  },
  members: {
    type: Number,
    default: 0
  },
  guests: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar contagens
topicSchema.pre('save', async function(next) {
  if (this.isNew) {
    await mongoose.model('ForumCategory').updateOne(
      { name: this.category },
      { $inc: { threads: 1 } }
    );
  }
  next();
});

replySchema.pre('save', async function(next) {
  await mongoose.model('Topic').updateOne(
    { _id: this.topic },
    { $inc: { replies: 1 }, lastReply: this._id }
  );
  
  await mongoose.model('ForumCategory').updateOne(
    { name: this.topic.category },
    { $inc: { posts: 1 } }
  );
  
  next();
});

export const ForumCategory = mongoose.model('ForumCategory', forumCategorySchema);
export const Topic = mongoose.model('Topic', topicSchema);
export const Reply = mongoose.model('Reply', replySchema);
export const ForumStats = mongoose.model('ForumStats', forumStatsSchema);