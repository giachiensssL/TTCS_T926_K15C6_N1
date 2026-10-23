package com.ttcs.ttcsbackend.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "account_status_changes")
public class AccountStatusChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long accountId;
    private Long actorAccountId;
    private String action;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false)
    private Instant changedAt;

    protected AccountStatusChange() {
    }

    public AccountStatusChange(
            Long accountId,
            Long actorAccountId,
            String action,
            String reason,
            Instant changedAt) {
        this.accountId = accountId;
        this.actorAccountId = actorAccountId;
        this.action = action;
        this.reason = reason;
        this.changedAt = changedAt;
    }

    public Long getId() { return id; }
    public Long getAccountId() { return accountId; }
    public Long getActorAccountId() { return actorAccountId; }
    public String getAction() { return action; }
    public String getReason() { return reason; }
    public Instant getChangedAt() { return changedAt; }
}
