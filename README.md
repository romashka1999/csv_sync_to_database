
Story
 
We have a system where client stores list of their employees.
 
Employees are uniquely identified by employeeNo field.
 
Every day client posts csv file with updated list of employees which we need to synchronize with database: insert new users, update existing ones (by employee no), delete missing ones (set isDeleted flag to true) and restore previously deleted ones (reset isDeleted flag).
 
Synchronization procedure have to generate change report which should reflect all users with appropriate statuses (created, updated, deleted, restored) dumped to excel file.
 
Setup
 
User record structure:
 
employeeNo
firstName
lastName
email
phone
position
hireDate
createDate
updateDate
isDeleted
 
Add indexes to database tables as needed.
 
Use Faker library to create dummy users.
 
    • Generate up to 1000 dummy user records and save to database
    • Alter same list, keep majority records intact but add/change/remove small fraction of records and dump data to csv file
 
Goal
 
Create a procedure which will synchronize csv file with database and generate change report
 
Minimize workload imposed on database, so majority of operations preferably to be done in-memory or using database bulk operations.
 
Requirements

Database: MySQL
Platform: NodeJS# csv_sync_to_database
