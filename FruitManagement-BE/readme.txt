How to run backend source code in local 

1/ Docker: 
- Gõ dòng sau vào terminal sau khi đã cài Docker:
docker pull mysql
docker run --name manach -e MYSQL_ROOT_PASSWORD=1234 -d -p 3307:3306 mysql

2/ Cài TablePlus, tạo ra connection mới: 
{
  name: db_manach
  Host: localhost
  Port: 3307
  user: root
  password: 1234
}
-> Connect

3/ create new database name: db_manach

4/ import the sql file in discord: db_manach.sql

5/ clone the backend source code:
git clone https://github.com/dbn-minh/FruitManagement-BE.git
cd FruitManagement-BE
git switch master
yarn

6/ Run using: 
yarn start

7/ Download PostMan to test API
-> Text Minh Doan the email to be invited to the collaboration,
 which have all the APIs listed for you to test

8/ Optional environment variables for auth security:
- JWT_SECRET=your_access_secret
- JWT_EXPIRES_IN=15m
- JWT_REFRESH_SECRET=your_refresh_secret
- JWT_REFRESH_EXPIRES_IN=7d
- SIGNUP_RATE_LIMIT_WINDOW_MS=900000
- SIGNUP_RATE_LIMIT_MAX=5
- PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=15
- EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES=60
- REQUIRE_EMAIL_VERIFIED=false
- EXPOSE_EMAIL_VERIFICATION_TOKEN=true
- LOGIN_ATTEMPT_WINDOW_MS=900000
- LOGIN_LOCK_DURATION_MS=900000
- LOGIN_MAX_ATTEMPTS=5

9/ Signup rollout guide:
- docs/deployment/signup_rollout.md

10/ Copy environment template before running:
- cp .env.example .env

11/ Auth smoke test script:
- BASE_URL=http://localhost:8080 ./scripts/auth_smoke.sh
