package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "domains")
public class Domain {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "domain_id")
    private Long domainId;
    
    @Column(name = "program", nullable = false)
    private String program;
    
    @Column(name = "batch", nullable = false)
    private String batch;
    
    @Column(name = "capacity", nullable = false)
    private Integer capacity;
    
    @Column(name = "qualification", nullable = false)
    private String qualification;
    
    // Getters and Setters
    public Long getDomainId() {
        return domainId;
    }

    public void setDomainId(Long domainId) {
        this.domainId = domainId;
    }

    public String getProgram() {
        return program;
    }

/* <<<<<<<<<<<<<<  ✨ Windsurf Command ⭐ >>>>>>>>>>>>>>>> */
    /**
     * Set the program of the domain.
     * @param program the program of the domain
     */
/* <<<<<<<<<<  151acd92-7dac-4da4-bad1-2618fa906ff8  >>>>>>>>>>> */
    public void setProgram(String program) {
        this.program = program;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }
}
