# devTinder for API list


## AuthRouter
- POST /signup
- POST /login
- POST /logout


## Profile Router
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password


## RequestRouter
- POST /request/send/:intrested/:userId
- POST /request/send/:ignored/:userId
- POST /request/review/:accepted/:requestId
- POST /request/review/:rejected/:requestId


## ConnectionRouter
- GET /user/connections 
- GET /user/requests/received
- GET /user/feed


# check local env variable and .env.production 
