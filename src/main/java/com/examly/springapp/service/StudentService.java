package com.examly.springapp.service;

import com.examly.springapp.model.Student;
import com.examly.springapp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public Student registerStudent(Student student) {
        if (studentRepository.existsByUsername(student.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (student.getEmail() != null && studentRepository.existsByEmail(student.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        return studentRepository.save(student);
    }

    public Student loginStudent(String username, String password) {
        Student student = studentRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!student.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }
        
        return student;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> migrateStudents(List<Student> students) {
        List<Student> savedStudents = new ArrayList<>();
        
        for (Student student : students) {
            if (!studentRepository.existsByUsername(student.getUsername())) {
                savedStudents.add(studentRepository.save(student));
            }
        }
        
        return savedStudents;
    }
}