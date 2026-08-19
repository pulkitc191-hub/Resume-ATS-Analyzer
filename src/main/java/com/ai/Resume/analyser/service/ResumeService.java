package com.ai.Resume.analyser.service;

import com.ai.Resume.analyser.model.*;
import com.ai.Resume.analyser.repository.AnalysisReportRepository;
import com.ai.Resume.analyser.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class ResumeService {

    private static final int MAX_GEMINI_ATTEMPTS = 3;

    @Value("${genKey}")
    private String genKey;

    @Value("${application-id}")
    private String applicationId;

    @Value("${application-api-key}")
    private String applicationApiKey;

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    @Autowired
    private AnalysisReportRepository analysisReportRepository;

    @Autowired
    private UserRepository userRepository;

    public ResponseEntity<?> analyseResume(String roles, MultipartFile file)
            throws TikaException, IOException, InterruptedException {

        if (roles == null || roles.isBlank() || file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("A target role and resume file are required");
        }

        // Extract text from uploaded resume
        Tika tika = new Tika();
        String extractedText;
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(file.getBytes())) {
            extractedText = tika.parseToString(inputStream);
        }

        if (extractedText.trim().isEmpty() || extractedText.length() > 15000) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please upload a valid resume");
        }

        AnalysisResultDto result;
        try {
            String aiResponse = callGeminiWithRetry(roles.trim(), extractedText);
            if (aiResponse.startsWith("```")) {
                int firstBrace = aiResponse.indexOf("{");
                int lastBrace = aiResponse.lastIndexOf("}");
                if (firstBrace != -1 && lastBrace != -1) {
                    aiResponse = aiResponse.substring(firstBrace, lastBrace + 1);
                }
            }
            result = new ObjectMapper().readValue(aiResponse, AnalysisResultDto.class);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Resume analysis was interrupted");
        } catch (Exception e) {
            log.error("Resume analysis failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Resume analysis is temporarily unavailable. Please try again.");
        }

        if (result.getScore() != 0) {
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            AnalysisReport report = new AnalysisReport(
                    userEmail, result.getScore(), result.getAtsoptimizationscore(),
                    roles, result.getPros(), result.getCons(), result.getSuggestions());
            analysisReportRepository.save(report);

            userRepository.findById(userEmail).ifPresent(user -> {
                user.setPreviousResults(true);
                userRepository.save(user);
            });
            return new ResponseEntity<>("Analysed successfully", HttpStatus.OK);
        }

        return new ResponseEntity<>("Invalid document", HttpStatus.NOT_ACCEPTABLE);
    }

    public ResponseEntity<?> getLastReport() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        AnalysisReport report = analysisReportRepository.findById(userEmail).orElse(null);

        if (report == null) {
            return new ResponseEntity<>("No previous analysis", HttpStatus.NOT_FOUND);
        }

        List<Job> jobs = fetchJobSuggestions(report.getRoles());
        AnalysisResultDto result = new AnalysisResultDto(
                report.getScore(), report.getAtsoptimizationscore(),
                report.getPros(), report.getCons(), report.getSuggestions(), jobs);

        return ResponseEntity.ok(result);
    }

    public ResponseEntity<?> logout() {
        HttpHeaders headers = new HttpHeaders();
        ResponseCookie expiredCookie = ResponseCookie.from("entrypasstoken", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .maxAge(0)
                .path("/")
                .build();
        headers.add(HttpHeaders.SET_COOKIE, expiredCookie.toString());
        return new ResponseEntity<>("Successfully logged out", headers, HttpStatus.OK);
    }

    public ResponseEntity<?> deleteAccount() {
        try {
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            analysisReportRepository.deleteById(userEmail);
            userRepository.deleteById(userEmail);

            HttpHeaders headers = new HttpHeaders();
            ResponseCookie expiredCookie = ResponseCookie.from("entrypasstoken", "")
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .sameSite("Strict")
                    .maxAge(0)
                    .path("/")
                    .build();
            headers.add(HttpHeaders.SET_COOKIE, expiredCookie.toString());
            return new ResponseEntity<>("Account deleted successfully", headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to delete account: {}", e.getMessage());
            return new ResponseEntity<>("Failed to delete account", HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<?> validateToken() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findById(userEmail).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid token");
        }
        LoginResponse loginResponse = new LoginResponse(user.getUsername(), user.getPreviousResults());
        return new ResponseEntity<>(loginResponse, HttpStatus.OK);
    }

    // ── Private helpers ─────────────────────────────────────────────────────────

    private String callGeminiWithRetry(String roles, String resumeText) throws InterruptedException {
        Client client = Client.builder().apiKey(genKey).build();
        Content content = Content.builder()
                .parts(Part.fromText(resumeText), Part.fromText(buildPrompt(roles)))
                .build();

        for (int attempt = 1; attempt <= MAX_GEMINI_ATTEMPTS; attempt++) {
            try {
                GenerateContentConfig config = GenerateContentConfig.builder()
                        .temperature(0.0f)
                        .thinkingConfig(ThinkingConfig.builder()
                                .thinkingLevel(ThinkingLevel.Known.HIGH)
                                .includeThoughts(true)
                                .build())
                        .build();
                GenerateContentResponse response = client.models.generateContent("gemini-3.5-flash-lite", content, config);
                if (response.text() == null || response.text().isBlank()) {
                    throw new IllegalStateException("Gemini returned an empty response");
                }
                return response.text();
            } catch (Exception e) {
                log.warn("Gemini API call {} of {} failed: {}", attempt, MAX_GEMINI_ATTEMPTS, e.getMessage());
                if (attempt < MAX_GEMINI_ATTEMPTS) {
                    Thread.sleep(1500L * attempt);
                }
            }
        }
        throw new IllegalStateException("Gemini API is unavailable after " + MAX_GEMINI_ATTEMPTS + " attempts");
    }

    private List<Job> fetchJobSuggestions(String roles) {
        if (applicationId == null || applicationId.isBlank()
                || applicationApiKey == null || applicationApiKey.isBlank()) {
            return new ArrayList<>();
        }
        String url = UriComponentsBuilder.fromUriString("https://api.adzuna.com/v1/api/jobs/in/search/1")
                .queryParam("app_id", applicationId)
                .queryParam("app_key", applicationApiKey)
                .queryParam("what", roles)
                .queryParam("content-type", "application/json")
                .toUriString();
        try {
            JobSearchResponse response = new RestTemplate().getForObject(url, JobSearchResponse.class);
            return response != null ? response.getResults() : new ArrayList<>();
        } catch (Exception e) {
            log.warn("Job suggestions fetch failed: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private String buildPrompt(String roles) {
        return "You are now an advanced enterprise-grade ATS resume checker, brutally honest career auditor, hiring-manager brain, and growth strategist combined. Your task is to analyze the given resume strictly based on industry-level ATS standards and evaluate it for the specified roles. The evaluation should be moderate to strict (not lenient). A resume should only receive a score between 90 and 100 if it is nearly perfect across all aspects and the content is highly relevant to the specified roles. If any section content is irrelevant to the role, give zero points for that section.\n"
                + "\nBefore analyzing, ensure the roles and resume content match each other and that the resume content is actual content of a real resume (refer: 1. rules and instructions). If it is unrelated, simply treat it as irrelevant content and follow the instructions for irrelevant content. "
                + "Analyze this resume for roles: " + roles + "\n"
                + "Resume Content:\n"
                + "\n"
                + "Rules and Instructions:\n"
                + "1. Evaluation Categories and Score Allocation (Total 100 points, conditional on role relevance):\n"
                + "- Contact Information (name, email, phone, LinkedIn/GitHub) – 15 points (always scored if present)\n"
                + "- Professional Summary / Objective – 10 points (only score if aligned with role)\n"
                + "- Skills (hard skills, tools, technologies) – 7 points (zero if skills not relevant to role)\n"
                + "- Education (degree, college, graduation year) – 10 points (score only if relevant for role)\n"
                + "- Achievements / Projects (relevant and measurable) – 15 points (zero if not relevant to role)\n"
                + "- Keywords / ATS readiness – 10 points (score only for role-relevant keywords)\n"
                + "- Formatting / Presentation – 5 points (always scored if well formatted)\n"
                + "- No grammatical or spelling mistakes (deduct 5 points if any) – 10 points\n"
                + "- Basic resume evaluation (must meet ATS parsing requirements) – 10 points (score only if structured properly for role content)\n"
                + "- Professional structure and proper layout – 5 points (always scored if proper layout)\n"
                + "- Skills matched with roles – 8 points (zero if skills do not match role)\n"
                + "\n"
                + "2. ATS Optimization Score (0-100):\n"
                + "- Score separately based on ATS parsing readiness, keyword usage, readability, section clarity, lack of graphics/tables, content relevance, and alignment with target role.\n"
                + "- If resume contains irrelevant content for the role, give 0 for the atsoptimizationscore.\n"
                + "\n"
                + "3. Scoring Philosophy:\n"
                + "- Be strict with scoring.\n"
                + "- A resume should only score 90–100 if nearly flawless and fully relevant to the role.\n"
                + "- If any section content is irrelevant to the role, assign zero points for that section.\n"
                + "- 50–89 → Resume is partially relevant but may lack keywords, formatting, or role alignment.\n"
                + "- Below 50 → Resume has significant relevance or ATS issues.\n"
                + "\n"
                + "4. Evaluation Criteria (industrial ATS rules, all relevance-dependent):\n"
                + "- Proper headings: Contact Information, Summary, Skills, Education, Experience, Projects, Achievements.\n"
                + "- Bullet points for readability.\n"
                + "- No images, graphics, or tables that disrupt ATS parsing.\n"
                + "- Chronological or functional structure.\n"
                + "- Action-oriented language in achievements.\n"
                + "- Only include role-relevant keywords; irrelevant keywords give zero points.\n"
                + "- Balanced hard skills (technical) and soft skills relevant to role.\n"
                + "- Professional formatting: consistent fonts, bold section titles, simple layout.\n"
                + "- Concise, measurable content; no long irrelevant descriptions.\n"
                + "- No spelling or grammar mistakes.\n"
                + "- Education and work history clearly structured with dates and relevant to role.\n"
                + "\n"
                + "5. Irrelevant content:\n"
                + "- If the resume is completely irrelevant to the role, return score and atsoptimizationscore as 0, and empty arrays for pros, cons, and suggestions.\n"
                + "\n"
                + "6. Output Format and Constraints:\n"
                + "- You MUST cover ALL pros and ALL cons found in the resume. Do not truncate or summarize them into a short list.\n"
                + "- the 'pros', 'cons', and 'suggestions' arrays may have different sizes (no of elements) based on resume quality ex : (good resume has more points in 'pros' and bad resume has less points in 'pros') and minimum of 5 elements to 8 elements in each array and also make sure that not all '3 arrays have same sizes' . \n"
                + "- For each individual point, break it down into a short, atomic sentence .\n"
                + "- Inside the 'pros', 'cons', and 'suggestions' arrays, each text string element MUST be strictly under 275 characters and above 50 characters .\n"
                + "- The text strings must contain clean alphanumeric text only.\n"
                + "- Do not include any conversational preambles, introductions, or trailing explanations outside the JSON structure."
                + "{\n"
                + "  \"score\": number,\n"
                + "  \"atsoptimizationscore\": number,\n"
                + "  \"pros\": [array of strings],\n"
                + "  \"cons\": [array of strings],\n"
                + "  \"suggestions\": [array of strings]\n"
                + "}\n";
    }
}
