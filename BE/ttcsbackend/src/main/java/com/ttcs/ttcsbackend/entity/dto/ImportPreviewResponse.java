package com.ttcs.ttcsbackend.dto;

import java.util.ArrayList;
import java.util.List;

public class ImportPreviewResponse {
    private int totalRows;
    private int validCount;
    private int errorCount;
    private List<ImportRowDto> rows = new ArrayList<>();

    public ImportPreviewResponse() {
    }

    public ImportPreviewResponse(int totalRows, int validCount, int errorCount, List<ImportRowDto> rows) {
        this.totalRows = totalRows;
        this.validCount = validCount;
        this.errorCount = errorCount;
        this.rows = rows != null ? rows : new ArrayList<>();
    }

    public int getTotalRows() {
        return totalRows;
    }

    public void setTotalRows(int totalRows) {
        this.totalRows = totalRows;
    }

    public int getValidCount() {
        return validCount;
    }

    public void setValidCount(int validCount) {
        this.validCount = validCount;
    }

    public int getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(int errorCount) {
        this.errorCount = errorCount;
    }

    public List<ImportRowDto> getRows() {
        return rows;
    }

    public void setRows(List<ImportRowDto> rows) {
        this.rows = rows;
    }
}

