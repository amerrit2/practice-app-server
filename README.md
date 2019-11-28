# practice-app-server
Heroku server for kotlin android practice

Got things going. 

Next step: Create Heroku procfile so this baby will run on heroku

# PSQL CLI to Remote DB
> `heroku pg:psql -a practice-app-service`

## Use Local DB
- Need to pull remote db to local version.  Replace DATABASE_URL

# ENV Variables
VERBOSITY = error | warn | info | verbose | debug | silly

DATABASE_URL: The url of the postgresql database
