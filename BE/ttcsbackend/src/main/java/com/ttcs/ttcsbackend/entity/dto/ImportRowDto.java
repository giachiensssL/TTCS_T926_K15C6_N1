package com.ttcs.ttcsbackend.dto;

import java.util.ArrayList;
import java.util.List;

public class ImportRowDto {
    private int rowNumber;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String status;
    private boolean valid;
    private List<String> errors = new ArrayList<>();

    public ImportRowDto() {
    }

    public ImportRowDto(int rowNumber, String username, String email, String fullName, String role, String status, boolean valid, List<String> errors) {
        this.rowNumber = rowNumber;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.status = status;
        this.valid = valid;
        this.errors = errors != null ? errors : new ArrayList<>();
    }

    public int getRowNumber() {
        return rowNumber;
    }

    public void setRowNumber(int rowNumber) {
        this.rowNumber = rowNumber;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
}

