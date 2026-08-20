package com.ai.Resume.analyser.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "previous_table")
public class AnalysisReport {

    @Id
    private String email;

    private int score;

    private int atsoptimizationscore;

    private String roles;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "analysis_report_pros", joinColumns = @JoinColumn(name = "analysis_report_email"))
    @OrderColumn(name = "pros_order")
    @Column(length = 450)
    private List<String> pros;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "analysis_report_cons", joinColumns = @JoinColumn(name = "analysis_report_email"))
    @OrderColumn(name = "cons_order")
    @Column(length = 450)
    private List<String> cons;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "analysis_report_suggestions", joinColumns = @JoinColumn(name = "analysis_report_email"))
    @OrderColumn(name = "suggestions_order")
    @Column(length = 450)
    private List<String> suggestions;
}



