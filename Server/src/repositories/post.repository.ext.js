const PostRepository = require('../repositories/post.repository');

class PostRepositoryExtended extends PostRepository.constructor {
  constructor() {
    super(); // Inherit basic methods
  }
  
  // Method decreaseLikeCount was missing in base repo, adding checking or assuming update
  async decreaseLikeCount(id) {
     const Post = require('../models/post.model'); // Lazy load avoid circular dep if any
     await Post.decrement('like_count', { where: { id } });
  }
}

// Export singleton extension or modify original file. 
// For simplicity and cleaner structure, I will append methods to original repository instance via JS dynamic nature 
// OR modify original file via tool. 
// Here I assume original PostRepository is extensible. To follow "Repository only manipulates DB", 
// decrementation is needed.
// I will UPDATE logic in `post.repository.js` separately using another tool call to keep this clean.
// But for UseCase logic, I need to assume it exists. 

module.exports = require('../repositories/post.repository'); // Return the instance
