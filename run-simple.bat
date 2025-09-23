@echo off
echo Compiling and running Spring Boot application...
cd /d "%~dp0"
javac -cp "target/classes;lib/*" -d target/classes src/main/java/com/examly/springapp/*.java src/main/java/com/examly/springapp/*/*.java
java -cp "target/classes;lib/*" com.examly.springapp.QuizManagementSystemApplication
pause