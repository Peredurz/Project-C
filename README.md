# Project-C
This is my public repository for Project C where we made a Planner App for Cavero.

## How to setup the project
### Prerequisites
- Have Dotnet version 7.* installed with the asp.net core sdk.
- Have NodeJs installed on your pc with react.
- Have a PostgreSQL database where you can store all the different things.
### Step 1
Clone the github repository so that you have it on your local machine.
### Step 2
In the directory where the Program.cs file is located you need to run the command ```dotnet restore``` in the terminal.
### Step 3
Go to the ClientApp directory and use the command ```npm i``` in the terminal.
### Step 4
Go to the ```appsettings.json``` and the ```appsettings.development.json``` files and fill in the blanks for your email client and your connectionstring to the database.
### Step 5
Go to the terminal in the directory where the Program.cs file is located and run the command ```dotnet run```. 
If everything is setup correctly the app will proceed to start and run, and a new database with your chosen database name will be created.
### Step 6(Optional)
If you'd like to have an admin account with the account that you have made. Then you'll need to go to the prefered database manager and set the ```IsAdmin``` boolean value to ```True```.
