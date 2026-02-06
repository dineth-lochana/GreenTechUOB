# GreenTechUOB CS01
 
## Group Members  
| Member | UOB Number | Role | 
|----------|----------|----------| 
| Dineth Mallawarachchi | 2424617 | Project Manager |
| Shehan Sangeeth | 2425073 | Risk Manager |
| Dhananjaya Dilshan | 2425008 | Quality Manager | 
| Dineth Jayawickrama | 2425041 | Scheduling Manager | 
| Imasha Dissanayaka  | 2425088 | Startup Manager | 

## Feature Implementation Breakdown
| Member | Feature |
|----------|----------|
| Dineth Mallawarachchi | 1. Authentication<br> 2. Scaffolding Client and Server<br> 3. Variable Drives (Create, View, Delete, Update)<br> 4. Ranking for Variable Drives<br> 5. Implementing HashRouter for Client Deployment<br> 6. All Server Deployment Pipelines<br> 7. All Github Actions Workflow<br> 8. Implementing Compliance Test Workflows<br>  9. Firebase Integeration<br> |
| Shehan Sangeeth |1.Fire Safety Products (Search, Create, View, Delete, Update)<br> 2.Solar Calculator<br> | 
| Dhananjaya Dilshan | 1.Home page<br>  2.footer seaction <br>  3.AI education seaction/FAQ <br>  4.Chatbote<br> 5. Github Actions Eslint and Jest Workflow<br> 6.Github Actions Google lighthouse <br>|
| Dineth Jayawickrama | 1.Past Projects (Create, View, Delete, Update) |
| Imasha Dissanayaka  |1. Solar Products (Search, Create, View, Delete, Update)

## Planned implementation of Features (Subject to Change)
1. SQLite is used as the primary DB.
2. Presently image uploading is handled by SQLite as well.
3. HashRouter is used to ensure that compiled version of this can run in the GreenTech Server, which is a static file based server.
4. When you are adding new features make sure that it works with the (npm run build) static build. If it doesn't work in the static build then we can't host it!
   
## Testing your Features
1. Run a production build (npm run build).

   ![image](https://github.com/user-attachments/assets/fc63c931-e452-4d62-b558-c71ba9b03eec)
2. Then open a static file server in the dists folder as follows. Using Python's built in server is easy!
   ![image](https://github.com/user-attachments/assets/6f7f8276-f27c-47b9-b8c4-8a9607e0ddf3)
3. Check that your feature works in the build as well (Python server is localhost:8000)
4. Success! The Production Build is working!

## Security Scan Report 🛡️
Last Updated: 2026-02-06 04:26:41 UTC

### Semgrep Findings
✅ Semgrep Scan Passed
```
No Semgrep results found
```

### OWASP Dependency Check
✅ Dependency Scan Passed
```
```

### Trivy Vulnerability Scan
✅ Trivy Scan Passed
```
- Package: react-router
Installed Version: 7.5.2
Vulnerability CVE-2025-59057
Severity: HIGH
Fixed Version: 7.9.0
Link: [CVE-2025-59057](https://avd.aquasec.com/nvd/cve-2025-59057)
- Package: react-router
Installed Version: 7.5.2
Vulnerability CVE-2026-21884
Severity: HIGH
Fixed Version: 7.12.0
Link: [CVE-2026-21884](https://avd.aquasec.com/nvd/cve-2026-21884)
- Package: react-router
Installed Version: 7.5.2
Vulnerability CVE-2026-22029
Severity: HIGH
Fixed Version: 7.12.0
Link: [CVE-2026-22029](https://avd.aquasec.com/nvd/cve-2026-22029)
- Package: react-router
Installed Version: 7.5.2
Vulnerability CVE-2025-68470
Severity: MEDIUM
Fixed Version: 6.30.2, 7.9.6
Link: [CVE-2025-68470](https://avd.aquasec.com/nvd/cve-2025-68470)
- Package: react-router
Installed Version: 7.5.2
Vulnerability CVE-2026-22030
Severity: MEDIUM
Fixed Version: 7.12.0
Link: [CVE-2026-22030](https://avd.aquasec.com/nvd/cve-2026-22030)
- Package: sweetalert2
Installed Version: 11.17.2
Vulnerability GHSA-457r-cqc8-9vj9
Severity: LOW
Fixed Version: 11.22.4
Link: [GHSA-457r-cqc8-9vj9](https://github.com/advisories/GHSA-457r-cqc8-9vj9)
- Package: sweetalert2
Installed Version: 11.17.2
Vulnerability GHSA-8jh9-wqpf-q52c
Severity: LOW
Fixed Version: 11.22.4
Link: [GHSA-8jh9-wqpf-q52c](https://github.com/advisories/GHSA-8jh9-wqpf-q52c)
- Package: sweetalert2
Installed Version: 11.17.2
Vulnerability GHSA-mrr8-v49w-3333
Severity: LOW
Fixed Version: 11.22.4
Link: [GHSA-mrr8-v49w-3333](https://github.com/advisories/GHSA-mrr8-v49w-3333)
- Package: sweetalert2
Installed Version: 11.17.2
Vulnerability GHSA-pg98-6v7f-2xfv
Severity: LOW
Fixed Version: 11.22.4
Link: [GHSA-pg98-6v7f-2xfv](https://github.com/advisories/GHSA-pg98-6v7f-2xfv)
- Package: sweetalert2
Installed Version: 11.17.2
Vulnerability GHSA-qq6h-5g6j-q3cm
Severity: LOW
Fixed Version: 11.22.4
Link: [GHSA-qq6h-5g6j-q3cm](https://github.com/advisories/GHSA-qq6h-5g6j-q3cm)
```
### CodeQL Analysis
✅ CodeQL Analysis Results Retrieved
```
Latest CodeQL analysis results are available in the Security tab
```
