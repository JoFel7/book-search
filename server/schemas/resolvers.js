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
    createMatchup: async (parent, args) => {
      const matchup = await Matchup.create(args);
      return matchup;
    },
    createVote: async (parent, { _id, techNum }) => {
      const vote = await Matchup.findOneAndUpdate(
        { _id },
        { $inc: { [`tech${techNum}_votes`]: 1 } },
        { new: true }
      );
      return vote;
    },
  },
};

// Export the resolver object
module.exports = resolvers;
