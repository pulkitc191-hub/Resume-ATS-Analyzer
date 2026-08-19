package com.ai.Resume.analyser.repository;

import com.ai.Resume.analyser.model.AnalysisReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, String> {
}
