package com.ai.Resume.analyser.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaForwardController {

    /** Forward all SPA routes to index.html so React Router handles them client-side. */
    @RequestMapping(value = {"/", "/login", "/forgotpassword", "/upload", "/analysereport"})
    public String forwardToSpa() {
        return "forward:/index.html";
    }
}
