
# Final Project | IT-2308 | Alisher Berik

## Description

The Final Project of Advanced Databases (NoSQL).

Project presentation: [Link](https://www.canva.com/design/DAGaaIXPnLc/tB2iQ9L4YuvMBGXciCFusQ/edit?utm_content=DAGaaIXPnLc&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

## Technical Description

The project database consists of 5 collections:

1) Users
2) Categories
3) Brands
4) Products (Consist relationships with Category and Brand)

There you can search TV products, find TV by specific brands, or perform administrative actions (CRUD operations) (Users authentification)

To get admin privilege, create new account and choose role 'Admin', then below appears input for secret code.

#### Secret code: admin1243

## Installation
Before testing project, write next command in IDE terminal
```
npm i express ejs express-validator express-session body-parser nodemon bcryptjs mongoose passport passport-local mongodb dotenv
```

Then, open project folder and write next command in terminal:
```
nodemon index
```



