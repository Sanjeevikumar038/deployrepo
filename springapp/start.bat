@echo off
echo Starting Spring Boot Application...
java -jar target/classes -Dspring.profiles.active=default -cp "target/classes;target/dependency/*" com.examly.springapp.QuizManagementSystemApplication
pause