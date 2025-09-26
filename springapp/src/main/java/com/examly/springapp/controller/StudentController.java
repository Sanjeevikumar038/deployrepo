package com.examly.springapp.controller;

import com.examly.springapp.model.Student;
import com.examly.springapp.dto.LoginResponse;
import com.examly.springapp.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.web.bind.annotation.RequestMethod;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody Student student) {
        try {
            Student savedStudent = studentService.registerStudent(student);
            LoginResponse response = new LoginResponse(
                savedStudent.getId(),
                savedStudent.getUsername(),
                savedStudent.getEmail(),
                "Registration successful"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginStudent(@RequestBody Student loginRequest) {
        try {
            Student student = studentService.loginStudent(loginRequest.getUsername(), loginRequest.getPassword());
            LoginResponse response = new LoginResponse(
                student.getId(),
                student.getUsername(),
                student.getEmail(),
                "Login successful"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @PostMapping("/migrate")
    public ResponseEntity<?> migrateFromLocalStorage(@RequestBody List<Student> students) {
        try {
            List<Student> savedStudents = studentService.migrateStudents(students);
            return ResponseEntity.ok(savedStudents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @RequestMapping(value = "/migrate", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }
}