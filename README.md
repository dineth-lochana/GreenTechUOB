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
| Dhananjaya Dilshan | 1.Home page<br>  2.footer seaction <br>  3.AI education seaction/FAQ <br>  4.Chatbote<br> 5. Github Actions Eslint and Jest Workflow<br>|
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
## Security Report
Last Updated: 2025-03-05 05:40:23 UTC

### Semgrep Findings
```
```

### OWASP Dependency Check
```
```

### Trivy Scan Results
```
```
