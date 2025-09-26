package com.examly.springapp.service;

import com.examly.springapp.model.Student;
import com.examly.springapp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Student registerStudent(Student student) {
        if (studentRepository.existsByUsername(student.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (student.getEmail() != null && studentRepository.existsByEmail(student.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        return studentRepository.save(student);
    }

    public Student loginStudent(String username, String password) {
        Student student = studentRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(password, student.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        return student;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> migrateStudents(List<Student> students) {
        List<Student> savedStudents = new ArrayList<>();
        
        if (students == null || students.isEmpty()) {
            return savedStudents;
        }
        
        for (Student student : students) {
            if (student != null && student.getUsername() != null && !student.getUsername().trim().isEmpty()) {
                if (!studentRepository.existsByUsername(student.getUsername())) {
                    savedStudents.add(studentRepository.save(student));
                }
            }
        }
        
        return savedStudents;
    }
}