const { buildSchema } = require('graphql');

module.exports = buildSchema (`

    input inputData{
        email: String!
        password: String!
        fname: String!
        lname: String!
        permissionLevel: String!
    }

    input updateData{
        _id: ID!
        email: String
        password: String
        fname: String
        lname: String
        permissionLevel: String
    }

    type User {
        message: String
        _id: ID!
        email: String!
        password: String!
        fname: String!
        lname: String!
        permissionLevel: String!
    }

    type Users {
        message: String
        users: [User!]!
    }

    type Tokens {
        message: String
        _id: ID!
        accessToken: String!
        refreshToken: String!
    }

    type RootQuery {
        login(email: String!, password: String!) : Tokens!
        getUsers : Users!
        getUser(userId: ID!): User!
    }

    type RootMutation{
        createUser(inputData: inputData!): User!
        updateUser(updateData: updateData): User!
        deleteUser(userId: String!): User!
        refreshToken(refreshToken: String!): Tokens!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);