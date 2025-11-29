package com.example.demo.controller;

import com.example.demo.model.Student;
import com.example.demo.model.Domain;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.DomainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.math.BigDecimal;

/**
 * StudentController that matches the Student entity you provided
 * (photographPath, BigDecimal cgpa).
 */
@RestController
@RequestMapping("/api")

public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private DomainRepository domainRepository;

    /**
     * GET /api/getstudentdetails
     */
    @GetMapping("/getstudentdetails")
    public ResponseEntity<?> getAllStudents() {
        try {
            List<Student> students = studentRepository.findAll();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            System.err.println("Error fetching students: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/domains
     */
    @GetMapping("/domains")
    public ResponseEntity<List<Domain>> getAllDomains() {
        List<Domain> domains = domainRepository.findAll();
        return ResponseEntity.ok(domains);
    }

    /**
     * PUT /api/editstudent
     * Accepts a flexible JSON body. Uses Student setters that exist on your model:
     * - setPhotographPath(...) (not setPhotograph_path)
     * - setCgpa(BigDecimal)
     */
    @PutMapping("/editstudent")
    public ResponseEntity<?> editStudent(@RequestBody Map<String, Object> payload) {
        try {
            // studentId is required
            Object sidObj = payload.get("studentId");
            if (sidObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "studentId missing"));
            }

            Long studentId;
            if (sidObj instanceof Number)
                studentId = ((Number) sidObj).longValue();
            else
                studentId = Long.parseLong(sidObj.toString());

            Optional<Student> optional = studentRepository.findById(studentId);
            if (optional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Student not found"));
            }

            Student student = optional.get();

            // Update simple string fields
            if (payload.containsKey("rollNo"))
                student.setRollNo(asString(payload.get("rollNo")));
            if (payload.containsKey("firstName"))
                student.setFirstName(asString(payload.get("firstName")));
            if (payload.containsKey("lastName"))
                student.setLastName(asString(payload.get("lastName")));
            if (payload.containsKey("email"))
                student.setEmail(asString(payload.get("email")));

            // photograph_path (or photographPath) support -> use setPhotographPath(...) on
            // Student
            if (payload.containsKey("photograph_path")) {
                student.setPhotographPath(asString(payload.get("photograph_path")));
            } else if (payload.containsKey("photographPath")) {
                student.setPhotographPath(asString(payload.get("photographPath")));
            }

            // cgpa -> Student.setCgpa(BigDecimal)
            if (payload.containsKey("cgpa")) {
                BigDecimal cgpa = asBigDecimalOrNull(payload.get("cgpa"));
                student.setCgpa(cgpa);
            }

            // totalCredits -> Integer
            if (payload.containsKey("totalCredits")) {
                Integer credits = asIntegerOrNull(payload.get("totalCredits"));
                student.setTotalCredits(credits);
            }

            // graduationYear -> Integer
            if (payload.containsKey("graduationYear")) {
                Integer gy = asIntegerOrNull(payload.get("graduationYear"));
                student.setGraduationYear(gy);
            }

            // Domain mapping: accept domain as id (number/string) OR object with domainId
            // property OR null
            if (payload.containsKey("domain")) {
                Object domainObj = payload.get("domain");
                if (domainObj == null) {
                    student.setDomain(null);
                } else if (domainObj instanceof Map) {
                    Map<?, ?> dm = (Map<?, ?>) domainObj;
                    Object did = dm.get("domainId");
                    if (did != null) {
                        Long domainId = (did instanceof Number) ? ((Number) did).longValue()
                                : Long.parseLong(did.toString());
                        domainRepository.findById(domainId).ifPresent(student::setDomain);
                    } else {
                        // No domainId inside object -> try to resolve by program or set null
                        String program = ((Map<String, Object>) dm).getOrDefault("program", "").toString();
                        if (!program.isBlank()) {
                            Optional<Domain> found = domainRepository.findAll().stream()
                                    .filter(d -> program.equalsIgnoreCase(d.getProgram()))
                                    .findFirst();
                            found.ifPresent(student::setDomain);
                        } else {
                            student.setDomain(null);
                        }
                    }
                } else {
                    // domain might be a numeric id or program string
                    try {
                        Long domainId = Long.parseLong(domainObj.toString());
                        domainRepository.findById(domainId).ifPresent(student::setDomain);
                    } catch (Exception e) {
                        String ds = domainObj.toString();
                        Optional<Domain> found = domainRepository.findAll().stream()
                                .filter(d -> ds.equalsIgnoreCase(d.getProgram())
                                        || ds.equals(String.valueOf(d.getDomainId())))
                                .findFirst();
                        if (found.isPresent())
                            student.setDomain(found.get());
                        else
                            student.setDomain(null);
                    }
                }
            }

            Student saved = studentRepository.save(student);
            return ResponseEntity.ok(saved);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", ex.getMessage()));
        }
    }

    // --- helper conversions ---
    private static String asString(Object o) {
        return o == null ? null : o.toString();
    }

    private static Integer asIntegerOrNull(Object o) {
        if (o == null)
            return null;
        if (o instanceof Number)
            return ((Number) o).intValue();
        try {
            String s = o.toString().trim();
            if (s.isEmpty())
                return null;
            return Integer.parseInt(s);
        } catch (Exception e) {
            return null;
        }
    }

    private static BigDecimal asBigDecimalOrNull(Object o) {
        if (o == null)
            return null;
        if (o instanceof BigDecimal)
            return (BigDecimal) o;
        if (o instanceof Number)
            return BigDecimal.valueOf(((Number) o).doubleValue());
        try {
            String s = o.toString().trim();
            if (s.isEmpty())
                return null;
            return new BigDecimal(s);
        } catch (Exception e) {
            return null;
        }
    }
}
