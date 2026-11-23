# Workout-Tracker-Web-Application-to-track-workout
Gym Workout Planner &amp; Tracker Web Application. An application where users can track gym exercises, Track weights,track daily gym sessions,


Steps to run the project and run the harness 

Step 1: cd to the project directory containing Part-1A

Step 2: Open a new terminal 

Step 3: cd to the backend
cd backend 

Step 4: Start the backend server
npm run dev  

Step 5: In the new terminal, cd to the frontend 
cd frontend 

Step 6: Start the frontend server 
npm run dev 

Check workout creation 
Add, edit, delete operations 
Fetch past workout sessions from the database.
Edit past workout sessions 

open http://127.0.0.1:5173/ in chrome to open the project

Run the harness 

*Have included 3 run scripts in a single run-harness.sh file. 

which includes 
1. RUNNING LINT GUARD -> npx eslint src/backend/src/
2. RUNNING SECURITY/SAST GUARD -> security-check.sh
3. RUNNING exercise UNIT & CONTRACT TESTS -> exercises.test.js
4. RUNNING session UNIT & CONTRACT TESTS -> sessions.test.js


cd to the directory where eslint.config.js
npm install -D eslint @eslint/js globals

Command to run the harness
bash ./run-harness.sh




