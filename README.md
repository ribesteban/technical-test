# Technical test

## Introduction

Fabien just came back from a meeting with an incubator and told them we have a platform “up and running” to monitor people's activities and control the budget for their startups !

All others developers are busy and we need you to deliver the app for tomorrow.
Some bugs are left and we need you to fix those. Don't spend to much time on it.

We need you to follow these steps to understand the app and to fix the bug :

- Sign up to the app
- Create at least 2 others users on people page ( not with signup )
- Edit these profiles and add aditional information
- Create a project
- Input some information about the project
- Input some activities to track your work in the good project

Then, see what happens in the app and fix the bug you found doing that.

## Then

Time to be creative, and efficient. Do what you think would be the best for your product under a short period.

### The goal is to fix at least 3 bugs and implement 1 quick win feature than could help us sell the platform

## Setup api

- cd api
- Run `npm i`
- Run `npm run dev`

## Setup app

- cd app
- Run `npm i`
- Run `npm run dev`

## Finally

Send us the project and answer to those simple questions :

- What bugs did you find ? How did you solve these and why ?
  `I change the find by findOne on the function get project because we want only one project, not array of projects.`
  `When we created a new user, we had a problem with the registration of the username because we used the value name`
  `I also changed the type of the input password and use Formik on this form`
  `On the comment textarea of ​​an activity the name of the project in the placeholder was undefined because the variable was not good`
  `When updating a project, nothing happened when you click on Update, the method was using onChange instead of onClick`
- Which feature did you develop and why ?
  `I added a feature that allows you to create tickets on projects. We can now add and delete tasks and update their status directly through the project page`
- Do you have any feedback about the code / architecture of the project and what was the difficulty you encountered while doing it ?
