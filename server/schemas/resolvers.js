const { User, Book } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
// Define GraphQL resolvers
const resolvers = {
  Query: {
    // Resolver for the 'me' query
    me: async (parent, args, context) => {
      if (context.user) {
        // If user is authenticated, retrieve and return user data
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        return userData;
      }
      // If user is not authenticated, throw an authentication error
      throw new AuthenticationError("Not logged in bucko!");
    },
  },

  Mutation: {
    // Resolver for the 'addUser' mutation
    addUser: async (parent, args) => {
      // Create a new user and generate a token
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    // Resolver for the 'login' mutation
    login: async (parent, { email, password }) => {
      // Find a user by email
      const user = await User.findOne({ email });

      // If user doesn't exist, throw an authentication error
      if (!user) {
        throw new AuthenticationError("Incorrect Username!");
      }

      // Check if the provided password is correct
      const correctPw = await user.isCorrectPassword(password);

      // If the password is incorrect, throw an authentication error
      if (!correctPw) {
        throw new AuthenticationError("Incorrect Password!");
      }

      // If authentication is successful, generate a token and return it along with the user data
      const token = signToken(user);
      return { token, user };
    },

    // Resolver for the 'saveBook' mutation
    saveBook: async (parent, { book }, context) => {
      if (context.user) {
        // If user is authenticated, add the book to the user's savedBooks array
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book } },
          { new: true }
        );
        return updatedUser;
      }
      // If user is not authenticated, throw an authentication error
      throw new AuthenticationError("You need to be logged in todo that friend!");
    },

    // Resolver for the 'removeBook' mutation
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        // If user is authenticated, remove the specified book from the user's savedBooks array
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      // If user is not authenticated, throw an authentication error
      throw new AuthenticationError("You need to be logged in todo that friend!");
    },
  },
};

// Export the resolver object
module.exports = resolvers;
