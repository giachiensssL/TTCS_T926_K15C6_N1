package com.ttcs.ttcsbackend.dto;

import java.util.ArrayList;
import java.util.List;

public class ImportSummaryResponse {
    private int totalRead;
    private int successCount;
    private int skippedCount;
    private String message;
    private List<AccountResponse> successAccounts = new ArrayList<>();
    private List<ImportRowDto> failedRows = new ArrayList<>();

    public ImportSummaryResponse() {
    }

    public ImportSummaryResponse(int totalRead, int successCount, int skippedCount, String message, List<AccountResponse> successAccounts, List<ImportRowDto> failedRows) {
        this.totalRead = totalRead;
        this.successCount = successCount;
        this.skippedCount = skippedCount;
        this.message = message;
        this.successAccounts = successAccounts != null ? successAccounts : new ArrayList<>();
        this.failedRows = failedRows != null ? failedRows : new ArrayList<>();
    }

    public int getTotalRead() {
        return totalRead;
    }

    public void setTotalRead(int totalRead) {
        this.totalRead = totalRead;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getSkippedCount() {
        return skippedCount;
    }

    public void setSkippedCount(int skippedCount) {
        this.skippedCount = skippedCount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<AccountResponse> getSuccessAccounts() {
        return successAccounts;
    }

    public void setSuccessAccounts(List<AccountResponse> successAccounts) {
        this.successAccounts = successAccounts;
    }

    public List<ImportRowDto> getFailedRows() {
        return failedRows;
    }

    public void setFailedRows(List<ImportRowDto> failedRows) {
        this.failedRows = failedRows;
    }
}

