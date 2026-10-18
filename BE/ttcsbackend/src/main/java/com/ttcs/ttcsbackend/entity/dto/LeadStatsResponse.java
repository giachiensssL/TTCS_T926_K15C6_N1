package com.ttcs.ttcsbackend.dto;

public class LeadStatsResponse {

    private long totalLeads;
    private long overdueCount;
    private long todayCount;
    private long upcomingCount;
    private long totalInteractions;

    public LeadStatsResponse() {
    }

    public LeadStatsResponse(long totalLeads, long overdueCount, long todayCount, long upcomingCount, long totalInteractions) {
        this.totalLeads = totalLeads;
        this.overdueCount = overdueCount;
        this.todayCount = todayCount;
        this.upcomingCount = upcomingCount;
        this.totalInteractions = totalInteractions;
    }

    public long getTotalLeads() {
        return totalLeads;
    }

    public void setTotalLeads(long totalLeads) {
        this.totalLeads = totalLeads;
    }

    public long getOverdueCount() {
        return overdueCount;
    }

    public void setOverdueCount(long overdueCount) {
        this.overdueCount = overdueCount;
    }

    public long getTodayCount() {
        return todayCount;
    }

    public void setTodayCount(long todayCount) {
        this.todayCount = todayCount;
    }

    public long getUpcomingCount() {
        return upcomingCount;
    }

    public void setUpcomingCount(long upcomingCount) {
        this.upcomingCount = upcomingCount;
    }

    public long getTotalInteractions() {
        return totalInteractions;
    }

    public void setTotalInteractions(long totalInteractions) {
        this.totalInteractions = totalInteractions;
    }
}
