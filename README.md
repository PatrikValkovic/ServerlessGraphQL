# Serverless GraphQL subscriptions

This project was created as demonstration for [Qeetup](https://qeetup.qest.cz/).  
You can find the presentation at [slides.com](https://slides.com/patrikvalkovic/deck-9eb3a9).  
Presentation recording at [youtube.com](https://youtu.be/R5-15ueGTnk).

If you are interested in similar topics, see our [web](https://qeetup.qest.cz/).

## Up and running

The whole project is written using Cloud Development Kit (CDK). To start the application, use following commands.
- `pnpm install` to install dependencies. If you don't have pnpm, run `npm install -g pnpm`.
- `cdk bootstrap` to create the initial CDK stack in AWS. This must be done only once before the deployment.
- `npm run cdk:backend:up` to deploy the backend.
- Copy `.env.example` into `.env` and setup env variables. You gen the API Gateway IDs from the backend stack.
- `npm run build:frontend` to build the frontend.
- `npm run cdk:frontend:up` to deploy the frontend.

## Technologies

From AWS side, I used following technologies:
- Simple Queue Service
- AWS Lambda
- API Gateway
- DynamoDB

The backend is using:
- Nexus for generating GraphQL.
- Graphql-shield library.

Frontend is using:
- React
- React router
- Apollo client
- Styled components

The monorepository is managed by NX.

------

Patrik Valkovič, 2023
